const { body } = require('express-validator');
const { validateRequest } = require('../../../middlewares/dtoValidator');

const validateWalletTransfer = [
  body("destinataire_id")
    .notEmpty()
    .withMessage("ID destinataire requis.")
    .isUUID()
    .withMessage("ID destinataire invalide."),
  body("montant")
    .isFloat({ min: 0.01 })
    .withMessage("Le montant doit être supérieur à 0.")
    .toFloat(),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("La description ne doit pas dépasser 255 caractères."),
  validateRequest,
];

const validateWalletDeposit = [
  body("montant")
    .isFloat({ min: 0.01 })
    .withMessage("Le montant doit être supérieur à 0.")
    .toFloat(),
  body("methode_paiement")
    .isIn(["mobile_money", "carte_bancaire", "virement"])
    .withMessage("Méthode de paiement invalide."),
  validateRequest,
];

module.exports = { validateWalletTransfer, validateWalletDeposit };
