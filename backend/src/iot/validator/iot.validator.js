const { body, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateOrderIdParam = [
    param('orderId').isUUID().withMessage('ID commande invalide.'),
    validateRequest,
];

const validateActivate = [
    param('orderId').isUUID().withMessage('ID commande invalide.'),
    body('temp_min').optional({ nullable: true }).isFloat({ min: -50, max: 100 }).withMessage('Température minimale invalide.'),
    body('temp_max').optional({ nullable: true }).isFloat({ min: -50, max: 100 }).withMessage('Température maximale invalide.'),
    validateRequest,
];

const validateSensorData = [
    body('commande_id').isUUID().withMessage('ID commande invalide.'),
    body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
    body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
    body('temperature').optional({ nullable: true }).isFloat({ min: -50, max: 100 }),
    body('humidite').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
    validateRequest,
];

const validateSmartContract = [
    body('commande_id').isUUID().withMessage('ID commande invalide.'),
    body('type_contrat').isIn(['escrow', 'certificat_authenticite', 'transfert_propriete']).withMessage('Type de contrat invalide.'),
    validateRequest,
];

module.exports = { validateOrderIdParam, validateActivate, validateSensorData, validateSmartContract };
