const Guarantee = require('../models/guarantee.model');
const Intervention = require('../models/intervention.model');
// NOTE: User/Product/Order sont déjà migrées mais n'exposent pas ces formes
// d'include précises ; Notification ne l'est pas encore.
const { Product, Order, User, Notification } = require('../../models');

const savRepository = {
    findGuaranteesByBuyer(buyerId) {
        return Guarantee.findAll({
            where: { acheteur_id: buyerId },
            include: [
                { model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'image_url', 'marque'] },
                { model: Order, attributes: ['id'] },
            ],
            order: [['created_at', 'DESC']],
        });
    },

    findActiveGuaranteeForBuyer(guaranteeId, buyerId) {
        return Guarantee.findOne({
            where: { id: guaranteeId, acheteur_id: buyerId, status: 'active' },
        });
    },

    createIntervention(data) {
        return Intervention.create(data);
    },

    findActiveTechnicians(specialite) {
        return User.findAll({
            where: {
                role: 'technicien',
                statut: 'actif',
                ...(specialite ? { specialites: specialite } : {}),
            },
            attributes: ['id'],
        });
    },

    createNotification(data) {
        return Notification.create(data);
    },

    findInterventionsByRequester(userId) {
        return Intervention.findAll({
            where: { demandeur_id: userId },
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'image_url', 'marque'] },
                { model: Guarantee, attributes: ['id', 'status', 'date_fin'] },
                { model: User, as: 'technicien', attributes: ['id', 'nom_complet', 'telephone'] },
            ],
            order: [['created_at', 'DESC']],
        });
    },

    findAllInterventions() {
        return Intervention.findAll({
            include: [
                { model: Product, attributes: ['id', 'nom_produit', 'marque', 'image_url'] },
                { model: Guarantee, attributes: ['id', 'status', 'date_fin'] },
                { model: User, as: 'demandeur', attributes: ['id', 'nom_complet', 'email', 'telephone'] },
                { model: User, as: 'technicien', attributes: ['id', 'nom_complet', 'telephone'] },
            ],
            order: [['created_at', 'DESC']],
        });
    },

    findInterventionById(id) {
        return Intervention.findByPk(id);
    },

    updateIntervention(intervention, updates) {
        return intervention.update(updates);
    },
};

module.exports = savRepository;
