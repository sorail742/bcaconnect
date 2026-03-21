const { Store, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Génère un slug unique à partir du nom de boutique
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        + '-' + uuidv4().slice(0, 6);
};

const storeController = {
    create: async (req, res, next) => {
        try {
            const { nom_boutique, description, email_boutique, telephone_boutique, logo_url } = req.body;
            const proprietaire_id = req.user.id;

            // Validation du nom
            if (!nom_boutique || nom_boutique.trim().length < 2) {
                return res.status(422).json({ message: "Le nom de la boutique est obligatoire (min 2 caractères)." });
            }

            // Vérifier si l'utilisateur a déjà une boutique
            const existingStore = await Store.findOne({ where: { proprietaire_id } });
            if (existingStore) {
                return res.status(400).json({
                    message: "Vous possédez déjà une boutique.",
                    store: existingStore
                });
            }

            const slug = generateSlug(nom_boutique);

            const store = await Store.create({
                nom_boutique: nom_boutique.trim(),
                description: description || null,
                email_boutique: email_boutique || null,
                telephone_boutique: telephone_boutique || null,
                logo_url: logo_url || null,
                proprietaire_id,
                slug
            });

            console.log(`✅ Boutique créée : ${store.nom_boutique} (slug: ${store.slug}) par user ${proprietaire_id}`);

            res.status(201).json({
                id: store.id,
                nom_boutique: store.nom_boutique,
                slug: store.slug,
                description: store.description,
                email_boutique: store.email_boutique,
                telephone_boutique: store.telephone_boutique,
                logo_url: store.logo_url,
                statut: store.statut,
                createdAt: store.createdAt
            });
        } catch (error) {
            // Gestion erreur de contrainte unique (slug déjà pris)
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    message: "Une boutique avec ce nom existe déjà. Essayez un nom légèrement différent."
                });
            }
            console.error('❌ Erreur création boutique:', error.message);
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
