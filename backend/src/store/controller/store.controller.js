const storeService = require('../service/store.service');

const storeController = {
    create: async (req, res, next) => {
        try {
            const result = await storeService.create(req.body, req.user.id);
            switch (result.outcome) {
                case 'invalid_name':
                    return res.status(422).json({ message: "Le nom de la boutique est obligatoire (min 2 caractères)." });
                case 'already_exists':
                    return res.status(400).json({
                        message: "Vous possédez déjà une boutique.",
                        store: result.store
                    });
                case 'slug_conflict':
                    return res.status(409).json({
                        message: "Une boutique avec ce nom existe déjà. Essayez un nom légèrement différent."
                    });
                default:
                    return res.status(201).json(result.store);
            }
        } catch (error) {
            next(error);
        }
    },

    getMyStore: async (req, res, next) => {
        try {
            const store = await storeService.getMyStore(req.user.id);
            res.json(store);
        } catch (error) {
            next(error);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const result = await storeService.getAll(req.query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const store = await storeService.getById(req.params.id);
            if (!store) return res.status(404).json({ message: "Boutique non trouvée." });
            res.json(store);
        } catch (error) {
            next(error);
        }
    },

    getBySlug: async (req, res, next) => {
        try {
            const store = await storeService.getBySlug(req.params.slug);
            if (!store) return res.status(404).json({ message: "Boutique non trouvée." });
            res.json(store);
        } catch (error) {
            next(error);
        }
    },

    // Carte des clients de ma boutique : géocode approximatif (commune) dérivé de
    // l'adresse déclarée de chaque acheteur distinct ayant déjà commandé un produit
    // de cette boutique.
    getMyClientsMap: async (req, res, next) => {
        try {
            const result = await storeService.getMyClientsMap(req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    updateMyStore: async (req, res, next) => {
        try {
            const result = await storeService.updateMyStore(req.user.id, req.body);
            if (result.outcome === 'not_found') {
                return res.status(404).json({ message: "Boutique non trouvée." });
            }
            res.json(result.store);
        } catch (error) {
            next(error);
        }
    },

    // Abonnement / renouvellement du plan "pro" de ma boutique (débit portefeuille réel).
    subscribe: async (req, res, next) => {
        try {
            const result = await storeService.subscribe(req.user.id);
            switch (result.outcome) {
                case 'not_found':
                    return res.status(404).json({ message: "Boutique non trouvée." });
                case 'insufficient_balance':
                    return res.status(402).json({
                        message: `Solde insuffisant pour l'abonnement (${result.requiredAmount.toLocaleString('fr-FR')} GNF requis).`,
                    });
                case 'no_platform_account':
                    return res.status(500).json({ message: "Paiement impossible : compte plateforme introuvable. Contactez l'administrateur." });
                case 'subscribed':
                    return res.json({ message: 'Abonnement Pro activé.', plan: 'pro', plan_expire_le: result.plan_expire_le });
            }
        } catch (error) {
            next(error);
        }
    }
};

module.exports = storeController;
