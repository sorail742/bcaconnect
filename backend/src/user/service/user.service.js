const bcrypt = require('bcryptjs');
const { sequelize, Store } = require('../../models');
const AppError = require('../../utils/AppError');
const { deleteUserCompletely } = require('../../services/userDeletionService');
const { approximateGeocode, pointFromUserLocation } = require('../../utils/geoUtils');
const userRepository = require('../repository/user.repository');
const userDto = require('../dto/user.dto');
const walletService = require('../../common/wallet/service/wallet.service');

const ALLOWED_ROLES = ['client', 'fournisseur', 'transporteur', 'technicien', 'banque', 'admin'];

// Aligne la boutique auto-créée d'un vendeur sur le statut de son compte.
// Sans ça, un vendeur activé par l'admin (statut → 'actif') reste invisible
// sur /vendors : sa boutique, créée en 'en_attente' à l'inscription
// (cf. authController.register), n'était jamais mise à jour en retour.
// NOTE: touche directement le modèle Store (feature `store`, pas encore migrée) —
// à remplacer par un appel à storeService une fois `store` restructuré.
const syncVendorStoreStatus = async (user) => {
    if (user.role !== 'fournisseur') return;
    const store = await Store.findOne({ where: { proprietaire_id: user.id } });
    if (!store) return;
    const targetStatut = user.statut === 'actif' ? 'actif' : 'en_attente';
    if (store.statut !== targetStatut) {
        await store.update({ statut: targetStatut });
    }
};

const userService = {
    // Liste paginée avec recherche et filtre par rôle
    async getAll({ page = 1, limit = 10, search = '', role = '' } = {}) {
        const { count, rows: users } = await userRepository.listUsers({ page, limit, search, role });

        // Calculate dynamic stats
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        const currentCount = await userRepository.countActiveCreatedSince(thirtyDaysAgo);
        const previousCount = await userRepository.countActiveCreatedBetween(sixtyDaysAgo, thirtyDaysAgo);
        const growth = previousCount === 0 ? 100 : ((currentCount - previousCount) / previousCount) * 100;
        const newLast7Days = await userRepository.countActiveCreatedSince(sevenDaysAgo);

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            users,
            stats: {
                growth: growth.toFixed(1),
                newLast7Days,
                status: 'Actif'
            }
        };
    },

    // Carte des utilisateurs (admin) — position GPS réelle pour les transporteurs
    // (dernier point capté lors d'une livraison), position approximative dérivée
    // de l'adresse déclarée pour les autres rôles. Filtrable par rôle.
    async getUserLocations({ role } = {}) {
        const roleFilter = role && ALLOWED_ROLES.includes(role) ? role : undefined;
        const users = await userRepository.findAllForLocations({ role: roleFilter });

        return users
            .map((u) => {
                let point = null;
                let precision = null;

                if (u.role === 'transporteur') {
                    point = pointFromUserLocation(u.location);
                    if (point) precision = 'gps';
                }
                if (!point && u.adresse) {
                    const geo = approximateGeocode(u.adresse, u.id);
                    if (geo) {
                        point = { lat: geo.lat, lng: geo.lng };
                        precision = 'approx';
                    }
                }
                if (!point) return null;

                // Information publique complémentaire, propre à chaque rôle — jamais
                // de donnée sensible (téléphone, adresse exacte, email) sur la carte.
                let detail = null;
                if (u.role === 'fournisseur') detail = u.categorie_activite;
                else if (u.role === 'technicien') detail = u.specialites;
                else if (u.role === 'transporteur') detail = u.metadata_transporteur?.type_vehicule;

                return {
                    id: u.id,
                    nom_complet: u.nom_complet,
                    role: u.role,
                    location: point,
                    precision,
                    avatar_url: u.avatar_url || null,
                    detail: detail || null,
                    score_confiance: u.score_confiance,
                };
            })
            .filter(Boolean);
    },

    // Recherche publique (id, nom, rôle) pour la messagerie - Ouvert à tous les membres
    async getPublicUsers({ search = '' } = {}, excludeUserId) {
        return userRepository.findPublicUsers({ search, excludeUserId, limit: 20 });
    },

    // Création par un admin
    async create({ nom_complet, email, mot_de_passe, role, telephone }) {
        const t = await sequelize.transaction();
        try {
            if (!mot_de_passe || mot_de_passe.length < 6) {
                await t.rollback();
                throw new AppError("Mot de passe trop court (min 6 caractères).", 422);
            }

            if (role && !ALLOWED_ROLES.includes(role)) {
                await t.rollback();
                throw new AppError("Rôle invalide.", 422);
            }

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                await t.rollback();
                throw new AppError("Cet email est déjà utilisé.", 400);
            }

            const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

            const user = await userRepository.create({
                nom_complet,
                email,
                mot_de_passe: hashedPassword,
                role: role || 'client',
                telephone,
                statut: 'actif'
            }, { transaction: t });

            await walletService.createWalletForUser(user.id, { transaction: t });

            await t.commit();

            return userDto.toSafeUserJson(user);
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    // Mise à jour par un admin
    async update(id, { nom_complet, email, mot_de_passe, role, statut, telephone }) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError("Utilisateur non trouvé.", 404);
        }

        const updateData = {
            nom_complet: nom_complet || user.nom_complet,
            email: email || user.email,
            role: role || user.role,
            statut: statut || user.statut,
            telephone: telephone || user.telephone
        };

        if (mot_de_passe) {
            updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
        }

        if (updateData.statut === 'actif' && !user.est_approuve) {
            updateData.est_approuve = true;
        }

        await userRepository.updateInstance(user, updateData);
        await syncVendorStoreStatus(user);

        return userDto.toSafeUserJson(user);
    },

    // Suppression définitive (admin) — retire l'utilisateur de la base
    async delete(id, req) {
        if (id === req.user.id.toString()) {
            throw new AppError("Vous ne pouvez pas supprimer votre propre compte admin.", 400);
        }

        const result = await deleteUserCompletely(id, req);
        if (!result.ok) {
            throw new AppError(result.message, result.status || 500);
        }

        return { message: result.message, id };
    },

    // Changement de statut rapide
    async updateStatus(id, statut) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError("Utilisateur non trouvé.", 404);
        }

        const patch = { statut };
        if (statut === 'actif' && !user.est_approuve) {
            patch.est_approuve = true;
        }
        await userRepository.updateInstance(user, patch);
        await syncVendorStoreStatus(user);

        return { message: `Statut mis à jour : ${statut}` };
    },

    // Mise à jour de l'avatar par l'utilisateur lui-même
    async updateAvatar(userId, fileUrl) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError("Utilisateur non trouvé.", 404);
        }

        await userRepository.updateInstance(user, { avatar_url: fileUrl });
        return { avatar_url: fileUrl };
    },
};

module.exports = userService;
