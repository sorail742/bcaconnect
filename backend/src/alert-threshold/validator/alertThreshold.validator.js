const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateCreate = [
    body('produit_id').isUUID().withMessage('ID produit invalide.'),
    body('type').isIn(['prix_produit', 'stock_produit']).withMessage('Type de seuil invalide.'),
    body('operateur').optional().isIn(['inferieur_egal', 'superieur_egal']).withMessage('Opérateur invalide.'),
    body('valeur_seuil').isFloat({ min: 0 }).withMessage('La valeur du seuil doit être un nombre positif.'),
    validateRequest,
];

const validateToggle = [
    param('id').isUUID().withMessage('ID invalide.'),
    body('actif').isBoolean().withMessage('actif doit être un booléen.'),
    validateRequest,
];

const validateIdParam = [
    param('id').isUUID().withMessage('ID invalide.'),
    validateRequest,
];

module.exports = { validateCreate, validateToggle, validateIdParam };
