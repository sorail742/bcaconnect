const { body } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreditRequest = [
  body("montant_principal")
    .isFloat({ min: 10000 })
    .withMessage("Montant minimum : 10 000 GNF.")
    .toFloat(),
  body("duree_mois")
    .isInt({ min: 1, max: 60 })
    .withMessage("Durée : entre 1 et 60 mois.")
    .toInt(),
  body("motif")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Le motif doit faire entre 10 et 500 caractères."),
  body("taux_interet")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Le taux d'intérêt doit être entre 0 et 100.")
    .toFloat(),
  validateRequest,
];

module.exports = { validateCreditRequest };
