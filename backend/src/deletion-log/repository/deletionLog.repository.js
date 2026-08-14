const DeletionLog = require('../models/deletionLog.model');
const { User } = require('../../models');

const AUTEUR_ATTRS = ['id', 'nom_complet', 'email', 'role'];
const INCLUDE_AUTEURS = [
    { model: User, as: 'auteur', attributes: AUTEUR_ATTRS },
    { model: User, as: 'restaurateur', attributes: AUTEUR_ATTRS },
];

const deletionLogRepository = {
    create(data, transaction) {
        return DeletionLog.create(data, transaction ? { transaction } : undefined);
    },

    findAndCountAllFiltered({ where, limit, offset }) {
        return DeletionLog.findAndCountAll({
            where,
            include: INCLUDE_AUTEURS,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    },

    findById(id) {
        return DeletionLog.findByPk(id, { include: INCLUDE_AUTEURS });
    },

    markRestored(log, restaure_par) {
        return log.update({ restaure: true, restaure_le: new Date(), restaure_par });
    },

    // Le modèle cible (Product, Category, ...) dépend de `table_affectee` et n'est
    // connu qu'à l'exécution — c'est le service qui résout quel Model utiliser.
    createRestoredRecord(Model, data) {
        return Model.create(data);
    },
};

module.exports = deletionLogRepository;
