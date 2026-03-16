const { Product, Store, Category } = require('../models');

const productController = {
    create: async (req, res, next) => {
        try {
            const { nom_produit, description, prix_unitaire, stock_quantite, categorie_id } = req.body;

            // Trouver la boutique de l'utilisateur
            const store = await Store.findOne({ where: { proprietaire_id: req.user.id } });
            if (!store) {
                return res.status(403).json({ message: "Vous devez d'abord créer une boutique." });
            }

            const product = await Product.create({
                nom_produit,
                description,
                prix_unitaire,
                stock_quantite,
                categorie_id,
                boutique_id: store.id
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
                ]
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
            const { nom_produit, description, prix_unitaire, stock_quantite, categorie_id } = req.body;
            const product = await Product.findByPk(req.params.id, {
                include: [{ model: Store }]
            });

            if (!product) {
                return res.status(404).json({ message: "Produit non trouvé." });
            }

            // Vérifier que l'utilisateur est bien le propriétaire de la boutique du produit (ou admin)
            if (product.Store.proprietaire_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Action non autorisée sur ce produit." });
            }

            await product.update({
                nom_produit: nom_produit || product.nom_produit,
                description: description || product.description,
                prix_unitaire: prix_unitaire || product.prix_unitaire,
                stock_quantite: stock_quantite !== undefined ? stock_quantite : product.stock_quantite,
                categorie_id: categorie_id || product.categorie_id
            });

            res.json({ message: "Produit mis à jour avec succès", product });
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
