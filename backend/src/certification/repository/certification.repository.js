const Certification = require('../models/certification.model');
// NOTE: Store appartient à la feature `store` (déjà migrée) — ici on ne fait
// qu'une mise à jour ciblée depuis la logique métier de certification.
const { User, Store } = require('../../models');

const certificationRepository = {
    create(data) {
        return Certification.create(data);
    },

    findAllByFournisseur(fournisseurId) {
        return Certification.findAll({
            where: { fournisseur_id: fournisseurId },
            order: [['createdAt', 'DESC']],
        });
    },

    findAllFiltered(statut) {
        return Certification.findAll({
            where: statut ? { statut } : {},
            include: [{ model: User, as: 'fournisseur', attributes: ['id', 'nom_complet', 'email', 'role'] }],
            order: [['createdAt', 'DESC']],
        });
    },

    findById(id) {
        return Certification.findByPk(id);
    },

    save(certification) {
        return certification.save();
    },

    markStoreVerified(fournisseurId) {
        return Store.update(
            { is_verified: true },
            { where: { proprietaire_id: fournisseurId } },
        );
    },

    setVerificationLevel(fournisseurId, niveau) {
        return Store.update(
            { niveau_verification: niveau },
            { where: { proprietaire_id: fournisseurId } },
        );
    },

    countValidatedForVendor(vendorId) {
        return Certification.count({
            where: { fournisseur_id: vendorId, statut: 'validee' },
        });
    },

    countDistinctValidatedTypesForVendor(vendorId) {
        return Certification.count({
            where: { fournisseur_id: vendorId, statut: 'validee' },
            distinct: true,
            col: 'type',
        });
    },
};

module.exports = certificationRepository;
