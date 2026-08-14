const { Op } = require('sequelize');
const { validate: isUuid } = require('uuid');
const AppError = require('../../utils/AppError');
const subscriptionService = require('../../services/subscriptionService');
const { recordDeletion } = require('../../deletion-log/service/deletionLog.service');
const productRepository = require('../repository/product.repository');
// NOTE: touche directement le modèle Notification (feature `notification`, pas
// encore migrée) — à remplacer par un appel à notificationService plus tard.
const { Notification } = require('../../models');

const MAX_PRODUCT_IMAGES = 8;

/** Remplace la galerie d'un produit par la liste d'URLs fournie (ordre conservé). */
const syncProductImages = async (produitId, images) => {
    if (!Array.isArray(images)) return;
    const urls = images.filter((u) => typeof u === 'string' && u.trim()).slice(0, MAX_PRODUCT_IMAGES);
    await productRepository.destroyImages(produitId);
    if (urls.length > 0) {
        await productRepository.bulkCreateImages(urls.map((url_image, ordre) => ({ produit_id: produitId, url_image, ordre })));
    }
};

const productService = {
    async create({ nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url, images, est_local, unite_mesure, mots_cles, marque, preferences_ia, est_numerique, contenu_numerique }, user, io) {
        // Validation minimale
        if (!nom_produit || nom_produit.trim().length < 3) {
            throw new AppError("Le nom du produit doit contenir au moins 3 caractères.", 422);
        }
        if (!prix_unitaire || parseFloat(prix_unitaire) <= 0) {
            throw new AppError("Le prix doit être supérieur à 0 GNF.", 422);
        }
        if (!categorie_id) {
            throw new AppError("La catégorie est obligatoire. Veuillez en sélectionner une.", 422);
        }

        // Vérifier si la catégorie existe
        const cat = await productRepository.findCategoryById(categorie_id);
        if (!cat) {
            throw new AppError("La catégorie sélectionnée est invalide.", 422);
        }

        let store = await productRepository.findStoreByOwner(user.id);

        // Si l'admin n'a pas de boutique, on lui permet d'utiliser la première boutique trouvée
        if (!store && user.role === 'admin') {
            store = await productRepository.findFirstStore();
        }

        if (!store) {
            throw new AppError("Action impossible : Aucune boutique n'est configurée dans le système.", 403);
        }

        // Plafond du plan gratuit — le plan "pro" (payant) débloque les fiches illimitées.
        await subscriptionService.ensurePlanStatus(store);
        if (!subscriptionService.isPlanActive(store)) {
            const productCount = await productRepository.countByStoreId(store.id);
            if (productCount >= subscriptionService.FREE_TIER_PRODUCT_LIMIT) {
                throw new AppError(
                    `Plan gratuit limité à ${subscriptionService.FREE_TIER_PRODUCT_LIMIT} produits. Passez à la boutique Pro pour publier sans limite.`,
                    402,
                );
            }
        }

        const imagesList = Array.isArray(images) ? images.filter((u) => typeof u === 'string' && u.trim()) : [];
        const coverImage = image_url?.trim() || imagesList[0] || null;

        const product = await productRepository.create({
            nom_produit: nom_produit.trim(),
            description: description?.trim() || null,
            prix_unitaire: parseFloat(prix_unitaire),
            prix_ancien: prix_ancien ? parseFloat(prix_ancien) : null,
            stock_quantite: parseInt(stock_quantite ?? 0),
            categorie_id: categorie_id || null,
            boutique_id: store.id,
            image_url: coverImage,
            est_local: est_local !== undefined ? est_local : true,
            unite_mesure: unite_mesure || 'Pièce',
            mots_cles: typeof mots_cles === 'string'
                ? mots_cles.split(',').map(m => m.trim()).filter(m => m)
                : (mots_cles || []),
            marque: marque?.trim() || null,
            preferences_ia: preferences_ia || {},
            est_numerique: !!est_numerique,
            contenu_numerique: est_numerique ? (contenu_numerique?.trim() || null) : null,
        });

        // Galerie multi-images (style Alibaba) — si absente, on reprend la couverture
        // pour que product.images ne soit jamais vide côté affichage.
        await syncProductImages(product.id, imagesList.length > 0 ? imagesList : (coverImage ? [coverImage] : []));

        // Recharger avec les associations pour la réponse complète
        const fullProduct = await productRepository.findByIdWithCategoryAndImages(product.id);

        // ⚡ TEMPS RÉEL : Émettre l'événement
        if (io) {
            io.emit('product_added', fullProduct);
            io.emit('new_post', {
                id: fullProduct.id,
                type: 'product',
                titre: fullProduct.nom,
                message: `Nouveau produit disponible: ${fullProduct.nom}`
            });
        }

        // 🔔 NOTIFICATION
        const notif = await Notification.create({
            utilisateur_id: user.id,
            titre: "Produit publié !",
            message: `Votre produit <span class="font-black text-primary">${fullProduct.nom_produit}</span> est maintenant en ligne.`,
            type: 'system'
        });

        if (io) {
            io.to(user.id).emit('notification_received', notif);
        }

        return fullProduct;
    },

    async getAll(query, pagination) {
        const {
            search = '',
            categorie_id = '',
            min_price = 0,
            max_price = 1000000000,
            sort = 'newest',
            condition = '',
            marque = '',
            is_verified = 'false',
            boutique_id = '',
            exclude_id = '',
        } = query;

        const page = pagination?.page
            ?? Math.max(1, parseInt(query.page, 10) || 1);
        const limit = pagination?.limit
            ?? Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));

        const offset = (page - 1) * limit;
        const where = {};

        // Filtres textuels
        if (search) {
            where[Op.or] = [
                { nom_produit: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filtre par catégorie
        if (categorie_id && categorie_id !== 'Tous') {
            where.categorie_id = categorie_id;
        }

        // Filtre par prix
        where.prix_unitaire = {
            [Op.between]: [parseFloat(min_price), parseFloat(max_price)]
        };

        // Filtre par condition
        if (condition) {
            where.condition = condition;
        }

        // Filtre par marque
        if (marque) {
            where.marque = marque;
        }


        // Filtre par boutique ("plus de produits de ce vendeur")
        if (boutique_id && isUuid(boutique_id)) {
            where.boutique_id = boutique_id;
        }

        // Exclure un produit précis (ex: le produit courant dans les suggestions)
        if (exclude_id && isUuid(exclude_id)) {
            where.id = { [Op.ne]: exclude_id };
        }

        // Logique de tri
        let order = [['createdAt', 'DESC']];
        if (sort === 'price_asc') order = [['prix_unitaire', 'ASC']];
        if (sort === 'price_desc') order = [['prix_unitaire', 'DESC']];
        if (sort === 'popular') order = [['stock_quantite', 'DESC']];

        const { count, rows: products } = await productRepository.findAndCountAllFiltered({
            where,
            order,
            limit,
            offset,
            isVerifiedOnly: is_verified === 'true',
        });

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: page,
            products
        };
    },

    // Produits du vendeur connecté
    async getMyProducts(ownerId) {
        const store = await productRepository.findStoreByOwner(ownerId);
        if (!store) return [];

        return productRepository.findAllByStoreId(store.id);
    },

    async getById(id) {
        if (!isUuid(id)) {
            throw new AppError("Format d'identifiant invalide.", 400);
        }
        const product = await productRepository.findByIdFull(id);
        if (!product) throw new AppError("Produit non trouvé.", 404);

        const plain = product.toJSON();

        if (plain.boutique?.id) {
            // Note réelle du vendeur calculée sur l'ensemble de ses avis produits
            // (et non la colonne statique Store.rating, valeur par défaut fictive).
            const [ratingAgg, nbProduits] = await Promise.all([
                productRepository.findStoreRatingAgg(plain.boutique.id),
                productRepository.countByStoreId(plain.boutique.id),
            ]);
            plain.boutique.rating_reel = ratingAgg?.avg_note ? Math.round(parseFloat(ratingAgg.avg_note) * 10) / 10 : null;
            plain.boutique.nb_avis = parseInt(ratingAgg?.nb_avis, 10) || 0;
            plain.boutique.nb_produits = nbProduits;
        }

        return plain;
    },

    async update(id, { nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url, images, est_local, unite_mesure, mots_cles, marque, preferences_ia, est_numerique, contenu_numerique }, user) {
        if (!isUuid(id)) {
            throw new AppError("Format d'identifiant invalide.", 400);
        }
        const product = await productRepository.findByIdWithStore(id);

        if (!product) throw new AppError('Produit non trouvé.', 404);
        if (product.boutique.proprietaire_id !== user.id && user.role !== 'admin') {
            throw new AppError('Action non autorisée.', 403);
        }

        const imagesList = Array.isArray(images) ? images.filter((u) => typeof u === 'string' && u.trim()) : null;
        const coverImage = image_url ?? (imagesList ? imagesList[0] : product.image_url);

        await productRepository.updateInstance(product, {
            nom_produit: nom_produit ?? product.nom_produit,
            description: description ?? product.description,
            prix_unitaire: prix_unitaire ?? product.prix_unitaire,
            prix_ancien: prix_ancien ?? product.prix_ancien,
            stock_quantite: stock_quantite !== undefined ? stock_quantite : product.stock_quantite,
            categorie_id: categorie_id ?? product.categorie_id,
            image_url: coverImage,
            est_local: est_local !== undefined ? est_local : product.est_local,
            unite_mesure: unite_mesure ?? product.unite_mesure,
            mots_cles: mots_cles !== undefined
                ? (typeof mots_cles === 'string'
                    ? mots_cles.split(',').map(m => m.trim()).filter(m => m)
                    : mots_cles)
                : product.mots_cles,
            marque: marque !== undefined ? marque?.trim() || null : product.marque,
            preferences_ia: preferences_ia !== undefined ? preferences_ia : product.preferences_ia,
            est_numerique: est_numerique !== undefined ? !!est_numerique : product.est_numerique,
            contenu_numerique: contenu_numerique !== undefined ? (contenu_numerique?.trim() || null) : product.contenu_numerique,
        });

        // Galerie multi-images : uniquement remplacée si le vendeur en a envoyé une
        // nouvelle liste (permet de modifier le texte du produit sans y toucher).
        if (imagesList !== null) {
            await syncProductImages(product.id, imagesList.length > 0 ? imagesList : (coverImage ? [coverImage] : []));
        }

        const fullProduct = await productRepository.findByIdWithStoreAndImages(product.id);
        return { message: 'Produit mis à jour.', product: fullProduct };
    },

    // Mise à jour rapide du stock uniquement
    async patchStock(id, stock_quantite, user) {
        if (!isUuid(id)) {
            throw new AppError("Format d'identifiant invalide.", 400);
        }
        const product = await productRepository.findByIdWithStore(id);

        if (!product) throw new AppError('Produit non trouvé.', 404);
        if (product.boutique.proprietaire_id !== user.id && user.role !== 'admin') {
            throw new AppError('Action non autorisée.', 403);
        }

        await productRepository.updateInstance(product, { stock_quantite });
        return { message: 'Stock mis à jour.', stock_quantite: product.stock_quantite };
    },

    // Configuration du réapprovisionnement automatique (analyse concurrentielle #4)
    async patchReappro(id, { reappro_auto_actif, reappro_seuil, reappro_quantite }, user) {
        if (!isUuid(id)) {
            throw new AppError("Format d'identifiant invalide.", 400);
        }
        const product = await productRepository.findByIdWithStore(id);

        if (!product) throw new AppError('Produit non trouvé.', 404);
        if (product.boutique.proprietaire_id !== user.id && user.role !== 'admin') {
            throw new AppError('Action non autorisée.', 403);
        }

        if (reappro_auto_actif && (!reappro_seuil || !reappro_quantite || reappro_quantite <= 0 || reappro_seuil < 0)) {
            throw new AppError('Seuil et quantité de réapprovisionnement requis (> 0) pour activer le réapprovisionnement automatique.', 400);
        }

        await productRepository.updateInstance(product, {
            reappro_auto_actif: !!reappro_auto_actif,
            reappro_seuil: reappro_seuil ?? null,
            reappro_quantite: reappro_quantite ?? null,
        });

        return {
            message: reappro_auto_actif ? 'Réapprovisionnement automatique activé.' : 'Réapprovisionnement automatique désactivé.',
            reappro_auto_actif: product.reappro_auto_actif,
            reappro_seuil: product.reappro_seuil,
            reappro_quantite: product.reappro_quantite,
        };
    },

    async delete(id, user, req) {
        if (!isUuid(id)) {
            throw new AppError("Format d'identifiant invalide.", 400);
        }
        const product = await productRepository.findByIdWithStoreAndImages(id);

        if (!product) throw new AppError("Produit non trouvé.", 404);

        // Vérifier la propriété (ou admin)
        if (product.boutique.proprietaire_id !== user.id && user.role !== 'admin') {
            throw new AppError("Action non autorisée sur ce produit.", 403);
        }

        await recordDeletion('Product', product, { req });
        await productRepository.destroy(product);
        return { message: "Produit supprimé avec succès." };
    }
};

module.exports = productService;
