const { Review, Product, Order, User, sequelize } = require('../models');

const reviewController = {
    create: async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { produit_id, commande_id, note, commentaire } = req.body;
            const utilisateur_id = req.user.id;

            // Vérifier si la commande appartient à l'utilisateur
            const order = await Order.findOne({ where: { id: commande_id, utilisateur_id } });
            if (!order) return res.status(403).json({ message: "Vous ne pouvez pas noter une commande qui ne vous appartient pas." });

            const review = await Review.create({
                utilisateur_id,
                produit_id,
                commande_id,
                note,
                commentaire
            }, { transaction: t });

            // Logic dynamique de Score de Confiance
            // Chaque note positive (>=4) augmente la confiance de 2 points
            // Chaque note négative (<=2) la diminue de 5 points
            const user = await User.findByPk(utilisateur_id);
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

    getProductReviews: async (req, res, next) => {
        try {
            const { productId } = req.params;
            const reviews = await Review.findAll({
                where: { produit_id: productId },
                include: [{ model: User, attributes: ['nom_complet'] }],
                order: [['createdAt', 'DESC']]
            });
            res.json(reviews);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = reviewController;
