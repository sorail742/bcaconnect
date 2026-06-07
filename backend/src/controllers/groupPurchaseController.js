const {
    AchatGroupe,
    AchatGroupeParticipant,
    Product,
    User,
    Order,
    OrderItem,
    Store,
    Wallet,
    Transaction,
    sequelize,
} = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const escrowService = require('../services/escrowService');

const FRAIS_PORT_GROUPE = 15000;

const campaignIncludes = [
    { model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url', 'marque', 'prix_unitaire'] },
    { model: User, as: 'organisateur', attributes: ['id', 'nom_complet', 'role'] },
    {
        model: AchatGroupeParticipant,
        as: 'participants',
        attributes: ['id', 'utilisateur_id', 'quantite', 'montant_total', 'statut'],
        include: [{ model: User, as: 'participant', attributes: ['id', 'nom_complet'] }],
    },
];

const syncCampaignStatus = async (campaign, transaction) => {
    if (campaign.statut === 'ouvert' && campaign.quantite_actuelle >= campaign.quantite_cible) {
        campaign.statut = 'atteint';
        await campaign.save({ transaction });
    }
};

const groupPurchaseController = {
    list: catchAsync(async (req, res) => {
        const { statut, mine } = req.query;
        const where = {};

        if (statut) {
            where.statut = statut;
        } else if (!mine) {
            where.statut = { [Op.in]: ['ouvert', 'atteint'] };
            where.date_limite = { [Op.gte]: new Date() };
        }

        if (mine === 'organized') {
            where.organisateur_id = req.user.id;
        }

        const campaigns = await AchatGroupe.findAll({
            where,
            include: campaignIncludes,
            order: [['createdAt', 'DESC']],
        });

        if (mine === 'joined') {
            const participations = await AchatGroupeParticipant.findAll({
                where: { utilisateur_id: req.user.id, statut: { [Op.ne]: 'annule' } },
                attributes: ['achat_groupe_id'],
            });
            const ids = participations.map((p) => p.achat_groupe_id);
            const joined = await AchatGroupe.findAll({
                where: { id: { [Op.in]: ids } },
                include: campaignIncludes,
                order: [['createdAt', 'DESC']],
            });
            return res.json(joined);
        }

        res.json(campaigns);
    }),

    getById: catchAsync(async (req, res, next) => {
        const campaign = await AchatGroupe.findByPk(req.params.id, { include: campaignIncludes });
        if (!campaign) return next(new AppError('Campagne introuvable.', 404));
        res.json(campaign);
    }),

    create: catchAsync(async (req, res, next) => {
        const {
            produit_id,
            titre,
            description,
            quantite_cible,
            remise_pct,
            date_limite,
            zone_livraison,
            type_organisateur,
        } = req.body;

        if (!produit_id || !titre || !quantite_cible || !date_limite) {
            return next(new AppError('Produit, titre, quantité cible et date limite sont requis.', 400));
        }

        if (quantite_cible < 2) {
            return next(new AppError('La quantité cible doit être d\'au moins 2 unités.', 400));
        }

        const product = await Product.findByPk(produit_id);
        if (!product) return next(new AppError('Produit introuvable.', 404));

        const discount = Math.min(Math.max(parseFloat(remise_pct || 10), 5), 40);
        const prixNormal = parseFloat(product.prix_unitaire);
        const prixGroupe = Math.round(prixNormal * (1 - discount / 100));

        const campaign = await AchatGroupe.create({
            organisateur_id: req.user.id,
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

        const full = await AchatGroupe.findByPk(campaign.id, { include: campaignIncludes });
        res.status(201).json({ message: 'Campagne d\'achat groupé créée.', campaign: full });
    }),

    join: catchAsync(async (req, res, next) => {
        const { quantite } = req.body;
        const qty = parseInt(quantite, 10);

        if (!qty || qty < 1) {
            return next(new AppError('Quantité invalide.', 400));
        }

        const t = await sequelize.transaction();
        try {
            const campaign = await AchatGroupe.findByPk(req.params.id, {
                lock: t.LOCK.UPDATE,
                transaction: t,
            });

            if (!campaign) {
                await t.rollback();
                return next(new AppError('Campagne introuvable.', 404));
            }

            if (!['ouvert', 'atteint'].includes(campaign.statut)) {
                await t.rollback();
                return next(new AppError('Cette campagne n\'accepte plus de participants.', 400));
            }

            if (new Date(campaign.date_limite) < new Date()) {
                await t.rollback();
                return next(new AppError('La date limite de cette campagne est dépassée.', 400));
            }

            if (campaign.organisateur_id === req.user.id) {
                await t.rollback();
                return next(new AppError('L\'organisateur ne peut pas rejoindre sa propre campagne.', 400));
            }

            const existing = await AchatGroupeParticipant.findOne({
                where: {
                    achat_groupe_id: campaign.id,
                    utilisateur_id: req.user.id,
                    statut: { [Op.ne]: 'annule' },
                },
                transaction: t,
            });

            if (existing) {
                await t.rollback();
                return next(new AppError('Vous participez déjà à cette campagne.', 400));
            }

            const montantProduits = parseFloat(campaign.prix_unitaire_groupe) * qty;
            const montant = montantProduits + FRAIS_PORT_GROUPE;

            const wallet = await Wallet.findOne({
                where: { user_id: req.user.id },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!wallet || parseFloat(wallet.solde_virtuel) < montant) {
                await t.rollback();
                return next(new AppError(
                    `Solde insuffisant. Montant requis : ${montant.toLocaleString('fr-FR')} GNF (produits + livraison).`,
                    400,
                ));
            }

            await wallet.decrement('solde_virtuel', { by: montant, transaction: t });

            const participation = await AchatGroupeParticipant.create({
                achat_groupe_id: campaign.id,
                utilisateur_id: req.user.id,
                quantite: qty,
                montant_total: montant,
                statut: 'engage',
            }, { transaction: t });

            await Transaction.create({
                portefeuille_id: wallet.id,
                montant,
                type_transaction: 'achat_groupe_engagement',
                statut: 'complete',
                reference_externe: `GP-${campaign.id.slice(0, 8)}-${req.user.id.slice(0, 8)}-${Date.now().toString(36)}`,
                metadata: {
                    achat_groupe_id: campaign.id,
                    participant_id: participation.id,
                    quantite: qty,
                    frais_port: FRAIS_PORT_GROUPE,
                },
            }, { transaction: t });

            campaign.quantite_actuelle = parseInt(campaign.quantite_actuelle, 10) + qty;
            await campaign.save({ transaction: t });
            await syncCampaignStatus(campaign, t);

            await t.commit();

            const full = await AchatGroupe.findByPk(campaign.id, { include: campaignIncludes });
            res.status(201).json({
                message: campaign.statut === 'atteint'
                    ? 'Objectif atteint ! La campagne est prête à être clôturée.'
                    : 'Participation enregistrée.',
                campaign: full,
            });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }),

    leave: catchAsync(async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const campaign = await AchatGroupe.findByPk(req.params.id, {
                lock: t.LOCK.UPDATE,
                transaction: t,
            });

            if (!campaign || campaign.statut !== 'ouvert') {
                await t.rollback();
                return next(new AppError('Impossible de quitter cette campagne.', 400));
            }

            const participation = await AchatGroupeParticipant.findOne({
                where: {
                    achat_groupe_id: campaign.id,
                    utilisateur_id: req.user.id,
                    statut: 'engage',
                },
                transaction: t,
            });

            if (!participation) {
                await t.rollback();
                return next(new AppError('Participation introuvable.', 404));
            }

            const wallet = await Wallet.findOne({
                where: { user_id: req.user.id },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (wallet) {
                wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(participation.montant_total);
                await wallet.save({ transaction: t });
                await Transaction.create({
                    portefeuille_id: wallet.id,
                    montant: participation.montant_total,
                    type_transaction: 'remboursement',
                    statut: 'complete',
                    reference_externe: `GP-REFUND-${participation.id.slice(0, 8)}-${Date.now().toString(36)}`,
                    metadata: { achat_groupe_id: campaign.id, type: 'group_purchase_leave' },
                }, { transaction: t });
            }

            participation.statut = 'annule';
            await participation.save({ transaction: t });

            campaign.quantite_actuelle = Math.max(0, parseInt(campaign.quantite_actuelle, 10) - participation.quantite);
            await campaign.save({ transaction: t });

            await t.commit();
            res.json({ message: 'Participation annulée.' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }),

    close: catchAsync(async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const campaign = await AchatGroupe.findByPk(req.params.id, {
                include: [
                    { model: Product, as: 'produit' },
                    {
                        model: AchatGroupeParticipant,
                        as: 'participants',
                        where: { statut: 'engage' },
                        required: false,
                    },
                ],
                lock: t.LOCK.UPDATE,
                transaction: t,
            });

            if (!campaign) {
                await t.rollback();
                return next(new AppError('Campagne introuvable.', 404));
            }

            const isOrganizer = campaign.organisateur_id === req.user.id;
            const isAdmin = req.user.role === 'admin';

            if (!isOrganizer && !isAdmin) {
                await t.rollback();
                return next(new AppError('Seul l\'organisateur ou un admin peut clôturer.', 403));
            }

            if (campaign.statut === 'cloture') {
                await t.rollback();
                return next(new AppError('Campagne déjà clôturée.', 400));
            }

            if (campaign.participants.length === 0) {
                await t.rollback();
                return next(new AppError('Aucun participant à clôturer.', 400));
            }

            const product = await Product.findByPk(campaign.produit_id, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            const store = await Store.findOne({ where: { id: product.boutique_id }, transaction: t });

            if (!store) {
                await t.rollback();
                return next(new AppError('Boutique du produit introuvable.', 404));
            }

            const totalQty = campaign.participants.reduce((sum, p) => sum + p.quantite, 0);
            if (product.stock_quantite < totalQty) {
                await t.rollback();
                return next(new AppError(
                    `Stock insuffisant. Requis : ${totalQty}, disponible : ${product.stock_quantite}.`,
                    400,
                ));
            }

            await product.decrement('stock_quantite', { by: totalQty, transaction: t });

            const ordersCreated = [];

            for (const p of campaign.participants) {
                const totalProduits = parseFloat(campaign.prix_unitaire_groupe) * p.quantite;
                const frais_port = FRAIS_PORT_GROUPE;
                const total_ttc = totalProduits + frais_port;

                const order = await Order.create({
                    utilisateur_id: p.utilisateur_id,
                    total_ttc,
                    frais_port,
                    statut: 'payé',
                    methode_paiement: 'achat_groupe',
                    type_livraison: 'standard',
                    adresse_livraison: campaign.zone_livraison || 'Conakry',
                    nom_destinataire: 'Achat groupé BCA',
                }, { transaction: t });

                const orderItem = await OrderItem.create({
                    commande_id: order.id,
                    produit_id: product.id,
                    fournisseur_id: store.proprietaire_id,
                    quantite: p.quantite,
                    prix_unitaire_achat: campaign.prix_unitaire_groupe,
                    statut: 'en_attente',
                }, { transaction: t });

                await escrowService.depositOrderEscrow(order.id, [orderItem], t);

                const buyerWallet = await Wallet.findOne({
                    where: { user_id: p.utilisateur_id },
                    transaction: t,
                });
                if (buyerWallet) {
                    await Transaction.create({
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
                await p.save({ transaction: t });

                ordersCreated.push({
                    participant_id: p.utilisateur_id,
                    order_id: order.id,
                    total: total_ttc,
                });
            }

            campaign.statut = 'cloture';
            await campaign.save({ transaction: t });

            await t.commit();

            res.json({
                message: `Campagne clôturée — ${ordersCreated.length} commande(s) créée(s) au tarif groupé.`,
                orders: ordersCreated,
            });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }),
};

module.exports = groupPurchaseController;
