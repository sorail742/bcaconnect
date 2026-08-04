const AppError = require('../../utils/AppError');
const { sequelize } = require('../../models');
const aiScoringService = require('../../services/aiScoringService');
const microCreditService = require('../../services/microCreditService');
const escrowService = require('../../common/escrow/service/escrow.service');
const platformRevenueService = require('../../common/platform-revenue/service/platform-revenue.service');
const { notifyCarriersOrderReady } = require('../../services/deliveryNotificationService');
const { geocodeEncryptedAddress } = require('../../utils/geoUtils');
const walletRepository = require('../../common/wallet/repository/wallet.repository');
const transactionService = require('../../common/transactions/service/transaction.service');
const orderRepository = require('../../order/repository/order.repository');
const creditRepository = require('../repository/credit.repository');

/** Calculer les mensualités pour une simulation */
const calculateInstallments = (montant, taux, mois) => {
    const r = (taux / 100) / 12; // Taux mensuel
    const mensualite = (montant * r * Math.pow(1 + r, mois)) / (Math.pow(1 + r, mois) - 1);
    return Math.round(mensualite || (montant / mois)); // Fallback si taux est 0
};

/**
 * Génère l'échéancier et débloque les fonds (versement portefeuille ou
 * activation de commande) pour un crédit qui vient d'être approuvé — logique
 * partagée entre l'approbation manuelle par la banque (`approveCredit`) et
 * l'approbation automatique d'un micro-prêt éligible (`requestMicroCredit`).
 * Le crédit doit déjà avoir `statut = 'approuve'` avant l'appel.
 */
const finalizeCreditApproval = async (credit, t) => {
    const mensualite = calculateInstallments(credit.montant_principal, credit.taux_interet, credit.duree_mois);
    const echeances = [];

    for (let i = 1; i <= credit.duree_mois; i++) {
        const dateEcheance = new Date();
        dateEcheance.setMonth(dateEcheance.getMonth() + i);

        echeances.push({
            credit_id: credit.id,
            date_echeance: dateEcheance,
            montant_du: mensualite,
            statut: 'du'
        });
    }

    await creditRepository.bulkCreateEcheances(echeances, { transaction: t });

    let orderActivated = false;
    let activatedOrder = null;
    let orderCarrierReady = false;

    if (credit.commande_id) {
        try {
            const orderResult = await escrowService.confirmOrderPayment(credit.commande_id, t);
            if (orderResult.confirmed) {
                orderActivated = true;
                activatedOrder = orderResult.order;
                orderCarrierReady = orderResult.carrierReady;
                activatedOrder.methode_paiement = 'credit';
                await orderRepository.save(activatedOrder, { transaction: t });

                const wallet = await walletRepository.findByUserId(credit.utilisateur_id, { transaction: t });
                if (wallet) {
                    await transactionService.create({
                        portefeuille_id: wallet.id,
                        commande_id: credit.commande_id,
                        montant: credit.montant_principal,
                        type_transaction: 'credit_financement',
                        statut: 'complete',
                        reference_externe: `CREDIT-${credit.id.slice(0, 8)}-${Date.now().toString(36)}`,
                        metadata: { credit_id: credit.id, source: 'bank_approval' },
                    }, { transaction: t });
                }
            }
        } catch (orderErr) {
            console.warn(`[CREDIT] Commande ${credit.commande_id} non activée:`, orderErr.message);
        }
    } else {
        // Pas de commande : Versement direct du crédit de liquidité sur le portefeuille
        try {
            const wallet = await walletRepository.findByUserId(credit.utilisateur_id, { transaction: t });
            if (wallet) {
                wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) + parseFloat(credit.montant_principal);
                await walletRepository.save(wallet, { transaction: t });

                await transactionService.create({
                    portefeuille_id: wallet.id,
                    montant: credit.montant_principal,
                    type_transaction: 'depot',
                    statut: 'complete',
                    reference_externe: `CREDIT-CASH-${credit.id.slice(0, 8)}-${Date.now().toString(36)}`,
                    metadata: { credit_id: credit.id, source: credit.type === 'micro' ? 'micro_credit_auto' : 'bank_disbursement' },
                }, { transaction: t });
            }
        } catch (walletErr) {
            console.warn(`[CREDIT] Erreur versement portefeuille pour le crédit ${credit.id}:`, walletErr.message);
        }
    }

    return { orderActivated, activatedOrder, orderCarrierReady };
};

