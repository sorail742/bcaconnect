const Coupon = require('../models/coupon.model');
const CouponUsage = require('../models/couponUsage.model');
const { Store, Product } = require('../../models');
const storeRepository = require('../../store/repository/store.repository');

const couponRepository = {
    findByCode(code, { transaction, lock } = {}) {
        return Coupon.findOne({ where: { code }, transaction, lock });
    },

    findById(id) {
        return Coupon.findByPk(id);
    },

    create(data) {
        return Coupon.create(data);
    },

    save(coupon, { transaction } = {}) {
        return coupon.save({ transaction });
    },

    findAllFiltered(where) {
        return Coupon.findAll({
            where,
            include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique'] }],
            order: [['createdAt', 'DESC']],
        });
    },

    findStoreByOwner(ownerId) {
        return storeRepository.findByOwnerId(ownerId);
    },

    findProductsByIds(ids) {
        return Product.findAll({ where: { id: ids }, attributes: ['id', 'boutique_id', 'prix_unitaire'] });
    },

    countUserUsage(couponId, userId, { transaction } = {}) {
        return CouponUsage.count({ where: { coupon_id: couponId, utilisateur_id: userId }, transaction });
    },

    createUsage(data, { transaction } = {}) {
        return CouponUsage.create(data, { transaction });
    },

    sumDiscountForCoupon(couponId) {
        return CouponUsage.sum('montant_reduction', { where: { coupon_id: couponId } });
    },

    findUsagesForCoupon(couponId, limit = 50) {
        return CouponUsage.findAll({ where: { coupon_id: couponId }, order: [['createdAt', 'DESC']], limit });
    },
};

module.exports = couponRepository;
