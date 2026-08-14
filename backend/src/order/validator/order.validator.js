const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("La commande doit contenir au moins un article.")
    .custom((items) => {
      if (!Array.isArray(items)) return false;
      return items.every(
        (item) =>
          (item.produit_id || item.productId || item.id) &&
          typeof (item.quantite || item.quantity) === "number" &&
          (item.quantite || item.quantity) > 0,
      );
    })
    .withMessage(
      "Chaque article doit avoir un produit_id et une quantité valide.",
    ),

  // Support both deliveryInfo (Object) and adresse_livraison (String)
  body("deliveryInfo")
    .optional()
    .isObject()
    .withMessage("deliveryInfo doit être un objet."),
  body("deliveryInfo.adresse")
    .if(body("deliveryInfo").exists())
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("L'adresse de livraison est trop courte."),

  body("adresse_livraison")
    .if(body("deliveryInfo").not().exists())
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("L'adresse de livraison est invalide."),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Les notes ne doivent pas dépasser 500 caractères."),

  body("type_livraison")
    .optional()
    .isIn(["eco", "standard", "prioritaire"])
    .withMessage("Type de livraison invalide (eco, standard, prioritaire)."),

  validateRequest,
];

const validateUpdateOrder = [
  // Le paramètre de route s'appelle `orderId` (voir order.route.js: '/:orderId/status'),
  // pas `id` — vérifier `id` échouait systématiquement (toujours undefined).
  param("orderId").isUUID().withMessage("ID commande invalide."),
  body("statut")
    .optional()
    // Seules ces deux valeurs sont de vraies cibles de transition acceptées par
    // order.service.updateOrderStatus (sa propre table de transitions) — les
    // autres statuts de commande (paiement, préparation, livraison) transitent
    // via des endpoints dédiés, jamais via cette route générique.
    .isIn(["annulé", "retourné"])
    .withMessage("Statut invalide."),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Les notes ne doivent pas dépasser 500 caractères."),
  validateRequest,
];

module.exports = { validateCreateOrder, validateUpdateOrder };
