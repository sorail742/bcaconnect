const { Op } = require('sequelize');
const Intervention = require('../../sav/models/intervention.model');
const Guarantee = require('../../sav/models/guarantee.model');
const { Product, User } = require('../../models');

const technicianRepository = {
    countAvailable() {
        return Intervention.count({ where: { status: 'en_attente', technicien_id: null } });
    },

    findMyMissionsRaw(techId) {
        return Intervention.findAll({ where: { technicien_id: techId }, attributes: ['status', 'cout_estime'] });
    },

    findUserSpecialites(userId) {
        return User.findByPk(userId, { attributes: ['specialites', 'zone_intervention', 'nom_complet'] });
    },

    findAvailableMissions(specialites) {
        return Intervention.findAll({
            where: {
                status: 'en_attente',
                technicien_id: null,
                // Un technicien ne voit que les missions de sa spécialité — celles sans
                // spécialité précisée (legacy) restent visibles par tous.
                ...(specialites
                    ? { [Op.or]: [{ specialite_requise: null }, { specialite_requise: specialites }] }
                    : { specialite_requise: null }),
            },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'telephone', 'adresse'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    },

    findMyMissions(techId) {
        return Intervention.findAll({
            where: { technicien_id: techId },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'telephone', 'adresse'] },
            ],
            order: [['updatedAt', 'DESC']],
        });
    },

    findMyMissionsForMap(techId) {
        return Intervention.findAll({
            where: {
                technicien_id: techId,
                status: { [Op.in]: ['en_attente', 'en_cours'] },
            },
            include: [
                { model: Product, attributes: ['id', 'nom_produit'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'adresse'] },
            ],
        });
    },

    findById(id, opts = {}) {
        return Intervention.findByPk(id, opts);
    },

    findByIdForUpdate(id, transaction) {
        return Intervention.findByPk(id, { transaction, lock: transaction?.LOCK?.UPDATE });
    },

    save(intervention, { transaction } = {}) {
        return intervention.save({ transaction });
    },

    findEquipments(techId) {
        return Intervention.findAll({
            where: { technicien_id: techId },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url', 'description'] },
                { model: Guarantee, attributes: ['id', 'status', 'date_fin'] },
                { model: User, as: 'demandeur', attributes: ['nom_complet', 'telephone'] },
            ],
            order: [['updatedAt', 'DESC']],
        });
    },
};

module.exports = technicianRepository;