const creditService = {
    /** Calculer les mensualités pour une simulation */
    simulateCredit({ montant, taux, mois }) {
        const mensualite = calculateInstallments(montant, taux || 0, mois);
        const totalArembourser = mensualite * mois;

        return {
            montant_principal: montant,
            taux: taux || 0,
            duree: mois,
            mensualite,
            total_a_rembourser: totalArembourser,
            cout_du_credit: totalArembourser - montant
        };
    },

    /** Demander un crédit (avec calcul de solvabilité IA réel Alpha-BCA) */
    async requestCredit({ montant_principal, taux_interet, duree_mois, commande_id, motif, garanties }, user, io) {
        // Calcul du score IA via le nouveau moteur prédictif
        const scoring = await aiScoringService.calculateGlobalScore(user.id);

        const credit = await creditRepository.create({
            utilisateur_id: user.id,
            commande_id,
            montant_principal,
            taux_interet: taux_interet || 0,
            duree_mois,
            ia_score_solvabilite: scoring.score,
            motif,
            garanties,
            metadata: {
                scoring_breakdown: scoring.breakdown,
                scoring_version: scoring.metadata.version
            },
            statut: 'en_attente'
        });

        try {
            if (io) {
                // Notifier les banques
                io.to('room_banque').emit('new_credit_request', credit);
                io.to('room_admin').emit('new_credit_request', credit);
            }
        } catch (e) {
            console.warn('[CREDIT] Erreur notification nouvelle demande', e.message);
        }

        return {
            message: "Demande de crédit soumise avec succès",
            credit,
            ia_analysis: scoring.metadata.status
        };
    },

    /**
     * Configuration publique du micro-prêt (plafonds, seuil d'approbation
     * automatique) — pour que le frontend affiche les vraies limites sans les
     * dupliquer en dur.
     */
    getMicroCreditConfig() {
        return {
            montant_max: microCreditService.MAX_AMOUNT,
            duree_max_mois: microCreditService.MAX_DURATION_MONTHS,
            seuil_approbation_auto: microCreditService.AUTO_APPROVE_SCORE_THRESHOLD,
        };
    },

    /**
     * Demander un micro-prêt (sous-bancarisés) — montant plafonné, courte durée,
     * pas de commande requise. Approuvé et versé INSTANTANÉMENT si le score IA de
     * l'utilisateur dépasse le seuil configuré ; sinon la demande part comme un
     * crédit classique en attente de revue banque (cf. requestCredit), avec le
     * type 'micro' conservé pour que la banque sache qu'il s'agit d'un petit
     * montant à traiter en priorité.
     */
    async requestMicroCredit({ montant_principal, duree_mois, motif }, user, io) {
        const t = await sequelize.transaction();
        try {
            if (!microCreditService.isEligibleAmount(montant_principal)) {
                await t.rollback();
                return { outcome: 'rejected', message: `Le micro-prêt est limité à ${microCreditService.MAX_AMOUNT.toLocaleString('fr-GN')} GNF.` };
            }
            if (!microCreditService.isEligibleDuration(duree_mois)) {
                await t.rollback();
                return { outcome: 'rejected', message: `Le micro-prêt se rembourse sur ${microCreditService.MAX_DURATION_MONTHS} mois maximum.` };
            }

            const scoring = await aiScoringService.calculateGlobalScore(user.id);
            const autoApproved = microCreditService.qualifiesForAutoApproval(scoring.score);

            const credit = await creditRepository.create({
                utilisateur_id: user.id,
                montant_principal,
                taux_interet: 0,
                duree_mois,
                ia_score_solvabilite: scoring.score,
                motif: motif || 'Micro-prêt (avance de trésorerie)',
                type: 'micro',
                statut: autoApproved ? 'approuve' : 'en_attente',
                date_approbation: autoApproved ? new Date() : null,
                metadata: {
                    scoring_breakdown: scoring.breakdown,
                    scoring_version: scoring.metadata.version,
                    auto_approved: autoApproved,
                },
            }, { transaction: t });

            if (autoApproved) {
                await finalizeCreditApproval(credit, t);
            }

            await t.commit();

            if (autoApproved) {
                try {
                    if (io) {
                        const notif = await creditRepository.createNotification({
                            utilisateur_id: user.id,
                            titre: 'Micro-prêt approuvé instantanément',
                            message: `Votre micro-prêt de <span class="font-black text-emerald-500">${parseFloat(montant_principal).toLocaleString('fr-GN')} GNF</span> a été approuvé et versé sur votre portefeuille.`,
                            type: 'wallet',
                        });
                        io.to(user.id).emit('notification_received', notif);
                        io.to(user.id).emit('wallet_updated');
                    }
                } catch (e) {
                    console.warn('[MICRO-CREDIT] Notification post-approbation:', e.message);
                }
            } else {
                try {
                    if (io) {
                        io.to('room_banque').emit('new_credit_request', credit);
                        io.to('room_admin').emit('new_credit_request', credit);
                    }
                } catch (e) {
                    console.warn('[MICRO-CREDIT] Erreur notification nouvelle demande', e.message);
                }
            }

            return {
                outcome: 'created',
                message: autoApproved
                    ? 'Micro-prêt approuvé et versé instantanément.'
                    : 'Demande de micro-prêt soumise, en attente de revue.',
                credit,
                auto_approved: autoApproved,
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    /** Récupérer le score IA détaillé de l'utilisateur */
    async getUserScore(userId) {
        return aiScoringService.calculateGlobalScore(userId);
    },

    /** Approuver un crédit et générer l'échéancier (Admin) */
    async approveCredit(id, io, app) {
        const t = await sequelize.transaction();
        try {
            const credit = await creditRepository.findById(id, { transaction: t });

            if (!credit || credit.statut !== 'en_attente') {
                await t.rollback();
                return { outcome: 'rejected', message: "Crédit invalide ou déjà traité." };
            }

            credit.statut = 'approuve';
            credit.date_approbation = new Date();
            await creditRepository.save(credit, { transaction: t });

            const { orderActivated, activatedOrder, orderCarrierReady } = await finalizeCreditApproval(credit, t);

            await t.commit();

            if (orderActivated && activatedOrder) {
                try {
                    if (io) {
                        const buyerNotif = await creditRepository.createNotification({
                            utilisateur_id: credit.utilisateur_id,
                            titre: 'Crédit approuvé — commande activée',
                            message: `Votre crédit a été approuvé. La commande <span class="font-black text-primary">#${activatedOrder.id.slice(0, 8)}</span> est maintenant payée et en préparation.`,
                            type: 'payment',
                        });
                        io.to(credit.utilisateur_id).emit('notification_received', buyerNotif);

                        const items = await orderRepository.findItemsByOrderId(activatedOrder.id);
                        const vendorIds = [...new Set(items.map(i => i.fournisseur_id))];
                        for (const vendorId of vendorIds) {
                            const vendorNotif = await creditRepository.createNotification({
                                utilisateur_id: vendorId,
                                titre: 'Commande financée par crédit',
                                message: `La commande <span class="font-black text-primary">#${activatedOrder.id.slice(0, 8)}</span> a été financée. Préparez les produits.`,
                                type: 'order',
                            });
                            io.to(vendorId).emit('notification_received', vendorNotif);
                        }
                    }
                } catch (notifErr) {
                    console.warn('[CREDIT] Notification post-approbation:', notifErr.message);
                }

                if (orderCarrierReady) {
                    await notifyCarriersOrderReady(app, activatedOrder).catch((e) => {
                        console.warn('[CREDIT] Notification transporteur:', e.message);
                    });
                }
            } else if (!credit.commande_id) {
                // Notification de versement en liquidité
                try {
                    if (io) {
                        const depositNotif = await creditRepository.createNotification({
                            utilisateur_id: credit.utilisateur_id,
                            titre: 'Fonds disponibles',
                            message: `Votre crédit a été approuvé. Un montant de <span class="font-black text-emerald-500">${parseFloat(credit.montant_principal).toLocaleString('fr-GN')} GNF</span> a été versé sur votre portefeuille.`,
                            type: 'wallet',
                        });
                        io.to(credit.utilisateur_id).emit('notification_received', depositNotif);
                    }
                } catch (notifErr) {
                    console.warn('[CREDIT] Notification post-approbation (cash):', notifErr.message);
                }
            }

            return {
                outcome: 'approved',
                message: orderActivated
                    ? 'Crédit approuvé, échéancier généré et commande activée.'
                    : 'Crédit approuvé et échéancier généré',
                credit,
                orderActivated,
            };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    /** Payer une échéance spécifique */
    async payInstallment(id, user, io) {
        const t = await sequelize.transaction();
        try {
            const echeance = await creditRepository.findEcheanceWithCredit(id, { transaction: t });

            if (!echeance || echeance.statut === 'paye') {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: "Échéance invalide ou déjà payée." };
            }

            const creditOwnerId = echeance.Credit?.utilisateur_id;
            const isOwner = creditOwnerId === user.id;
            const isAdmin = user.role === 'admin';
            if (!isOwner && !isAdmin) {
                await t.rollback();
                return { outcome: 'rejected', status: 403, message: "Vous n'êtes pas autorisé à payer cette échéance." };
            }

            const wallet = await walletRepository.findByUserId(user.id, { transaction: t });
            if (!wallet || parseFloat(wallet.solde_virtuel) < parseFloat(echeance.montant_du)) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: "Solde insuffisant dans votre portefeuille virtuel." };
            }

            wallet.solde_virtuel = parseFloat(wallet.solde_virtuel) - parseFloat(echeance.montant_du);
            await walletRepository.save(wallet, { transaction: t });

            // Transférer automatiquement l'argent à la banque (si un partenaire dédié existe)
            // ou, à défaut, au compte plateforme — jamais silencieusement perdu : un compte
            // sans portefeuille est loggé explicitement par creditUserWallet.
            const bankUser = await platformRevenueService.resolveBankOrAdminUser(t);
            if (bankUser) {
                await platformRevenueService.creditUserWallet(bankUser.id, echeance.montant_du, {
                    type: 'remboursement_recu',
                    reference_prefix: 'REMBOURSEMENT',
                    metadata: { echeance_id: echeance.id, client_id: user.id },
                }, t);
            } else {
                console.error('[creditService] Aucun compte banque/admin trouvé — remboursement non crédité:', { echeance_id: echeance.id, montant: echeance.montant_du });
            }

            echeance.montant_paye = echeance.montant_du;
            echeance.statut = 'paye';
            echeance.reference_paiement = `CRED-${Date.now()}`;
            await creditRepository.saveEcheance(echeance, { transaction: t });

            const restes = await creditRepository.countUnpaidEcheances(echeance.credit_id, { transaction: t });

            if (restes === 0) {
                const credit = await creditRepository.findById(echeance.credit_id, { transaction: t });
                credit.statut = 'rembourse';
                await creditRepository.save(credit, { transaction: t });
            }

            await t.commit();

            // NOTIFICATIONS TEMPS RÉEL (Sockets)
            try {
                if (io) {
                    // Notifier le client
                    const notifClient = await creditRepository.createNotification({
                        utilisateur_id: user.id,
                        titre: 'Échéance payée',
                        message: `Vous avez payé avec succès l'échéance de <span class="font-black text-emerald-500">${parseFloat(echeance.montant_du).toLocaleString('fr-GN')} GNF</span>.`,
                        type: 'wallet'
                    });
                    io.to(user.id).emit('notification_received', notifClient);
                    io.to(user.id).emit('credit_repayment_received', { echeance_id: echeance.id });

                    // Notifier la banque (tous les banquiers)
                    io.to('room_banque').emit('credit_repayment_received', { echeance_id: echeance.id, client_id: user.id, montant: echeance.montant_du });

                    // Si on a identifié un admin / banque spécifique, on peut aussi lui créer une notification DB
                    if (bankUser) {
                        const notifBanque = await creditRepository.createNotification({
                            utilisateur_id: bankUser.id,
                            titre: 'Remboursement reçu',
                            message: `Le client a remboursé une échéance de <span class="font-black text-emerald-500">${parseFloat(echeance.montant_du).toLocaleString('fr-GN')} GNF</span>. Transféré sur votre portefeuille.`,
                            type: 'wallet'
                        });
                        io.to(bankUser.id).emit('notification_received', notifBanque);
                    }
                }
            } catch (notifErr) {
                console.warn('[CREDIT] Erreur notification temps réel paiement:', notifErr.message);
            }

            return { outcome: 'paid', message: "Échéance payée et fonds transférés avec succès !", echeance };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    /** Demandes en attente (banque / admin) */
    async getPendingCredits() {
        return creditRepository.findPending();
    },

    /**
     * Carte des emprunteurs (banque / admin) : géocode approximatif (commune) dérivé de
     * l'adresse déclarée de chaque client distinct ayant une demande de crédit en cours
     * ou active (en_attente / approuve), utile pour visualiser la répartition
     * géographique du risque crédit.
     */
    async getCreditApplicantsMap() {
        const credits = await creditRepository.findActiveWithApplicant();

        const clientsById = new Map();
        const creditCountById = new Map();
        for (const credit of credits) {
            const client = credit.utilisateur;
            if (!client) continue;
            if (!clientsById.has(client.id)) clientsById.set(client.id, client);
            creditCountById.set(client.id, (creditCountById.get(client.id) || 0) + 1);
        }

        return [...clientsById.values()]
            .map((u) => {
                const geo = u.adresse ? geocodeEncryptedAddress(u.adresse, u.id) : null;
                return geo
                    ? {
                        id: u.id, nom_complet: u.nom_complet, avatar_url: u.avatar_url || null,
                        nb_credits: creditCountById.get(u.id) || 1,
                        location: { lat: geo.lat, lng: geo.lng }, commune: geo.commune,
                    }
                    : null;
            })
            .filter(Boolean);
    },

    /** Refuser une demande de crédit (banque / admin) */
    async rejectCredit(id, motif_refus) {
        const credit = await creditRepository.findById(id);
        if (!credit || credit.statut !== 'en_attente') {
            throw new AppError('Demande invalide ou déjà traitée.', 400);
        }

        credit.statut = 'refuse';
        credit.notes_admin = motif_refus || 'Demande refusée par l\'institution financière.';
        await creditRepository.save(credit);

        return { message: 'Demande de crédit refusée.', credit };
    },

    /** Récupérer mes crédits et leurs échéanciers */
    async getMyCredits(userId) {
        return creditRepository.findAllByUser(userId);
    },
};

module.exports = creditService;
