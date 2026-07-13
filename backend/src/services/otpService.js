const crypto = require('crypto');
const { Op } = require('sequelize');
const { OtpVerification } = require('../models');
const AppError = require('../utils/AppError');

const OTP_TTL_MS = 10 * 60 * 1000;
const ALLOWED_ACTIONS = ['inscription', 'paiement', 'retrait', 'connexion', 'connexion_offline'];

const generateCode = () => String(crypto.randomInt(100000, 999999));

const otpService = {
    async createOtp(telephone, typeAction) {
        if (!telephone || !typeAction) {
            throw new AppError('Téléphone et type_action requis.', 400);
        }
        if (!ALLOWED_ACTIONS.includes(typeAction)) {
            throw new AppError(`type_action invalide. Valeurs : ${ALLOWED_ACTIONS.join(', ')}`, 400);
        }

        await OtpVerification.update(
            { est_utilise: true },
            { where: { telephone, type_action: typeAction, est_utilise: false } },
        );

        const code = generateCode();
        const expireAt = new Date(Date.now() + OTP_TTL_MS);

        const otp = await OtpVerification.create({
            telephone,
            code,
            type_action: typeAction,
            expire_at: expireAt,
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[OTP] ${telephone} (${typeAction}) → ${code} (expire ${expireAt.toISOString()})`);
        }

        return {
            id: otp.id,
            expire_at: expireAt,
            ...(process.env.NODE_ENV !== 'production' ? { code_dev: code } : {}),
        };
    },

    async verifyOtp(telephone, code, typeAction) {
        const otp = await OtpVerification.findOne({
            where: {
                telephone,
                code,
                type_action: typeAction,
                est_utilise: false,
                expire_at: { [Op.gt]: new Date() },
            },
            order: [['created_at', 'DESC']],
        });

        if (!otp) {
            throw new AppError('Code OTP invalide ou expiré.', 400);
        }

        otp.est_utilise = true;
        await otp.save();
        return { verified: true, type_action: typeAction };
    },
};

module.exports = otpService;
