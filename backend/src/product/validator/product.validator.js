const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreateProduct = [
  body("nom_produit")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Le nom du produit doit faire entre 2 et 200 caractères."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("La description ne doit pas dépasser 2000 caractères."),
  body("prix_unitaire")
    .isFloat({ min: 0.01 })
    .withMessage("Le prix doit être supérieur à 0.")
    .toFloat(),
  body("stock_quantite")
    .isInt({ min: 0 })
    .withMessage("La quantité doit être un nombre positif.")
    .toInt(),
  body("categorie_id")
    .notEmpty()
    .withMessage("Catégorie requise.")
    .custom((value) => {
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      const staticRegex = /^static-cat-\d+$/;
      if (uuidRegex.test(value) || staticRegex.test(value)) return true;
      throw new Error(
        "ID catégorie invalide. Doit être UUID ou static-cat-<num>.",
      );
    })
    .withMessage("ID catégorie invalide."),
  body("images")
    .optional()
    .isArray()
    .withMessage("Les images doivent être un tableau."),
  validateRequest,
];

const validateUpdateProduct = [
  param("id").isUUID().withMessage("ID produit invalide."),
  body("nom_produit")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Le nom du produit doit faire entre 2 et 200 caractères."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("La description ne doit pas dépasser 2000 caractères."),
  body("prix_unitaire")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Le prix doit être supérieur à 0.")
    .toFloat(),
  body("stock_quantite")
    .optional()
    .isInt({ min: 0 })
    .withMessage("La quantité doit être un nombre positif.")
    .toInt(),
  validateRequest,
];

const validateDeleteProduct = [
  param("id").isUUID().withMessage("ID produit invalide."),
  validateRequest,
];

const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("La recherche doit faire entre 1 et 100 caractères."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Le numéro de page doit être supérieur à 0.")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("La limite doit être entre 1 et 100.")
    .toInt(),
  query("categorie_id")
    .optional()
    .custom((value) => {
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      const staticRegex = /^static-cat-\d+$/;
      if (uuidRegex.test(value) || staticRegex.test(value)) return true;
      throw new Error(
        "ID catégorie invalide. Doit être UUID ou static-cat-<num>.",
      );
    })
    .withMessage("ID catégorie invalide."),
  query("prix_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le prix minimum doit être positif.")
    .toFloat(),
  query("prix_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le prix maximum doit être positif.")
    .toFloat(),
  validateRequest,
];

module.exports = { validateCreateProduct, validateUpdateProduct, validateDeleteProduct, validateSearch };
