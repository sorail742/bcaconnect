const catchAsync = require('../../utils/catchAsync');
const couponService = require('../service/coupon.service');

const couponController = {
    // Créer un coupon — admin (plateforme, boutique_id null) ou fournisseur (sa propre boutique)
    create: catchAsync(async (req, res) => {
        const coupon = await couponService.create(req.body, req.user);
        res.status(201).json({ message: 'Code promo créé.', coupon });
    }),

    // Mes coupons (admin = tous les coupons plateforme ; fournisseur = ceux de sa boutique)
    getMine: catchAsync(async (req, res) => {
        const coupons = await couponService.getMine(req.user);
        res.json(coupons);
    }),

    // Validation à froid pour l'aperçu panier (sans consommer l'usage)
    validate: catchAsync(async (req, res) => {
        const { code, items } = req.body;
        const result = await couponService.validateCart(code, items, req.user);
        res.json(result);
    }),

    toggleActive: catchAsync(async (req, res) => {
        const result = await couponService.toggleActive(req.params.id, req.user);
        res.json(result);
    }),

    getStats: catchAsync(async (req, res) => {
        const result = await couponService.getStats(req.params.id, req.user);
        res.json(result);
    }),
};

module.exports = couponController;
