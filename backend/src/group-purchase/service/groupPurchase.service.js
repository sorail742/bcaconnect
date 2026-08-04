const { Op } = require('sequelize');
const { sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const escrowService = require('../../common/escrow/service/escrow.service');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');
const productRepository = require('../../product/repository/product.repository');
const storeRepository = require('../../store/repository/store.repository');
const orderRepository = require('../../order/repository/order.repository');
const groupPurchaseRepository = require('../repository/groupPurchase.repository');

const FRAIS_PORT_GROUPE = 15000;

const syncCampaignStatus = async (campaign, transaction) => {
    if (campaign.statut === 'ouvert' && campaign.quantite_actuelle >= campaign.quantite_cible) {
        campaign.statut = 'atteint';
        await groupPurchaseRepository.save(campaign, { transaction });
    }
};

const groupPurchaseService = {
    async list({ statut, mine }, userId) {
        const where = {};

        if (statut) {
            where.statut = statut;
        } else if (!mine) {
            where.statut = { [Op.in]: ['ouvert', 'atteint'] };
            where.date_limite = { [Op.gte]: new Date() };
        }

        if (mine === 'organized') {
            where.organisateur_id = userId;
        }

        const campaigns = await groupPurchaseRepository.findAllFiltered(where);

        if (mine === 'joined') {
            const participations = await groupPurchaseRepository.findParticipationsByUser(userId);
            const ids = participations.map((p) => p.achat_groupe_id);
            return groupPurchaseRepository.findAllByIds(ids);
        }

        return campaigns;
    },

    async getById(id) {
        const campaign = await groupPurchaseRepository.findByIdFull(id);
        if (!campaign) throw new AppError('Campagne introuvable.', 404);
        return campaign;
    },

    async create({ produit_id, titre, description, quantite_cible, remise_pct, date_limite, zone_livraison, type_organisateur }, userId) {
        if (!produit_id || !titre || !quantite_cible || !date_limite) {
            throw new AppError('Produit, titre, quantité cible et date limite sont requis.', 400);
        }

        if (quantite_cible < 2) {
            throw new AppError('La quantité cible doit être d\'au moins 2 unités.', 400);
        }

        const product = await productRepository.findById(produit_id);
        if (!product) throw new AppError('Produit introuvable.', 404);

        const discount = Math.min(Math.max(parseFloat(remise_pct || 10), 5), 40);
        const prixNormal = parseFloat(product.prix_unitaire);
        const prixGroupe = Math.round(prixNormal * (1 - discount / 100));

        const campaign = await groupPurchaseRepository.create({
            organisateur_id: userId,
            produit_id,
            titre,
            description,
            quantite_cible: parseInt(quantite_cible, 10),
            prix_unitaire_normal: prixNormal,
            prix_unitaire_groupe: prixGroupe,
            remise_pct: discount,
            date_limite: new Date(date_limite),
            zone_livraison: zone_livraison || 'Conakry',
            type_organisateur: type_organisateur || 'particulier',
            statut: 'ouvert',
        });

        const full = await groupPurchaseRepository.findByIdFull(campaign.id);
        return full;
    },

    async join(id, quantite, user) {
        const qty = parseInt(quantite, 10);

        if (!qty || qty < 1) {
            throw new AppError('Quantité invalide.', 400);
        }

        const t = await sequelize.transaction();
        try {
            const campaign = await groupPurchaseRepository.findByIdForUpdate(id, t);

            if (!campaign) {
                await t.rollback();
                throw new AppError('Campagne introuvable.', 404);
            }

            if (!['ouvert', 'atteint'].includes(campaign.statut)) {
                await t.rollback();
                throw new AppError('Cette campagne n\'accepte plus de participants.', 400);
            }

            if (new Date(campaign.date_limite) < new Date()) {
                await t.rollback();
                throw new AppError('La date limite de cette campagne est dépassée.', 400);
            }

            if (campaign.organisateur_id === user.id) {
                await t.rollback();
                throw new AppError('L\'organisateur ne peut pas rejoindre sa propre campagne.', 400);
            }

            const existing = await groupPurchaseRepository.findParticipantActive(campaign.id, user.id, { transaction: t });

            if (existing) {
                await t.rollback();
                throw new AppError('Vous participez déjà à cette campagne.', 400);
            }

            const remainingQty = parseInt(campaign.quantite_cible, 10) - parseInt(campaign.quantite_actuelle, 10);
            if (qty > remainingQty) {
                await t.rollback();
                throw new AppError(`Quantité demandée trop élevée. Il ne reste que ${remainingQty} places/unités disponibles.`, 400);
            }

            const montantProduits = parseFloat(campaign.prix_unitaire_groupe) * qty;
            const montant = montantProduits + FRAIS_PORT_GROUPE;

            const wallet = await walletRepository.findByUserIdForUpdate(user.id, t);
            if (!wallet || parseFloat(wallet.solde_virtuel) < montant) {
                await t.rollback();
                throw new AppError(
                    `Solde insuffisant. Montant requis : ${montant.toLocaleString('fr-FR')} GNF (produits + livraison).`,
                    400,
                );
            }

            await walletRepository.decrementBalance(wallet, montant, { transaction: t });

            const participation = await groupPurchaseRepository.createParticipant({
                achat_groupe_id: campaign.id,
                utilisateur_id: user.id,
                quantite: qty,
                montant_total: montant,
                statut: 'engage',
            }, { transaction: t });

            await transactionService.create({
                portefeuille_id: wallet.id,
                montant,
                type_transaction: 'achat_groupe_engagement',
                statut: 'complete',
                reference_externe: `GP-${campaign.id.slice(0, 8)}-${user.id.slice(0, 8)}-${Date.now().toString(36)}`,
                metadata: {
                    achat_groupe_id: campaign.id,
                    participant_id: participation.id,
                    quantite: qty,
                    frais_port: FRAIS_PORT_GROUPE,
                },
            }, { transaction: t });

            campaign.quantite_actuelle = parseInt(campaign.quantite_actuelle, 10) + qty;
            await groupPurchaseRepository.save(campaign, { transaction: t });
            await syncCampaignStatus(campaign, t);

            await t.commit();

            const full = await groupPurchaseRepository.findByIdFull(campaign.id);
            return {
                message: campaign.statut === 'atteint'
                    ? 'Objectif atteint ! La campagne est prête à être clôturée.'
                    : 'Participation enregistrée.',
                campaign: full,
            };
        } catch (err) {
            if (!t.finished) await t.rollback();
            throw err;
        }
    },

    async leave(id, user) {
        const t = await sequelize.transaction();
        try {
            const campaign = await groupPurchaseRepository.findByIdForUpdate(id, t);

            if (!campaign || campaign.statut !== 'ouvert') {
                await t.rollback();
                throw new AppError('Impossible de quitter cette campagne.', 400);
            }

            const participation = await groupPurchaseRepository.findParticipantEngaged(campaign.id, user.id, { transaction: t });

            if (!participation) {
                await t.rollback();
                throw new AppError('Participation introuvable.', 404);
            }

            const wallet = await walletRepository.findByUserIdForUpdate(user.id, t);
            if (wallet) {
                wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(participation.montant_total);
                await walletRepository.save(wallet, { transaction: t });
                await transactionService.create({
                    portefeuille_id: wallet.id,
                    montant: participation.montant_total,
                    type_transaction: 'remboursement',
                    statut: 'complete',
                    reference_externe: `GP-REFUND-${participation.id.slice(0, 8)}-${Date.now().toString(36)}`,
                    metadata: { achat_groupe_id: campaign.id, type: 'group_purchase_leave' },
                }, { transaction: t });
            }

            participation.statut = 'annule';
            await groupPurchaseRepository.saveParticipant(participation, { transaction: t });

            campaign.quantite_actuelle = Math.max(0, parseInt(campaign.quantite_actuelle, 10) - participation.quantite);
            await groupPurchaseRepository.save(campaign, { transaction: t });

            await t.commit();
            return { message: 'Participation annulée.' };
        } catch (err) {
            if (!t.finished) await t.rollback();
            throw err;
        }
    },

    async close(id, user) {
        const t = await sequelize.transaction();
        try {
            const campaign = await groupPurchaseRepository.findByIdForUpdateWithParticipants(id, t);

            if (!campaign) {
                await t.rollback();
                throw new AppError('Campagne introuvable.', 404);
            }

            const isOrganizer = campaign.organisateur_id === user.id;
            const isAdmin = user.role === 'admin';

            if (!isOrganizer && !isAdmin) {
                await t.rollback();
                throw new AppError('Seul l\'organisateur ou un admin peut clôturer.', 403);
            }

            if (campaign.statut === 'cloture') {
                await t.rollback();
                throw new AppError('Campagne déjà clôturée.', 400);
            }

            if (campaign.participants.length === 0) {
                await t.rollback();
                throw new AppError('Aucun participant à clôturer.', 400);
            }

            const product = await productRepository.findByIdForUpdate(campaign.produit_id, t);
            const store = await storeRepository.findById(product.boutique_id, { transaction: t });

            if (!store) {
                await t.rollback();
                throw new AppError('Boutique du produit introuvable.', 404);
            }

            const totalQty = campaign.participants.reduce((sum, p) => sum + p.quantite, 0);
            if (product.stock_quantite < totalQty) {
                await t.rollback();
                throw new AppError(
                    `Stock insuffisant. Requis : ${totalQty}, disponible : ${product.stock_quantite}.`,
                    400,
                );
            }

            await productRepository.decrementStockInstance(product, totalQty, t);

            const ordersCreated = [];

            for (const p of campaign.participants) {
                const totalProduits = parseFloat(campaign.prix_unitaire_groupe) * p.quantite;
                const frais_port = FRAIS_PORT_GROUPE;
                const total_ttc = totalProduits + frais_port;

                const order = await orderRepository.create({
                    utilisateur_id: p.utilisateur_id,
                    total_ttc,
                    frais_port,
                    statut: 'payé',
                    methode_paiement: 'achat_groupe',
                    type_livraison: 'standard',
                    adresse_livraison: campaign.zone_livraison || 'Conakry',
                    nom_destinataire: 'Achat groupé BCA',
                }, { transaction: t });

                const orderItem = await orderRepository.createItem({
                    commande_id: order.id,
                    produit_id: product.id,
                    fournisseur_id: store.proprietaire_id,
                    quantite: p.quantite,
                    prix_unitaire_achat: campaign.prix_unitaire_groupe,
                    statut: 'en_attente',
                }, { transaction: t });

                await escrowService.depositOrderEscrow(order.id, [orderItem], t);

                const buyerWallet = await walletRepository.findByUserId(p.utilisateur_id, { transaction: t });
                if (buyerWallet) {
                    await transactionService.create({
                        portefeuille_id: buyerWallet.id,
                        commande_id: order.id,
                        montant: total_ttc,
                        type_transaction: 'achat_produit',
                        statut: 'complete',
                        reference_externe: `GP-ORDER-${order.id.slice(0, 8)}-${Date.now().toString(36)}`,
                        metadata: {
                            achat_groupe_id: campaign.id,
                            participant_id: p.id,
                            prepaid_at_join: true,
                        },
                    }, { transaction: t });
                }

                p.statut = 'confirme';
                p.commande_id = order.id;
                await groupPurchaseRepository.saveParticipant(p, { transaction: t });

                ordersCreated.push({
                    participant_id: p.utilisateur_id,
                    order_id: order.id,
                    total: total_ttc,
                });
            }

            campaign.statut = 'cloture';
            await groupPurchaseRepository.save(campaign, { transaction: t });

            await t.commit();

            return {
                message: `Campagne clôturée — ${ordersCreated.length} commande(s) créée(s) au tarif groupé.`,
                orders: ordersCreated,
            };
        } catch (err) {
            if (!t.finished) await t.rollback();
            throw err;
        }
    },
};

module.exports = groupPurchaseService;
