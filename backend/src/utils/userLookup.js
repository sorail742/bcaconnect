const { Op } = require('sequelize');
const { User } = require('../models');
const encryptionService = require('./encryptionService');

const normalizePhone = (value) => String(value || '').replace(/[\s\-()]/g, '');

/** Recherche par téléphone en clair (chiffrement AES avec IV aléatoire en base). */
async function findUserByTelephone(telephone, excludeUserId = null) {
    const needle = normalizePhone(telephone);
    if (!needle) return null;

    const where = excludeUserId ? { id: { [Op.ne]: excludeUserId } } : {};
    const users = await User.findAll({ where, attributes: ['id', 'telephone'] });

    return users.find((u) => {
        const plain = typeof u.telephone === 'string' && u.telephone.includes(':')
            ? encryptionService.decrypt(u.telephone)
            : u.telephone;
        return normalizePhone(plain) === needle;
    }) || null;
}

module.exports = { findUserByTelephone, normalizePhone };
