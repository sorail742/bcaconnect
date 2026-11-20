const { Op } = require('sequelize');
const { User, Wallet, Store, sequelize } = require('../../models');
const OtpVerification = require('../models/otpVerification.model');

const authRepository = {
    startTransaction() {
        return sequelize.transaction();
    },

    findUserByEmail(email) {
        return User.findOne({ where: { email } });
    },

    findUserByPhone(telephone) {
        return User.findOne({ where: { telephone } });
    },

    createUser(data, transaction) {
        return User.create(data, transaction ? { transaction } : undefined);
    },

    createWallet(data, transaction) {
        return Wallet.create(data, transaction ? { transaction } : undefined);
    },

    createStore(data, transaction) {
        return Store.create(data, transaction ? { transaction } : undefined);
    },

    findUserById(id) {
        return User.findByPk(id);
    },

    findUserByIdForUpdate(id, transaction) {
        return User.findByPk(id, { transaction });
    },

    findUserWithWalletSafe(id) {
        return User.findByPk(id, {
            attributes: { exclude: ['mot_de_passe', 'two_factor_secret'] },
            include: [{ model: Wallet, as: 'portefeuille' }],
        });
    },

    findUserForOfflineCredentials(id) {
        return User.findByPk(id, {
            attributes: ['id', 'nom_complet', 'role', 'code_pin_offline'],
        });
    },

    saveUser(user) {
        return user.save();
    },

    updateUser(user, data, transaction) {
        return user.update(data, transaction ? { transaction } : undefined);
    },

    // --- OTP ---
    invalidatePendingOtps(telephone, typeAction) {
        return OtpVerification.update(
            { est_utilise: true },
            { where: { telephone, type_action: typeAction, est_utilise: false } },
        );
    },

    createOtp(data) {
        return OtpVerification.create(data);
    },

    findValidOtp(telephone, code, typeAction) {
        return OtpVerification.findOne({
            where: {
                telephone,
                code,
                type_action: typeAction,
                est_utilise: false,
                expire_at: { [Op.gt]: new Date() },
            },
            order: [['created_at', 'DESC']],
        });
    },

    saveOtp(otp) {
        return otp.save();
    },
};

module.exports = authRepository;
