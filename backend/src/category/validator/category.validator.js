const { body } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreateCategory = [
  body("nom_categorie")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom doit faire entre 2 et 100 caractères."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("La description ne doit pas dépasser 500 caractères."),
  body("image_url")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("L'URL de l'image ne doit pas dépasser 255 caractères."),
  validateRequest,
];

module.exports = { validateCreateCategory };
