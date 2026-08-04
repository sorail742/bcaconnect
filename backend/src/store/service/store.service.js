const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../models');
const { geocodeEncryptedAddress } = require('../../utils/geoUtils');
const subscriptionService = require('../../services/subscriptionService');
const storeRepository = require('../repository/store.repository');

// Plage Unicode des diacritiques combinants (U+0300-U+036F), construite via
// String.fromCharCode plutôt qu'un littéral \uXXXX pour éviter toute
// réinterprétation d'échappement lors des éditions de ce fichier.
const DIACRITICS_RE = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g');

// Génère un slug unique à partir du nom de boutique
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD').replace(DIACRITICS_RE, '') // Supprime les accents
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        + '-' + uuidv4().slice(0, 6);
};

const storeService = {
    async create({ nom_boutique, description, email_boutique, telephone_boutique, logo_url, use_carousel, banner_images, latitude, longitude }, ownerId) {
        if (!nom_boutique || nom_boutique.trim().length < 2) {
            return { outcome: 'invalid_name' };
        }

        const existingStore = await storeRepository.findByOwnerId(ownerId);
        if (existingStore) {
            return { outcome: 'already_exists', store: existingStore };
        }

        const slug = generateSlug(nom_boutique);

        let location = null;
        if (latitude && longitude) {
            location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        }

        try {
            const store = await storeRepository.create({
                nom_boutique: nom_boutique.trim(),
                description: description || null,
                email_boutique: email_boutique || null,
                telephone_boutique: telephone_boutique || null,
                logo_url: logo_url || null,
                use_carousel: use_carousel || false,
                banner_images: banner_images || [],
                location,
                proprietaire_id: ownerId,
                slug
            });

            console.log(`✅ Boutique créée : ${store.nom_boutique} (slug: ${store.slug}) par user ${ownerId}`);

            return {
                outcome: 'created',
                store: {
                    id: store.id,
                    nom_boutique: store.nom_boutique,
                    slug: store.slug,
                    description: store.description,
                    email_boutique: store.email_boutique,
                    telephone_boutique: store.telephone_boutique,
                    logo_url: store.logo_url,
                    use_carousel: store.use_carousel,
                    banner_images: store.banner_images,
                    statut: store.statut,
                    createdAt: store.createdAt
                },
            };
        } catch (error) {
            // Gestion erreur de contrainte unique (slug déjà pris)
            if (error.name === 'SequelizeUniqueConstraintError') {
                return { outcome: 'slug_conflict' };
            }
            console.error('❌ Erreur création boutique:', error.message);
            throw error;
        }
    },

    async getMyStore(ownerId) {
        const store = await storeRepository.findByOwnerIdWithProducts(ownerId);
        if (!store) return null;
        await subscriptionService.ensurePlanStatus(store);
        const plain = store.toJSON();
        plain.subscription_price = subscriptionService.SUBSCRIPTION_PRICE;
        plain.free_tier_limit = subscriptionService.FREE_TIER_PRODUCT_LIMIT;
        return plain;
    },

    async getAll({ search, category, verified } = {}) {
        const stores = await storeRepository.findAllFiltered({ search, category, verified });

        // Note réelle calculée à partir des vrais avis clients (Review.note), et non
        // plus la colonne statique Store.rating (valeur par défaut/fictive tant
        // qu'aucun avis n'existe réellement pour la boutique).
        const storeIds = stores.map((s) => s.id);
        const ratingRows = await storeRepository.findRatingsForStores(storeIds);
        const ratingByStore = Object.fromEntries(
            ratingRows.map((r) => [r.boutique_id, { rating: parseFloat(r.avg_note), nb_avis: parseInt(r.nb_avis, 10) }])
        );

        return stores.map((s) => {
            const plain = s.toJSON();
            const agg = ratingByStore[s.id];
            plain.rating = agg ? Math.round(agg.rating * 10) / 10 : null;
            plain.nb_avis = agg?.nb_avis || 0;
            return plain;
        });
    },

    async getById(id) {
        return storeRepository.findByIdBasic(id);
    },

    async getBySlug(slug) {
        let store = await storeRepository.findBySlugFull(slug);

        // Si non trouvé par slug et que c'est peut-être un ID (UUID v4 regex check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!store && uuidRegex.test(slug)) {
            store = await storeRepository.findByIdFull(slug);
        }

        return store;
    },

    // Carte des clients de ma boutique : géocode approximatif (commune) dérivé de
    // l'adresse déclarée de chaque acheteur distinct ayant déjà commandé un produit
    // de cette boutique.
    async getMyClientsMap(ownerId) {
        const store = await storeRepository.findByOwnerId(ownerId);
        if (!store) return [];

        const items = await storeRepository.findClientOrderItemsForStore(store.id);

        const clientsById = new Map();
        for (const item of items) {
            const client = item.commande?.client;
            if (client && !clientsById.has(client.id)) clientsById.set(client.id, client);
        }

        return [...clientsById.values()]
            .map((u) => {
                const geo = u.adresse ? geocodeEncryptedAddress(u.adresse, u.id) : null;
                return geo
                    ? { id: u.id, nom_complet: u.nom_complet, avatar_url: u.avatar_url || null, location: { lat: geo.lat, lng: geo.lng }, commune: geo.commune }
                    : null;
            })
            .filter(Boolean);
    },

    async updateMyStore(ownerId, { nom_boutique, description, email_boutique, telephone_boutique, logo_url, use_carousel, banner_images, latitude, longitude }) {
        const store = await storeRepository.findByOwnerId(ownerId);
        if (!store) return { outcome: 'not_found' };

        let location = store.location;
        if (latitude && longitude) {
            location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        }

        const updatedStore = await storeRepository.updateInstance(store, {
            nom_boutique,
            description,
            email_boutique,
            telephone_boutique,
            logo_url,
            use_carousel: use_carousel !== undefined ? use_carousel : store.use_carousel,
            banner_images: banner_images !== undefined ? banner_images : store.banner_images,
            location
        });

        return { outcome: 'updated', store: updatedStore };
    },

    // Abonnement / renouvellement du plan "pro" de ma boutique (débit portefeuille réel).
    async subscribe(ownerId) {
        const t = await sequelize.transaction();
        try {
            const store = await storeRepository.findByOwnerIdForUpdate(ownerId, t);
            if (!store) {
                await t.rollback();
                return { outcome: 'not_found' };
            }
            await subscriptionService.ensurePlanStatus(store, t);

            const result = await subscriptionService.subscribeStore(store, t);
            if (!result.success) {
                await t.rollback();
                if (result.reason === 'insufficient_balance') {
                    return { outcome: 'insufficient_balance', requiredAmount: subscriptionService.SUBSCRIPTION_PRICE };
                }
                return { outcome: 'no_platform_account' };
            }

            await t.commit();
            return { outcome: 'subscribed', plan_expire_le: result.expire_le };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    }
};

module.exports = storeService;
