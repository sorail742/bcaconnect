const { Store, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

const storeController = {
    create: async (req, res, next) => {
        try {
            const { nom_boutique, description } = req.body;
            const proprietaire_id = req.user.id;

            // Vérifier si l'utilisateur a déjà une boutique
            const existingStore = await Store.findOne({ where: { proprietaire_id } });
            if (existingStore) {
                return res.status(400).json({ message: "Vous possédez déjà une boutique." });
            }

            const slug = nom_boutique.toLowerCase().split(' ').join('-') + '-' + uuidv4().slice(0, 5);

            const store = await Store.create({
                nom_boutique,
                description,
                proprietaire_id,
                slug
            });

            res.status(201).json(store);
        } catch (error) {
            next(error);
        }
    },

    getMyStore: async (req, res, next) => {
        try {
            const store = await Store.findOne({
                where: { proprietaire_id: req.user.id },
                include: ['produits']
            });
            if (!store) return res.status(404).json({ message: "Boutique non trouvée." });
            res.json(store);
        } catch (error) {
            next(error);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const stores = await Store.findAll({
                where: { statut: 'actif' },
                include: [{ model: User, attributes: ['nom_complet'] }]
            });
            res.json(stores);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const store = await Store.findByPk(id, {
                include: ['produits', { model: User, attributes: ['nom_complet'] }]
            });
            if (!store) return res.status(404).json({ message: "Boutique non trouvée." });
            res.json(store);
        } catch (error) {
            next(error);
        }
    },

    updateMyStore: async (req, res, next) => {
        try {
            const { nom_boutique, description, email_boutique, telephone_boutique, logo_url } = req.body;
            const proprietaire_id = req.user.id;

            const store = await Store.findOne({ where: { proprietaire_id } });
            if (!store) return res.status(404).json({ message: "Boutique non trouvée." });

            const updatedStore = await store.update({
                nom_boutique,
                description,
                email_boutique,
                telephone_boutique,
                logo_url
            });

            res.json(updatedStore);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = storeController;
