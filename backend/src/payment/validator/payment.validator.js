const { body } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreatePayment = [
  body("montant")
    .isFloat({ min: 0.01 })
    .withMessage("Le montant doit être supérieur à 0.")
    .toFloat(),
  body("methode_paiement")
    .optional()
    .isIn([
      "mobile_money",
      "carte_bancaire",
      "portefeuille",
      "crypto",
      "virement",
    ])
    .withMessage("Méthode de paiement invalide."),
  body("moyen_paiement")
    .optional()
    .isIn([
      "mobile_money",
      "carte_bancaire",
      "portefeuille",
      "crypto",
      "virement",
    ])
    .withMessage("Méthode de paiement invalide."),
  body("commande_id").optional().isUUID().withMessage("ID commande invalide."),
  body("order_id").optional().isUUID().withMessage("ID commande invalide."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("La description ne doit pas dépasser 255 caractères."),
  validateRequest,
];

module.exports = { validateCreatePayment };
