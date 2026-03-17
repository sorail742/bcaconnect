const { Product, Store, Category } = require('../models');

const productController = {
    create: async (req, res, next) => {
        try {
            const { nom_produit, description, prix_unitaire, prix_ancien, stock_quantite, categorie_id, image_url } = req.body;

            const store = await Store.findOne({ where: { proprietaire_id: req.user.id } });
            if (!store) {
                return res.status(403).json({ message: "Vous devez d'abord créer une boutique." });
            }

            const product = await Product.create({
                nom_produit, description, prix_unitaire, prix_ancien,
                stock_quantite, categorie_id, boutique_id: store.id, image_url
            });

            res.status(201).json(product);
        } catch (error) {
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
