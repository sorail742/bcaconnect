const { body, validationResult } = require('express-validator');

/**
 * Middleware global pour intercepter les erreurs de validation express-validator.
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Données invalides (Standard BCA v2.5)',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg
            }))
        });
    }
    next();
};

/**
 * Validation de l'inscription (Register)
 */
const validateRegister = [
    body('nom_complet')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit faire entre 2 et 100 caractères.')
        .escape(),
    body('email')
        .isEmail().withMessage('Format d\'email invalide.')
        .normalizeEmail(),
    body('telephone')
        .trim()
        .isLength({ min: 8, max: 20 }).withMessage('Le numéro de téléphone est invalide (min 8 chiffres).'),
    body('mot_de_passe')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères (Sécurité P0).')
        .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .escape(),
    body('role')
        .isIn(['client', 'fournisseur', 'transporteur', 'admin', 'banque'])
        .withMessage('Rôle de réseau invalide.'),
    validateRequest
];

/**
 * Validation du login
 */
const validateLogin = [
    body('email').isEmail().withMessage('Email requis.').normalizeEmail(),
    body('mot_de_passe').notEmpty().withMessage('Mot de passe requis.'),
    validateRequest
];

/**
 * Validation d'une demande de crédit (Finance)
 */
const validateCreditRequest = [
    body('montant')
        .isFloat({ min: 10000 }).withMessage('Montant minimum : 10 000 GNF.'),
    body('duree_mois')
        .isInt({ min: 1, max: 60 }).withMessage('Durée : entre 1 et 60 mois.'),
    validateRequest
];

/**
 * Validation d'une commande (e-Commerce)
 */
const validateOrderCreate = [
    body('items')
        .isArray({ min: 1 }).withMessage('La commande doit contenir au moins un article.'),
    body('items.*.produit_id').notEmpty().withMessage('ID produit requis.'),
    body('items.*.quantite').isInt({ min: 1 }).withMessage('Quantité minimum : 1.'),
    validateRequest
];

module.exports = { 
    validateRegister, 
    validateLogin,
    validateCreditRequest, 
    validateOrderCreate 
};
