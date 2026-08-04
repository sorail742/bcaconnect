const { sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const { SPECIALTY_LABELS } = require('../../constants/technicianSpecialties');
const reviewRepository = require('../repository/review.repository');

const reviewService = {
    async create({ produit_id, commande_id, note, commentaire }, userId) {
        const t = await sequelize.transaction();
        try {
            if (!produit_id || !commande_id || !note) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'Produit, commande et note sont requis.' };
            }

            const order = await reviewRepository.findOrderForUserWithDetails(commande_id, userId, t);

            if (!order) {
                await t.rollback();
                return { outcome: 'rejected', status: 403, message: 'Vous ne pouvez pas noter une commande qui ne vous appartient pas.' };
            }

            if (order.statut !== 'livré') {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'Vous ne pouvez noter qu\'après réception de la commande (statut livré).' };
            }

            const hasProduct = order.details?.some((d) => d.produit_id === produit_id);
            if (!hasProduct) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'Ce produit ne fait pas partie de la commande sélectionnée.' };
            }

            const existing = await reviewRepository.findExisting(userId, produit_id, commande_id, t);
            if (existing) {
                await t.rollback();
                return { outcome: 'rejected', status: 400, message: 'Vous avez déjà laissé un avis pour cette commande.' };
            }

            const review = await reviewRepository.create({
                utilisateur_id: userId,
                produit_id,
                commande_id,
                note,
                commentaire: commentaire || '',
            }, { transaction: t });

            const user = await reviewRepository.findUserById(userId, t);
            let change = 0;
            if (note >= 4) change = 2;
            if (note <= 2) change = -5;

            if (user && change !== 0) {
                const newScore = Math.min(150, Math.max(0, user.score_confiance + change));
                await reviewRepository.updateUserScore(user, newScore, t);
            }

            await t.commit();
            return { outcome: 'created', review };
        } catch (error) {
            if (!t.finished) await t.rollback();
            throw error;
        }
    },

    async getEligible(produit_id, userId) {
        if (!produit_id) {
            throw new AppError('produit_id requis.', 400);
        }

        const reviewed = await reviewRepository.findAllByUserAndProduct(userId, produit_id);
        const reviewedIds = reviewed.map((r) => r.commande_id);

        const deliveredOrders = await reviewRepository.findDeliveredOrdersForProduct(userId, produit_id, reviewedIds);

        // Le formulaire d'avis reste réservé aux vrais acheteurs (anti faux-avis), mais
        // un utilisateur sans commande éligible mérite une explication honnête plutôt
        // qu'un accès qui disparaît silencieusement — on distingue donc pourquoi.
        let status = 'eligible';
        if (deliveredOrders.length === 0) {
            const anyOrderWithProduct = await reviewRepository.findAnyOrdersWithProduct(userId, produit_id);
            const hasPurchased = anyOrderWithProduct.length > 0;
            const hasDeliveredOrder = anyOrderWithProduct.some((o) => o.statut === 'livré');
            if (!hasPurchased) status = 'not_purchased';
            else if (hasDeliveredOrder) status = 'already_reviewed';
            else status = 'awaiting_delivery';
        }

        return {
            status,
            orders: deliveredOrders.map((o) => ({
                id: o.id,
                created_at: o.createdAt,
                label: `Commande #${o.id.slice(0, 8).toUpperCase()}`,
            })),
        };
    },

    async getProductReviews(productId) {
        return reviewRepository.findApprovedForProduct(productId);
    },

    /** Avis publics pour la landing (100 % dynamique) */
    async getFeaturedReviews() {
        const avgRatingResult = await reviewRepository.getAverageApprovedRating();
        const avgRating = parseFloat(avgRatingResult?.avgNote) || 0;
        const totalReviews = await reviewRepository.countApproved();

        const reviews = await reviewRepository.findFeatured(12);

        const roleLabels = {
            fournisseur: 'Fournisseur',
            client: 'Acheteur',
            transporteur: 'Livreur',
            technicien: 'Technicien',
        };

        const badgeByRole = {
            fournisseur: 'Fournisseur vérifié',
            client: 'Acheteur actif',
            transporteur: 'Livreur partenaire',
            technicien: 'Technicien certifié',
        };

        const testimonials = await Promise.all(
            reviews.slice(0, 6).map(async (review) => {
                const userId = review.utilisateur_id;
                const ordersCount = await reviewRepository.countUserOrdersByStatuses(userId, ['payé', 'livré']);

                const userRole = review.User?.role || 'client';
                let company = roleLabels[userRole] || 'Membre BCA';
                if (userRole === 'technicien' && review.User?.specialites) {
                    company = `${SPECIALTY_LABELS[review.User.specialites] || review.User.specialites} · ${company}`;
                }

                return {
                    id: review.id,
                    name: review.User?.nom_complet || 'Membre BCA',
                    company,
                    content: review.commentaire,
                    rating: review.note,
                    orders: ordersCount > 0 ? `${ordersCount}+` : null,
                    badge: badgeByRole[userRole] || 'Membre vérifié',
                    createdAt: review.createdAt || review.created_at,
                };
            })
        );

        return {
            testimonials,
            avgRating: avgRating.toFixed(1),
            totalReviews,
        };
    },
};

module.exports = reviewService;
