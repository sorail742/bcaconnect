const { body } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateAssignOrder = [
  body("orderId")
    .notEmpty()
    .withMessage("ID commande requis.")
    .isUUID()
    .withMessage("ID commande invalide."),
  validateRequest,
];

const validateCarrierTracking = [
  body("orderId")
    .notEmpty()
    .withMessage("ID commande requis.")
    .isUUID()
    .withMessage("ID commande invalide."),
  body("status")
    .optional()
    .isIn(["en_attente", "ramasse", "en_route", "livre", "echouee"])
    .withMessage("Statut invalide."),
  body("latitude")
    .optional()
    .isFloat()
    .withMessage("Latitude invalide.")
    .toFloat(),
  body("longitude")
    .optional()
    .isFloat()
    .withMessage("Longitude invalide.")
    .toFloat(),
  body("commentaire")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Le commentaire ne doit pas dépasser 500 caractères."),
  validateRequest,
];

const validateVerifyOTP = [
  body("orderId")
    .notEmpty()
    .withMessage("ID commande requis.")
    .isUUID()
    .withMessage("ID commande invalide."),
  body("otp")
    .notEmpty()
    .withMessage("Code OTP requis.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Le code OTP doit faire 6 chiffres.")
    .isNumeric()
    .withMessage("Le code OTP doit être numérique."),
  validateRequest,
];

module.exports = { validateAssignOrder, validateCarrierTracking, validateVerifyOTP };
