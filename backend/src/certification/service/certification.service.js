const AppError = require('../../utils/AppError');
const certificationRepository = require('../repository/certification.repository');

const STATUTS = ['en_attente', 'validee', 'rejetee'];

// Seuils du niveau de vérification (analyse concurrentielle #5) — basés sur
// le nombre de TYPES DISTINCTS de certification validés (pas le nombre brut
// de documents, pour éviter qu'un même type re-soumis plusieurs fois gonfle
// artificiellement le niveau).
const GOLD_THRESHOLD = 3;

async function recomputeVerificationLevel(fournisseurId) {
    const distinctTypes = await certificationRepository.countDistinctValidatedTypesForVendor(fournisseurId);
    const niveau = distinctTypes >= GOLD_THRESHOLD ? 'verifie_or' : distinctTypes >= 1 ? 'verifie' : 'non_verifie';
    await certificationRepository.setVerificationLevel(fournisseurId, niveau);
    return niveau;
}

const certificationService = {
    // 1. Le fournisseur soumet une certification
    async create({ type, document_url, date_expiration }, userId) {
        if (!type || !document_url) {
            throw new AppError('Type et document sont requis.', 400);
        }

        return certificationRepository.create({
            fournisseur_id: userId,
            type,
            document_url,
            date_expiration: date_expiration || null,
        });
    },

    // 2. Le fournisseur consulte ses propres certifications
    async getMine(userId) {
        return certificationRepository.findAllByFournisseur(userId);
    },

    // 3. Admin : liste de toutes les certifications (filtrable par statut)
    async getAll(statut) {
        return certificationRepository.findAllFiltered(statut);
    },

    // 4. Admin : valide ou rejette une certification
    async review(id, { statut, commentaire_admin }) {
        if (!STATUTS.includes(statut) || statut === 'en_attente') {
            throw new AppError('Statut invalide. Attendu : validee ou rejetee.', 400);
        }

        const certification = await certificationRepository.findById(id);
        if (!certification) throw new AppError('Certification non trouvée.', 404);

        certification.statut = statut;
        certification.commentaire_admin = commentaire_admin || null;
        await certificationRepository.save(certification);

        // Marque la boutique du fournisseur comme vérifiée dès qu'au moins une certification est validée,
        // et recalcule son niveau de vérification (non_verifie / verifie / verifie_or).
        if (statut === 'validee') {
            await certificationRepository.markStoreVerified(certification.fournisseur_id);
        }
        const niveau_verification = await recomputeVerificationLevel(certification.fournisseur_id);

        return { ...certification.toJSON(), niveau_verification };
    },

    // 5. Statut public de certification d'un fournisseur (badge boutique)
    async getVendorStatus(vendorId) {
        const count = await certificationRepository.countValidatedForVendor(vendorId);
        const distinctTypes = await certificationRepository.countDistinctValidatedTypesForVendor(vendorId);
        const niveau_verification = distinctTypes >= GOLD_THRESHOLD ? 'verifie_or' : distinctTypes >= 1 ? 'verifie' : 'non_verifie';
        return { certified: count > 0, count, niveau_verification };
    },
};

module.exports = certificationService;
