const { body, param, validationResult } = require("express-validator");

/**
 * Middleware Global de Validation
 * Intercepte et formate les erreurs de validation
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Données invalides (Validation DTO)",
      errors: errors.array().map((e) => ({
        field: e.path || e.param,
        value: e.value,
        message: e.msg,
        location: e.location,
      })),
    });
  }
  next();
};

/**
 * ═══════════════════════════════════════════════════════════════
 * AVIS & ÉVALUATIONS (Reviews)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateReview = [
  body("produit_id")
    .notEmpty()
    .withMessage("ID produit requis.")
    .isUUID()
    .withMessage("ID produit invalide."),
  body("note")
    .isInt({ min: 1, max: 5 })
    .withMessage("La note doit être entre 1 et 5.")
    .toInt(),
  body("commentaire")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Le commentaire doit faire entre 10 et 1000 caractères."),
  validateRequest,
];

/**
 * ═══════════════════════════════════════════════════════════════
 * MESSAGES (Messages)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateMessage = [
  body("destinataire_id")
    .notEmpty()
    .withMessage("ID destinataire requis.")
    .isUUID()
    .withMessage("ID destinataire invalide."),
  body("contenu")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Le message doit faire entre 1 et 5000 caractères."),
  body("type")
    .optional()
    .isIn(["texte", "image", "fichier", "audio"])
    .withMessage("Type de message invalide."),
  validateRequest,
];

/**
 * ═══════════════════════════════════════════════════════════════
 * ANNONCES (Ads)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateAd = [
  body("titre")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Le titre doit faire entre 5 et 100 caractères."),
  body("description")
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("La description doit faire entre 20 et 2000 caractères."),
  body("budget")
    .isFloat({ min: 1000 })
    .withMessage("Le budget minimum est 1000 GNF.")
    .toFloat(),
  body("duree_jours")
    .isInt({ min: 1, max: 365 })
    .withMessage("La durée doit être entre 1 et 365 jours.")
    .toInt(),
  validateRequest,
];

module.exports = {
  validateRequest,
  // Reviews
  validateCreateReview,
  // Messages
  validateCreateMessage,
  // Ads
  validateCreateAd,
};
