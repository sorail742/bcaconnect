const { Product, Store, Category, Notification } = require('../models');

const productController = {
    create: async (req, res, next) => {
        try {
            const { nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url, est_local } = req.body;

            // Validation minimale
            if (!nom_produit || nom_produit.trim().length < 3) {
                return res.status(422).json({ message: "Le nom du produit doit contenir au moins 3 caractères." });
            }
            if (!prix_unitaire || parseFloat(prix_unitaire) <= 0) {
                return res.status(422).json({ message: "Le prix doit être supérieur à 0 GNF." });
            }
            if (!categorie_id) {
                return res.status(422).json({ message: "La catégorie est obligatoire. Veuillez en sélectionner une." });
            }

            // Vérifier si la catégorie existe
            const cat = await Category.findByPk(categorie_id);
            if (!cat) {
                return res.status(422).json({ message: "La catégorie sélectionnée est invalide." });
            }

            let store = await Store.findOne({ where: { proprietaire_id: req.user.id } });

            // Si l'admin n'a pas de boutique, on lui permet d'utiliser la première boutique trouvée (ou une spécifiée)
            if (!store && req.user.role === 'admin') {
                store = await Store.findOne();
            }

            if (!store) {
                return res.status(403).json({ message: "Action impossible : Aucune boutique n'est configurée dans le système." });
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
                est_local: est_local !== undefined ? est_local : true
            });

            // Recharger avec les associations pour la réponse complète
            const fullProduct = await Product.findByPk(product.id, {
                include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }]
            });

            // ⚡ TEMPS RÉEL : Émettre l'événement à tous les clients
            const io = req.app.get('socketio');
            if (io) {
                io.emit('product_added', fullProduct);
            }

            // 🔔 NOTIFICATION : Créer une notification pour le vendeur
            const notif = await Notification.create({
                utilisateur_id: req.user.id,
                titre: "Produit publié !",
                message: `Votre produit <span class="font-black text-primary">${fullProduct.nom_produit}</span> est maintenant en ligne.`,
                type: 'system'
            });

            // ⚡ Envoyer la notification en temps réel au vendeur
            if (io) {
                io.to(req.user.id).emit('notification_received', notif);
            }

            console.log(`✅ Produit créé : "${fullProduct.nom_produit}" par user ${req.user.id} (boutique: ${store.nom_boutique})`);

            res.status(201).json(fullProduct);
        } catch (error) {
            console.error('❌ Erreur création produit:', error.message);
            next(error);
        }
    },


    getAll: async (req, res, next) => {
        try {
            const products = await Product.findAll({
                include: [
                    { model: Store, attributes: ['nom_boutique'] },
                    { model: Category, as: 'categorie', attributes: ['nom_categorie'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(products);
        } catch (error) {
            next(error);
        }
    },

    // Produits du vendeur connecté
    getMyProducts: async (req, res, next) => {
        try {
            const store = await Store.findOne({ where: { proprietaire_id: req.user.id } });
            if (!store) return res.json([]);

            const products = await Product.findAll({
                where: { boutique_id: store.id },
                include: [{ model: Category, as: 'categorie', attributes: ['nom_categorie'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(products);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: ['categorie']
            });
            if (!product) return res.status(404).json({ message: "Produit non trouvé." });
            res.json(product);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const { nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url } = req.body;
            const product = await Product.findByPk(req.params.id, {
                include: [{ model: Store }]
            });

            if (!product) return res.status(404).json({ message: 'Produit non trouvé.' });
            if (product.Store.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Action non autorisée.' });
            }

            await product.update({
                nom_produit: nom_produit ?? product.nom_produit,
                description: description ?? product.description,
                prix_unitaire: prix_unitaire ?? product.prix_unitaire,
                prix_ancien: prix_ancien ?? product.prix_ancien,
                stock_quantite: stock_quantite !== undefined ? stock_quantite : product.stock_quantite,
                categorie_id: categorie_id ?? product.categorie_id,
                image_url: image_url ?? product.image_url
            });

            res.json({ message: 'Produit mis à jour.', product });
        } catch (error) {
            next(error);
        }
    },

    // Mise à jour rapide du stock uniquement
    patchStock: async (req, res, next) => {
        try {
            const { stock_quantite } = req.body;
            const product = await Product.findByPk(req.params.id, { include: [{ model: Store }] });

            if (!product) return res.status(404).json({ message: 'Produit non trouvé.' });
            if (product.Store.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Action non autorisée.' });
            }

            await product.update({ stock_quantite });
            res.json({ message: 'Stock mis à jour.', stock_quantite: product.stock_quantite });
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [{ model: Store }]
            });

            if (!product) {
                return res.status(404).json({ message: "Produit non trouvé." });
            }

            // Vérifier la propriété (ou admin)
            if (product.Store.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Action non autorisée sur ce produit." });
            }

            await product.destroy();
            res.json({ message: "Produit supprimé avec succès." });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = productController;
