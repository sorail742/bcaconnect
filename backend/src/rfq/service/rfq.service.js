const AppError = require('../../utils/AppError');
const rfqRepository = require('../repository/rfq.repository');

const rfqService = {
    // Créer une demande de devis (acheteur : client ou fournisseur qui achète)
    async create({ titre, description, quantite, unite, budget_max, ville_livraison, date_limite, categorie_id }, userId) {
        if (!titre?.trim() || !description?.trim() || !quantite || Number(quantite) <= 0) {
            throw new AppError('Titre, description et quantité (positive) sont requis.', 400);
        }

        return rfqRepository.create({
            utilisateur_id: userId,
            titre: titre.trim(),
            description: description.trim(),
            quantite: Number(quantite),
            unite: unite?.trim() || 'unités',
            budget_max: budget_max ? Number(budget_max) : null,
            ville_livraison: ville_livraison?.trim() || null,
            date_limite: date_limite || null,
            categorie_id: categorie_id || null,
        });
    },

    // Marketplace des demandes ouvertes (vue fournisseur)
    async getOpen(categorieId) {
        return rfqRepository.findOpenFiltered(categorieId);
    },

    // Mes propres demandes (vue acheteur), avec tous les devis reçus
    async getMine(userId) {
        return rfqRepository.findMineWithQuotes(userId);
    },

    // Mes devis soumis (vue fournisseur)
    async getMyQuotes(userId) {
        return rfqRepository.findMyQuotes(userId);
    },

    // Détail d'une demande — les devis ne sont visibles en entier que par l'acheteur ;
    // un fournisseur non-propriétaire ne voit que son propre devis (négociation à l'aveugle).
    async getById(id, user) {
        const demande = await rfqRepository.findByIdFull(id);
        if (!demande) throw new AppError('Demande de devis introuvable.', 404);

        const isOwner = demande.utilisateur_id === user.id;
        const isAdmin = user.role === 'admin';
        if (!isOwner && !isAdmin) {
            demande.setDataValue('devis', demande.devis.filter((d) => d.fournisseur_id === user.id));
        }
        return demande;
    },

    // Soumettre (ou mettre à jour) un devis — un fournisseur = un devis par demande
    async submitQuote(id, { prix_unitaire, quantite_disponible, delai_livraison_jours, message }, user, io) {
        const demande = await rfqRepository.findById(id);
        if (!demande) throw new AppError('Demande de devis introuvable.', 404);
        if (demande.statut !== 'ouverte') throw new AppError('Cette demande n\'accepte plus de devis.', 400);
        if (demande.utilisateur_id === user.id) throw new AppError('Vous ne pouvez pas répondre à votre propre demande.', 400);
        if (!prix_unitaire || Number(prix_unitaire) <= 0 || !quantite_disponible || Number(quantite_disponible) <= 0) {
            throw new AppError('Prix unitaire et quantité disponible (positifs) sont requis.', 400);
        }

        const [quote] = await rfqRepository.upsertQuote({
            demande_id: demande.id,
            fournisseur_id: user.id,
            prix_unitaire: Number(prix_unitaire),
            quantite_disponible: Number(quantite_disponible),
            delai_livraison_jours: delai_livraison_jours ? Number(delai_livraison_jours) : null,
            message: message?.trim() || null,
            statut: 'en_attente',
        });

        try {
            if (io) {
                const notif = await rfqRepository.createNotification({
                    utilisateur_id: demande.utilisateur_id,
                    titre: 'Nouveau devis reçu',
                    message: `Un fournisseur a répondu à votre demande <span class="font-black text-primary">"${demande.titre}"</span>.`,
                    type: 'order',
                });
                io.to(demande.utilisateur_id).emit('notification_received', notif);
                io.to(demande.utilisateur_id).emit('rfq_quote_received', { demande_id: demande.id });
            }
        } catch (e) {
            console.warn('[RFQ] Notification nouveau devis:', e.message);
        }

        return quote;
    },

    // L'acheteur accepte un devis : la demande est attribuée, les autres devis
    // sont refusés, et une conversation est ouverte pour finaliser la commande
    // via le flux de commande/escrow existant (pas de court-circuit risqué ici).
    async acceptQuote(id, quoteId, user, io) {
        const demande = await rfqRepository.findByIdWithQuotes(id);
        if (!demande) throw new AppError('Demande de devis introuvable.', 404);
        if (demande.utilisateur_id !== user.id) throw new AppError('Non autorisé.', 403);
        if (demande.statut !== 'ouverte') throw new AppError('Cette demande a déjà été traitée.', 400);

        const accepted = demande.devis.find((d) => d.id === quoteId);
        if (!accepted) throw new AppError('Devis introuvable pour cette demande.', 404);

        await rfqRepository.rejectOtherQuotes(demande.id, quoteId);
        await rfqRepository.acceptQuoteById(quoteId);
        demande.statut = 'attribuee';
        demande.devis_accepte_id = quoteId;
        await rfqRepository.save(demande);

        let conversationId = null;
        try {
            conversationId = await rfqRepository.findOrCreateConversation(demande.utilisateur_id, accepted.fournisseur_id);
            if (io) {
                const notif = await rfqRepository.createNotification({
                    utilisateur_id: accepted.fournisseur_id,
                    titre: 'Devis accepté !',
                    message: `Votre devis pour <span class="font-black text-emerald-500">"${demande.titre}"</span> a été accepté. Finalisez la commande par message.`,
                    type: 'order',
                });
                io.to(accepted.fournisseur_id).emit('notification_received', notif);
                io.to(accepted.fournisseur_id).emit('rfq_quote_accepted', { demande_id: demande.id });
            }
        } catch (e) {
            console.warn('[RFQ] Notification/conversation acceptation devis:', e.message);
        }

        return { demande, conversation_id: conversationId };
    },

    // Fermer une demande sans accepter de devis
    async close(id, user) {
        const demande = await rfqRepository.findById(id);
        if (!demande) throw new AppError('Demande de devis introuvable.', 404);
        if (demande.utilisateur_id !== user.id) throw new AppError('Non autorisé.', 403);
        if (demande.statut !== 'ouverte') throw new AppError('Cette demande a déjà été traitée.', 400);

        demande.statut = 'annulee';
        await rfqRepository.save(demande);
        return demande;
    },
};

module.exports = rfqService;
