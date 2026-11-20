const { OrganizationOrderRequest, Organization, Product, ProductVariant, User, Notification } = require('../../models');
const AppError = require('../../utils/AppError');
const organizationService = require('./organization.service');
const orderService = require('../../order/service/order.service');

async function estimateTotal(items) {
    let total = 0;
    for (const item of items) {
        const pid = item.id || item.productId || item.product_id;
        const variantId = item.variantId || item.variant_id || null;
        const product = await Product.findByPk(pid);
        if (!product) throw new AppError(`Produit ${pid} non trouvé.`, 404);

        let unitPrice = product.prix_unitaire;
        if (variantId) {
            const variant = await ProductVariant.findByPk(variantId);
            if (variant && variant.prix_unitaire !== null) unitPrice = variant.prix_unitaire;
        }
        total += parseFloat(unitPrice) * item.quantity;
    }
    return total;
}

async function notifyValidators(organizationId, titre, message, io) {
    const { OrganizationMember } = require('../../models');
    const validators = await OrganizationMember.findAll({
        where: { organization_id: organizationId, role: ['valideur', 'admin'] },
    });
    for (const v of validators) {
        const notif = await Notification.create({ utilisateur_id: v.user_id, titre, message, type: 'system' });
        if (io) io.to(v.user_id).emit('notification_received', notif);
    }
}

const organizationOrderRequestService = {
    /**
     * Point d'entrée du workflow d'approbation (analyse concurrentielle #2) —
     * appelée par le checkout AVANT orderService.create() quand une commande
     * est passée au nom d'une organisation. Le flux de création de commande
     * existant (escrow, stock, paiement) n'est jamais modifié : il n'est
     * invoqué qu'au moment de l'approbation (ou immédiatement si sous le
     * plafond / rôle valideur-admin).
     */
    async submitOrderRequest(organizationId, orderPayload, user, io) {
        const org = await Organization.findByPk(organizationId);
        if (!org || !org.actif) throw new AppError('Organisation non trouvée ou inactive.', 404);

        const membership = await organizationService.getMembership(organizationId, user.id);
        if (!membership) throw new AppError("Vous n'êtes pas membre de cette organisation.", 403);

        const montant = await estimateTotal(orderPayload.items);

        const needsApproval = membership.role === 'acheteur'
            && (org.plafond_approbation_auto === null || montant > parseFloat(org.plafond_approbation_auto));

        if (!needsApproval) {
            // Sous le plafond, ou déjà valideur/admin : création immédiate via le flux existant.
            const result = await orderService.create(orderPayload, user, io);
            return { statut: 'approuvee_automatiquement', order: result };
        }

        const request = await OrganizationOrderRequest.create({
            organization_id: organizationId,
            demandeur_id: user.id,
            payload: orderPayload,
            montant_estime: montant,
        });

        await notifyValidators(
            organizationId,
            "Nouvelle demande d'achat à approuver",
            `<span class="font-bold">${user.nom_complet}</span> a soumis une commande de <span class="font-black">${montant.toLocaleString('fr-FR')} GNF</span> pour l'organisation <span class="font-bold">${org.nom}</span>, au-delà du plafond d'auto-approbation.`,
            io,
        );

        return { statut: 'en_attente', request };
    },

    async listPending(organizationId, user) {
        const membership = await organizationService.getMembership(organizationId, user.id);
        if (!membership || !['valideur', 'admin'].includes(membership.role)) {
            throw new AppError('Action réservée à un valideur ou administrateur.', 403);
        }
        return OrganizationOrderRequest.findAll({
            where: { organization_id: organizationId, statut: 'en_attente' },
            include: [{ model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'email'] }],
            order: [['createdAt', 'ASC']],
        });
    },

    async approve(requestId, user, io) {
        const request = await OrganizationOrderRequest.findByPk(requestId);
        if (!request) throw new AppError('Demande non trouvée.', 404);
        if (request.statut !== 'en_attente') throw new AppError('Cette demande a déjà été traitée.', 400);

        const membership = await organizationService.getMembership(request.organization_id, user.id);
        if (!membership || !['valideur', 'admin'].includes(membership.role)) {
            throw new AppError('Action réservée à un valideur ou administrateur.', 403);
        }

        const demandeur = await User.findByPk(request.demandeur_id);
        const result = await orderService.create(request.payload, demandeur, io);

        const order = result.order || result;
        await request.update({ statut: 'approuvee', traite_par_id: user.id, commande_id: order.id || null });

        const notif = await Notification.create({
            utilisateur_id: request.demandeur_id,
            titre: 'Demande d\'achat approuvée',
            message: `Votre commande de <span class="font-black">${parseFloat(request.montant_estime).toLocaleString('fr-FR')} GNF</span> a été approuvée et est maintenant en cours de traitement.`,
            type: 'system',
        });
        if (io) io.to(request.demandeur_id).emit('notification_received', notif);

        return request;
    },

    async reject(requestId, commentaire, user) {
        const request = await OrganizationOrderRequest.findByPk(requestId);
        if (!request) throw new AppError('Demande non trouvée.', 404);
        if (request.statut !== 'en_attente') throw new AppError('Cette demande a déjà été traitée.', 400);

        const membership = await organizationService.getMembership(request.organization_id, user.id);
        if (!membership || !['valideur', 'admin'].includes(membership.role)) {
            throw new AppError('Action réservée à un valideur ou administrateur.', 403);
        }

        await request.update({ statut: 'rejetee', traite_par_id: user.id, commentaire: commentaire || null });

        await Notification.create({
            utilisateur_id: request.demandeur_id,
            titre: 'Demande d\'achat refusée',
            message: `Votre commande de <span class="font-black">${parseFloat(request.montant_estime).toLocaleString('fr-FR')} GNF</span> a été refusée.${commentaire ? ` Motif : ${commentaire}` : ''}`,
            type: 'system',
        });

        return request;
    },
};

module.exports = organizationOrderRequestService;
