const { Product, Store, Category, Notification, Review } = require('../models');
const { Op, Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { validate: isUuid } = require('uuid');

const productController = {
    create: catchAsync(async (req, res, next) => {
        const { nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url, est_local, unite_mesure, mots_cles, marque, preferences_ia } = req.body;

        // Validation minimale
        if (!nom_produit || nom_produit.trim().length < 3) {
            return next(new AppError("Le nom du produit doit contenir au moins 3 caractères.", 422));
        }
        if (!prix_unitaire || parseFloat(prix_unitaire) <= 0) {
            return next(new AppError("Le prix doit être supérieur à 0 GNF.", 422));
        }
        if (!categorie_id) {
            return next(new AppError("La catégorie est obligatoire. Veuillez en sélectionner une.", 422));
        }

        // Vérifier si la catégorie existe
        const cat = await Category.findByPk(categorie_id);
        if (!cat) {
            return next(new AppError("La catégorie sélectionnée est invalide.", 422));
        }

        let store = await Store.findOne({ where: { proprietaire_id: req.user.id } });

        // Si l'admin n'a pas de boutique, on lui permet d'utiliser la première boutique trouvée
        if (!store && req.user.role === 'admin') {
            store = await Store.findOne();
        }

        if (!store) {
            return next(new AppError("Action impossible : Aucune boutique n'est configurée dans le système.", 403));
        }

        const product = await Product.create({
            nom_produit: nom_produit.trim(),
            description: description?.trim() || null,
            prix_unitaire: parseFloat(prix_unitaire),
            prix_ancien: prix_ancien ? parseFloat(prix_ancien) : null,
            stock_quantite: parseInt(stock_quantite ?? 0),
            categorie_id: categorie_id || null,
            boutique_id: store.id,
            image_url: image_url?.trim() || null,
            est_local: est_local !== undefined ? est_local : true,
            unite_mesure: unite_mesure || 'Pièce',
            mots_cles: typeof mots_cles === 'string' 
                ? mots_cles.split(',').map(m => m.trim()).filter(m => m)
                : (mots_cles || []),
            marque: marque?.trim() || null,
            preferences_ia: preferences_ia || {}
        });

        // Recharger avec les associations pour la réponse complète
        const fullProduct = await Product.findByPk(product.id, {
            include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }]
        });

        // ⚡ TEMPS RÉEL : Émettre l'événement
        const io = req.app.get('socketio');
        if (io) {
            io.emit('product_added', fullProduct);
        }

        // 🔔 NOTIFICATION
        const notif = await Notification.create({
            utilisateur_id: req.user.id,
            titre: "Produit publié !",
            message: `Votre produit <span class="font-black text-primary">${fullProduct.nom_produit}</span> est maintenant en ligne.`,
            type: 'system'
        });

        if (io) {
            io.to(req.user.id).emit('notification_received', notif);
        }

        res.status(201).json(fullProduct);
    }),

    getAll: catchAsync(async (req, res, next) => {
        const { 
            page = 1, 
            limit = 20, 
            search = '', 
            categorie_id = '', 
            min_price = 0, 
            max_price = 1000000000, 
            sort = 'newest',
            condition = '',
            marque = '',
            is_verified = 'false',
            featured = 'false'
        } = req.query;
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
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
        
        // Logique de tri
        let order = [['createdAt', 'DESC']];
        if (sort === 'price_asc') order = [['prix_unitaire', 'ASC']];
        if (sort === 'price_desc') order = [['prix_unitaire', 'DESC']];
        if (sort === 'popular') order = [['stock_quantite', 'DESC']];

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [
                { 
                    model: Store, 
                    as: 'boutique', 
                    attributes: ['nom_boutique', 'slug', 'id', 'logo_url', 'is_verified', 'proprietaire_id'],
                    where: is_verified === 'true' ? { is_verified: true } : {}
                },
                { model: Category, as: 'categorie', attributes: ['nom_categorie'] },
                { model: Review, as: 'avis', attributes: ['note'] }
            ],
            order,
            limit: parseInt(limit),
            offset
        });

        res.json({
            total: count,
            pages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            products
        });
    }),

    // Produits du vendeur connecté
    getMyProducts: catchAsync(async (req, res, next) => {
        const store = await Store.findOne({ where: { proprietaire_id: req.user.id } });
        if (!store) return res.json([]);

        const products = await Product.findAll({
            where: { boutique_id: store.id },
            include: [
                { model: Store, as: 'boutique', attributes: ['nom_boutique', 'slug', 'id'] },
                { model: Category, as: 'categorie', attributes: ['nom_categorie'] },
                { model: Review, as: 'avis', attributes: ['note', 'commentaire', 'utilisateur_id', 'created_at', 'ia_sentiment'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    }),

    getById: catchAsync(async (req, res, next) => {
        if (!isUuid(req.params.id)) {
            return next(new AppError("Format d'identifiant invalide.", 400));
        }
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'categorie' },
                { model: Store, as: 'boutique', attributes: ['nom_boutique', 'slug', 'id', 'proprietaire_id'] },
                { model: Review, as: 'avis', attributes: ['note', 'commentaire', 'utilisateur_id', 'created_at', 'ia_sentiment'] }
            ]
        });
        if (!product) return next(new AppError("Produit non trouvé.", 404));
        res.json(product);
    }),

    update: catchAsync(async (req, res, next) => {
        if (!isUuid(req.params.id)) {
            return next(new AppError("Format d'identifiant invalide.", 400));
        }
        const { nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url, est_local, unite_mesure, mots_cles, marque, preferences_ia } = req.body;
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Store, as: 'boutique' }]
        });

        if (!product) return next(new AppError('Produit non trouvé.', 404));
        if (product.boutique.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('Action non autorisée.', 403));
        }

        await product.update({
            nom_produit: nom_produit ?? product.nom_produit,
            description: description ?? product.description,
            prix_unitaire: prix_unitaire ?? product.prix_unitaire,
            prix_ancien: prix_ancien ?? product.prix_ancien,
            stock_quantite: stock_quantite !== undefined ? stock_quantite : product.stock_quantite,
            categorie_id: categorie_id ?? product.categorie_id,
            image_url: image_url ?? product.image_url,
            est_local: est_local !== undefined ? est_local : product.est_local,
            unite_mesure: unite_mesure ?? product.unite_mesure,
            mots_cles: mots_cles !== undefined
                ? (typeof mots_cles === 'string' 
                    ? mots_cles.split(',').map(m => m.trim()).filter(m => m)
                    : mots_cles)
                : product.mots_cles,
            marque: marque !== undefined ? marque?.trim() || null : product.marque,
            preferences_ia: preferences_ia !== undefined ? preferences_ia : product.preferences_ia
        });

        res.json({ message: 'Produit mis à jour.', product });
    }),

    // Mise à jour rapide du stock uniquement
    patchStock: catchAsync(async (req, res, next) => {
        if (!isUuid(req.params.id)) {
            return next(new AppError("Format d'identifiant invalide.", 400));
        }
        const { stock_quantite } = req.body;
        const product = await Product.findByPk(req.params.id, { include: [{ model: Store, as: 'boutique' }] });

        if (!product) return next(new AppError('Produit non trouvé.', 404));
        if (product.boutique.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('Action non autorisée.', 403));
        }

        await product.update({ stock_quantite });
        res.json({ message: 'Stock mis à jour.', stock_quantite: product.stock_quantite });
    }),

    delete: catchAsync(async (req, res, next) => {
        if (!isUuid(req.params.id)) {
            return next(new AppError("Format d'identifiant invalide.", 400));
        }
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Store, as: 'boutique' }]
        });

        if (!product) return next(new AppError("Produit non trouvé.", 404));

        // Vérifier la propriété (ou admin)
        if (product.boutique.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError("Action non autorisée sur ce produit.", 403));
        }

        await product.destroy();
        res.json({ message: "Produit supprimé avec succès." });
    })
};

module.exports = productController;
