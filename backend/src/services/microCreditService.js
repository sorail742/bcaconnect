/**
 * Micro-prêt — produit de financement distinct du crédit classique, pensé
 * pour les utilisateurs sous-bancarisés (cahier des charges 3.13) : montant
 * plafonné, durée courte, et approbation automatique si le score de
 * solvabilité IA est suffisant (pas d'attente de revue banque, contrairement
 * au crédit classique). Réutilise entièrement l'infrastructure Credit/
 * Echeancier existante — seule la logique d'éligibilité/plafonds change.
 */

/** Montant maximum empruntable en micro-prêt (GNF). Configurable via .env. */
const MAX_AMOUNT = (() => {
    const raw = parseFloat(process.env.MICRO_CREDIT_MAX_AMOUNT);
    return Number.isFinite(raw) && raw > 0 ? raw : 500000;
})();

/** Durée maximale de remboursement (mois). Configurable via .env. */
const MAX_DURATION_MONTHS = (() => {
    const raw = parseInt(process.env.MICRO_CREDIT_MAX_DURATION_MONTHS, 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 3;
})();

/** Score IA (sur 100) à partir duquel le micro-prêt est approuvé automatiquement,
 * sans attendre de revue manuelle par la banque. Configurable via .env. */
const AUTO_APPROVE_SCORE_THRESHOLD = (() => {
    const raw = parseFloat(process.env.MICRO_CREDIT_AUTO_APPROVE_SCORE);
    return Number.isFinite(raw) && raw >= 0 && raw <= 100 ? raw : 50;
})();

const isEligibleAmount = (montant) => parseFloat(montant) > 0 && parseFloat(montant) <= MAX_AMOUNT;
const isEligibleDuration = (mois) => Number.isInteger(mois) && mois >= 1 && mois <= MAX_DURATION_MONTHS;
const qualifiesForAutoApproval = (score) => Number.isFinite(score) && score >= AUTO_APPROVE_SCORE_THRESHOLD;

module.exports = {
    MAX_AMOUNT,
    MAX_DURATION_MONTHS,
    AUTO_APPROVE_SCORE_THRESHOLD,
    isEligibleAmount,
    isEligibleDuration,
    qualifiesForAutoApproval,
};
