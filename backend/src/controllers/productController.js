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
    }
};

module.exports = productController;
