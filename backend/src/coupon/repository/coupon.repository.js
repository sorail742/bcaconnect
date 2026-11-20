const Coupon = require('../models/coupon.model');
const CouponUsage = require('../models/couponUsage.model');

// findById/create/findAllFiltered/findStoreByOwner/findProductsByIds/
// sumDiscountForCoupon/findUsagesForCoupon ont basculé vers NestJS/Prisma
// avec le reste de la surface HTTP admin (voir coupon.service.js) — seules
// les méthodes utilisées par validate/recordUsage (order.service.js)
// restent ici.
const couponRepository = {
    findByCode(code, { transaction, lock } = {}) {
        return Coupon.findOne({ where: { code }, transaction, lock });
    },

    save(coupon, { transaction } = {}) {
        return coupon.save({ transaction });
    },

    countUserUsage(couponId, userId, { transaction } = {}) {
        return CouponUsage.count({ where: { coupon_id: couponId, utilisateur_id: userId }, transaction });
    },

    createUsage(data, { transaction } = {}) {
        return CouponUsage.create(data, { transaction });
    },
};

module.exports = couponRepository;
