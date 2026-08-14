const { sequelize } = require('../../models');
const platformRevenueService = require('../../common/platform-revenue/service/platform-revenue.service');
const { recordDeletion } = require('../../deletion-log/service/deletionLog.service');
const adRepository = require('../repository/ad.repository');

const ALLOWED_STATUTS_NON_ADMIN = ['actif', 'inactif'];

const adService = {
    // Liste toutes les publicités (pour admin ou pour le feed public avec filtres)
    async getAll({ position, status, mine }, user) {
        const where = {};

        if (position) where.format = position;

        if (mine === '1' && user) {
            where.vendeur_id = user.id;
            if (status) where.statut = status;
        } else if (status) {
            where.statut = status;
        } else if (!user || user.role?.toLowerCase() !== 'admin') {
            where.statut = 'actif';
        }

        const ads = await adRepository.findAllFiltered(where);
        return ads || [];
    },

    async create(body, user) {
        const { titre, contenu, url_image, url_destination, format, date_debut, date_fin, budget_total, priorite, ciblage } = body;
        const t = await sequelize.transaction();
        try {
            const isAdmin = user.role?.toLowerCase() === 'admin';
            const vendeur_id = isAdmin ? (body.vendeur_id || null) : user.id;

            if (date_debut && date_fin && new Date(date_fin) <= new Date(date_debut)) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'La date de fin doit être postérieure à la date de début.' };
            }

            const requestedStatut = body.statut;
            const statut = isAdmin
                ? (requestedStatut || 'actif')
                : (ALLOWED_STATUTS_NON_ADMIN.includes(requestedStatut) ? requestedStatut : 'actif');

            const budget = parseFloat(budget_total) > 0 ? parseFloat(budget_total) : 500000;

            // Une publicité "maison" (créée par l'admin sans vendeur associé) n'est pas
            // facturée — c'est une communication de la plateforme, pas un achat d'espace.
            // Toute autre campagne est financée immédiatement depuis le portefeuille du
            // vendeur : sans ce prélèvement réel, le "budget" affiché n'était que fictif.
            const requiresPayment = !!vendeur_id;
            let wallet = null;

            if (requiresPayment) {
                wallet = await adRepository.findWalletByUserIdForUpdate(vendeur_id, t);
                if (!wallet || parseFloat(wallet.solde_virtuel) < budget) {
                    await t.rollback();
                    return { outcome: 'rejected', status: 402, message: `Solde de portefeuille insuffisant pour financer cette campagne (${budget.toLocaleString('fr-FR')} GNF requis).` };
                }
            }

            const ad = await adRepository.create({
                titre,
                contenu,
                url_image,
                url_destination,
                format,
                date_debut,
                date_fin,
                priorite: priorite ? parseInt(priorite, 10) : 1,
                budget_total: budget,
                budget_restant: budget,
                vendeur_id,
                statut
            }, { transaction: t });

            // Toujours créer un ciblage : /ads/serve fait un inner join sur ce modèle,
            // sans lui la publicité ne serait jamais diffusée.
            await adRepository.createCiblage({
                publicite_id: ad.id,
                role_cible: ciblage?.role_cible || 'all',
                localisation: ciblage?.localisation,
                preferences_cle: ciblage?.preferences_cle
            }, { transaction: t });

            // Initialiser les stats
            await adRepository.createStat({ publicite_id: ad.id }, { transaction: t });

            if (requiresPayment) {
                wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) - budget;
                await adRepository.saveWallet(wallet, t);

                await adRepository.createPaiement({
                    publicite_id: ad.id,
                    utilisateur_id: vendeur_id,
                    montant: budget,
                    statut: 'complete',
                    methode_paiement: 'wallet',
                }, { transaction: t });

                await adRepository.createTransaction({
                    portefeuille_id: wallet.id,
                    montant: budget,
                    type_transaction: 'paiement_publicite',
                    statut: 'complete',
                    reference_externe: `AD-${ad.id.slice(0, 8)}-${Date.now().toString(36)}`,
                    metadata: { publicite_id: ad.id },
                }, t);

                const platformResult = await platformRevenueService.creditPlatformWallet(budget, {
                    type: 'paiement_publicite',
                    reference_prefix: 'ADREV',
                    metadata: { publicite_id: ad.id, vendeur_id },
                }, t);

                if (!platformResult.credited) {
                    // Aucun compte plateforme configuré : on annule tout plutôt que de
                    // facturer le vendeur pour un paiement qui n'irait nulle part.
                    await t.rollback();
                    return { outcome: 'rejected', status: 500, message: "Paiement impossible : compte plateforme introuvable. Contactez l'administrateur." };
                }
            }

            await t.commit();
            return { outcome: 'created', ad };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async getForUser(user, io) {
        const role = user ? user.role : 'client';

        // Trouver les pubs actives dont le ciblage correspond au rôle ou est 'all'
        const ads = await adRepository.findActiveForRole(role);

        // Incrémenter les impressions de manière asynchrone
        ads.forEach(ad => {
            adRepository.incrementStat(ad.id, 'impressions').then(() => {
                if (io) io.emit('ad_stats_updated', { id: ad.id, type: 'impression' });
            });
        });

        return ads;
    },

    async recordClick(id, io) {
        await adRepository.incrementStat(id, 'clics');

        await adRepository.decrementBudgetForClick(id);

        const ad = await adRepository.findByIdAttributes(id, ['budget_restant']);
        if (ad && parseFloat(ad.budget_restant) === 0) {
            await adRepository.updateStatut(id, 'completed');
        }

        if (io) io.emit('ad_stats_updated', { id, type: 'clic' });
    },

    async getById(id, user) {
        const ad = await adRepository.findByIdWithCiblagesStats(id);

        if (!ad) {
            return { outcome: 'rejected', status: 404, message: 'Publicité introuvable' };
        }

        const isOwner = user && ad.vendeur_id === user.id;
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        if (ad.statut !== 'actif' && !isOwner && !isAdmin) {
            return { outcome: 'rejected', status: 403, message: 'Non autorisé' };
        }

        return { outcome: 'found', ad };
    },

    async getStats(id, user) {
        const ad = await adRepository.findByIdWithStats(id);

        if (!ad || (user.role !== 'admin' && ad.vendeur_id !== user.id)) {
            return { outcome: 'rejected', status: 403, message: "Non autorisé" };
        }

        return { outcome: 'found', stats: ad.stats };
    },

    async update(id, body, user) {
        const t = await sequelize.transaction();
        try {
            const ad = await adRepository.findByIdForUpdate(id, t);

            if (!ad) {
                await t.rollback();
                return { outcome: 'rejected', status: 404, message: "Publicité introuvable" };
            }
            const isAdmin = user.role?.toLowerCase() === 'admin';
            if (!isAdmin && ad.vendeur_id !== user.id) {
                await t.rollback();
                return { outcome: 'rejected', status: 403, message: "Non autorisé" };
            }

            const updates = { ...body };
            if (!isAdmin) {
                if (updates.statut && !ALLOWED_STATUTS_NON_ADMIN.includes(updates.statut)) {
                    delete updates.statut;
                }
                delete updates.vendeur_id;
            }
            if (updates.date_debut && updates.date_fin && new Date(updates.date_fin) <= new Date(updates.date_debut)) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'La date de fin doit être postérieure à la date de début.' };
            }

            // Augmenter le budget total d'une campagne est un réapprovisionnement : il est
            // facturé immédiatement au propriétaire de la publicité, jamais offert.
            if (updates.budget_total !== undefined && ad.vendeur_id) {
                const newBudget = parseFloat(updates.budget_total);
                const oldBudget = parseFloat(ad.budget_total);
                if (Number.isFinite(newBudget) && newBudget > oldBudget) {
                    const topUp = newBudget - oldBudget;
                    const wallet = await adRepository.findWalletByUserIdForUpdate(ad.vendeur_id, t);
                    if (!wallet || parseFloat(wallet.solde_virtuel) < topUp) {
                        await t.rollback();
                        return { outcome: 'rejected', status: 402, message: `Solde insuffisant pour ce réapprovisionnement (${topUp.toLocaleString('fr-FR')} GNF requis).` };
                    }
                    wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) - topUp;
                    await adRepository.saveWallet(wallet, t);

                    await adRepository.createPaiement({
                        publicite_id: ad.id, utilisateur_id: ad.vendeur_id, montant: topUp,
                        statut: 'complete', methode_paiement: 'wallet',
                    }, { transaction: t });

                    await adRepository.createTransaction({
                        portefeuille_id: wallet.id, montant: topUp, type_transaction: 'paiement_publicite',
                        statut: 'complete', reference_externe: `AD-TOPUP-${ad.id.slice(0, 8)}-${Date.now().toString(36)}`,
                        metadata: { publicite_id: ad.id, type: 'topup' },
                    }, t);

                    const platformResult = await platformRevenueService.creditPlatformWallet(topUp, {
                        type: 'paiement_publicite',
                        reference_prefix: 'ADREV',
                        metadata: { publicite_id: ad.id, vendeur_id: ad.vendeur_id, type: 'topup' },
                    }, t);

                    if (!platformResult.credited) {
                        await t.rollback();
                        return { outcome: 'rejected', status: 500, message: "Paiement impossible : compte plateforme introuvable. Contactez l'administrateur." };
                    }

                    updates.budget_restant = parseFloat(ad.budget_restant) + topUp;
                }
            }

            await adRepository.updateInstance(ad, updates, { transaction: t });
            await t.commit();
            return { outcome: 'updated', ad };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async delete(id, user, req) {
        const ad = await adRepository.findById(id);

        if (!ad) return { outcome: 'rejected', status: 404, message: "Publicité introuvable" };
        if (user.role !== 'admin' && ad.vendeur_id !== user.id) {
            return { outcome: 'rejected', status: 403, message: "Non autorisé" };
        }

        await recordDeletion('Publicite', ad, { req });
        await adRepository.destroy(ad);
        return { outcome: 'deleted' };
    }
};

module.exports = adService;
