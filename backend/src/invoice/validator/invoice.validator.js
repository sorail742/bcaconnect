const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateOrderIdParam = [
    param('orderId').isUUID().withMessage('ID commande invalide.'),
    validateRequest,
];

const validateCreateFromOrder = [
    param('orderId').isUUID().withMessage('ID commande invalide.'),
    body('acheteur_nif').optional({ nullable: true }).trim().isLength({ max: 50 }).withMessage('NIF invalide.'),
    validateRequest,
];

const validateIdParam = [
    param('id').isUUID().withMessage('ID invalide.'),
    validateRequest,
];

module.exports = { validateOrderIdParam, validateCreateFromOrder, validateIdParam };
