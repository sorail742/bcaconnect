const { Review, Product, Order, OrderItem, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const reviewController = {
    create: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { produit_id, commande_id, note, commentaire } = req.body;
            const utilisateur_id = req.user.id;

            if (!produit_id || !commande_id || !note) {
                await t.rollback();
                return res.status(400).json({ message: 'Produit, commande et note sont requis.' });
            }

            const order = await Order.findOne({
                where: { id: commande_id, utilisateur_id },
                include: [{ model: OrderItem, as: 'details' }],
                transaction: t,
            });

            if (!order) {
                await t.rollback();
                return res.status(403).json({ message: 'Vous ne pouvez pas noter une commande qui ne vous appartient pas.' });
            }

            if (order.statut !== 'livré') {
                await t.rollback();
                return res.status(400).json({ message: 'Vous ne pouvez noter qu\'après réception de la commande (statut livré).' });
            }

            const hasProduct = order.details?.some((d) => d.produit_id === produit_id);
            if (!hasProduct) {
                await t.rollback();
                return res.status(400).json({ message: 'Ce produit ne fait pas partie de la commande sélectionnée.' });
            }

            const existing = await Review.findOne({
                where: { utilisateur_id, produit_id, commande_id },
                transaction: t,
            });
            if (existing) {
                await t.rollback();
                return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour cette commande.' });
            }

            const review = await Review.create({
                utilisateur_id,
                produit_id,
                commande_id,
                note,
                commentaire: commentaire || '',
            }, { transaction: t });

            const user = await User.findByPk(utilisateur_id, { transaction: t });
            let change = 0;
            if (note >= 4) change = 2;
            if (note <= 2) change = -5;

            if (user && change !== 0) {
                const newScore = Math.min(150, Math.max(0, user.score_confiance + change));
                await user.update({ score_confiance: newScore }, { transaction: t });
            }

            await t.commit();
            res.status(201).json(review);
        } catch (error) {
            await t.rollback();
            next(error);
        }
    },

    getEligible: catchAsync(async (req, res) => {
        const { produit_id } = req.query;
        if (!produit_id) {
            throw new AppError('produit_id requis.', 400);
        }

        const reviewed = await Review.findAll({
            where: { utilisateur_id: req.user.id, produit_id },
            attributes: ['commande_id'],
        });
        const reviewedIds = reviewed.map((r) => r.commande_id);

        const orders = await Order.findAll({
            where: {
                utilisateur_id: req.user.id,
                statut: 'livré',
                ...(reviewedIds.length ? { id: { [Op.notIn]: reviewedIds } } : {}),
            },
            include: [{
                model: OrderItem,
                as: 'details',
                where: { produit_id },
                required: true,
            }],
            order: [['createdAt', 'DESC']],
        });

        res.json(orders.map((o) => ({
            id: o.id,
            created_at: o.createdAt,
            label: `Commande #${o.id.slice(0, 8).toUpperCase()}`,
        })));
    }),

    getProductReviews: async (req, res, next) => {
        try {
            const { productId } = req.params;
            const reviews = await Review.findAll({
                where: { produit_id: productId, est_approuve: true },
                include: [{ model: User, attributes: ['nom_complet'] }],
                order: [['createdAt', 'DESC']],
            });
            res.json(reviews);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = reviewController;
