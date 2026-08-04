const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreateDispute = [
  body("commande_id")
    .notEmpty()
    .withMessage("ID commande requis.")
    .isUUID()
    .withMessage("ID commande invalide."),
  body("type")
    .isIn(["qualite", "livraison", "paiement", "autre"])
    .withMessage("Type de litige invalide."),
  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("La description doit faire entre 10 et 2000 caractères."),
  body("defenseur_id")
    .optional()
    .isUUID()
    .withMessage("ID défenseur invalide."),
  validateRequest,
];

const validateDisputeStatus = [
  param("id").isUUID().withMessage("ID litige invalide."),
  body("statut")
    .notEmpty()
    .withMessage("Statut requis.")
    .isIn(["ouvert", "en_cours", "en_mediation", "resolu", "ferme", "archive"])
    .withMessage("Statut invalide."),
  validateRequest,
];

const validateDisputeArchive = [
  param("id").isUUID().withMessage("ID litige invalide."),
  validateRequest,
];

const validateDisputeRespond = [
  param("id").isUUID().withMessage("ID litige invalide."),
  body("message")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("La réponse doit faire entre 10 et 2000 caractères."),
  validateRequest,
];

const validateDisputeEscalate = [
  param("id").isUUID().withMessage("ID litige invalide."),
  body("motif")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Motif trop long (max 500 caractères)."),
  validateRequest,
];

const validateUpdateDispute = [
  param("id").isUUID().withMessage("ID litige invalide."),
  body("statut")
    .optional()
    .isIn(["ouvert", "en_cours", "en_mediation", "resolu", "ferme", "archive"])
    .withMessage("Statut invalide."),
  body("decision_finale")
    .optional()
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage("La décision doit faire entre 5 et 2000 caractères."),
  body("resolution")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("La résolution ne doit pas dépasser 1000 caractères."),
  body("resolution_type")
    .optional()
    .isIn(["mediation_seule", "remboursement_integral", "remboursement_partiel", "bon_achat", "liberation_vendeur"])
    .withMessage("Type de résolution invalide."),
  body("remboursement_montant")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Montant de remboursement invalide."),
  validateRequest,
];

module.exports = {
  validateCreateDispute,
  validateDisputeStatus,
  validateDisputeRespond,
  validateDisputeEscalate,
  validateUpdateDispute,
  validateDisputeArchive,
};
