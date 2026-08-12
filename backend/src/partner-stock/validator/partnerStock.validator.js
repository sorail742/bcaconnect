const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateProduitIdParam = [
    param('produitId').isUUID().withMessage('ID produit invalide.'),
    validateRequest,
];

const validateCreate = [
    param('produitId').isUUID().withMessage('ID produit invalide.'),
    body('partenaire_nom')
        .trim()
        .isLength({ min: 2, max: 150 })
        .withMessage('Le nom du partenaire doit faire entre 2 et 150 caractères.'),
    body('partenaire_contact').optional({ nullable: true }).trim().isLength({ max: 150 }),
    body('type_stock')
        .optional()
        .isIn(['consigne', 'entrepot_tiers', 'dropshipping'])
        .withMessage('Type de stock invalide.'),
    body('quantite')
        .isInt({ min: 0 })
        .withMessage('La quantité doit être un nombre positif.')
        .toInt(),
    body('localisation').optional({ nullable: true }).trim().isLength({ max: 200 }),
    body('notes').optional({ nullable: true }).trim().isLength({ max: 1000 }),
    validateRequest,
];

const validateUpdate = [
    param('id').isUUID().withMessage('ID invalide.'),
    body('partenaire_nom').optional().trim().isLength({ min: 2, max: 150 }),
    body('partenaire_contact').optional({ nullable: true }).trim().isLength({ max: 150 }),
    body('type_stock').optional().isIn(['consigne', 'entrepot_tiers', 'dropshipping']),
    body('quantite').optional().isInt({ min: 0 }).toInt(),
    body('localisation').optional({ nullable: true }).trim().isLength({ max: 200 }),
    body('notes').optional({ nullable: true }).trim().isLength({ max: 1000 }),
    validateRequest,
];

const validateIdParam = [
    param('id').isUUID().withMessage('ID invalide.'),
    validateRequest,
];

module.exports = { validateProduitIdParam, validateCreate, validateUpdate, validateIdParam };
