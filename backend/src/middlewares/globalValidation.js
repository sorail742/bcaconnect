const { body, validationResult } = require('express-validator');
const xss = require('xss');

/**
 * Middleware Global de Validation & Sanitization
 * Appliqué à TOUTES les requêtes pour une protection maximale
 */

/**
 * 1. Middleware de Sanitization Globale
 * Nettoie tous les inputs contre XSS, injection SQL, etc.
 */
const globalSanitization = (req, res, next) => {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        const sensitiveFields = ['mot_de_passe', 'password', 'token', 'secret', 'two_factor_secret'];
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string' && !sensitiveFields.includes(key)) {
                // Nettoyer XSS
                req.body[key] = xss(req.body[key]);
                // Trim whitespace
                req.body[key] = req.body[key].trim();
            }
        });
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = xss(req.query[key]).trim();
            }
        });
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = xss(req.params[key]).trim();
            }
        });
    }

    next();
};

/**
 * 2. Middleware de Validation Globale
 * Valide les types de contenu et les headers
 */
const globalValidation = (req, res, next) => {
    // Vérifier Content-Type pour les requêtes POST/PUT/PATCH (si un body est présent)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && Object.keys(req.body || {}).length > 0) {
        const contentType = req.headers['content-type'];
        
        if (!contentType) {
            return res.status(400).json({
                message: 'Content-Type header requis pour les requêtes avec corps',
                error: 'Content-Type manquant'
            });
        }

        // Accepter JSON et form-data
        if (!contentType.includes('application/json') && 
            !contentType.includes('multipart/form-data') &&
            !contentType.includes('application/x-www-form-urlencoded')) {
            return res.status(415).json({
                message: 'Content-Type non supporté',
                error: 'Utilisez application/json ou multipart/form-data'
            });
        }
    }

    // Vérifier la taille du payload
    const contentLength = parseInt(req.headers['content-length'] || 0);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
        return res.status(413).json({
            message: 'Payload trop volumineux',
            error: `Taille maximale: ${maxSize / 1024 / 1024}MB`
        });
    }

    next();
};

/**
 * 3. Middleware de Gestion des Erreurs de Validation
 * Formate les erreurs de validation express-validator
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            value: error.value,
            message: error.msg,
            location: error.location,
            nestedErrors: error.nestedErrors
        }));

        return res.status(422).json({
            message: 'Validation des données échouée',
            errors: formattedErrors,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

/**
 * 4. Middleware de Validation des Paramètres UUID
 * Valide automatiquement tous les paramètres UUID
 */
const validateUUIDParams = (req, res, next) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    Object.keys(req.params).forEach(key => {
        if (key.includes('id') && !uuidRegex.test(req.params[key])) {
            return res.status(400).json({
                message: 'Paramètre invalide',
                error: `${key} doit être un UUID valide`
            });
        }
    });

    next();
};

/**
 * 5. Middleware de Validation des Limites de Pagination
 * Valide et limite les paramètres de pagination
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Limites
    if (page < 1) {
        return res.status(400).json({
            message: 'Paramètre invalide',
            error: 'page doit être supérieur à 0'
        });
    }

    if (limit < 1 || limit > 100) {
        return res.status(400).json({
            message: 'Paramètre invalide',
            error: 'limit doit être entre 1 et 100'
        });
    }

    // Ajouter les valeurs validées à req
    req.pagination = { page, limit, offset: (page - 1) * limit };

    next();
};

/**
 * 6. Middleware de Validation des Montants Monétaires
 * Valide les montants pour éviter les erreurs de calcul
 */
const validateMonetaryAmounts = (req, res, next) => {
    const monetaryFields = ['montant', 'prix', 'solde', 'budget', 'montant_principal'];
    
    Object.keys(req.body || {}).forEach(key => {
        if (monetaryFields.some(field => key.toLowerCase().includes(field))) {
            const value = req.body[key];
            
            if (typeof value === 'number') {
                // Vérifier les décimales (max 2)
                if (value.toString().split('.')[1]?.length > 2) {
                    return res.status(400).json({
                        message: 'Montant invalide',
                        error: `${key} ne peut avoir plus de 2 décimales`
                    });
                }

                // Vérifier la plage
                if (value < 0 || value > 999999999.99) {
                    return res.status(400).json({
                        message: 'Montant invalide',
                        error: `${key} doit être entre 0 et 999999999.99`
                    });
                }
            }
        }
    });

    next();
};

/**
 * 7. Middleware de Validation des Dates
 * Valide les formats de date ISO 8601
 */
const validateDates = (req, res, next) => {
    const dateFields = ['date', 'date_debut', 'date_fin', 'date_creation', 'date_modification'];
    
    Object.keys(req.body || {}).forEach(key => {
        if (dateFields.some(field => key.toLowerCase().includes(field))) {
            const value = req.body[key];
            
            if (value && typeof value === 'string') {
                const date = new Date(value);
                
                if (isNaN(date.getTime())) {
                    return res.status(400).json({
                        message: 'Date invalide',
                        error: `${key} doit être au format ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)`
                    });
                }

                // Vérifier que la date n'est pas trop loin dans le passé ou le futur
                const now = new Date();
                const maxPastDate = new Date(now.getFullYear() - 100, 0, 1);
                const maxFutureDate = new Date(now.getFullYear() + 100, 11, 31);

                if (date < maxPastDate || date > maxFutureDate) {
                    return res.status(400).json({
                        message: 'Date invalide',
                        error: `${key} doit être entre ${maxPastDate.getFullYear()} et ${maxFutureDate.getFullYear()}`
                    });
                }
            }
        }
    });

    next();
};

/**
 * 8. Middleware de Validation des Énumérations
 * Valide les champs énumérés
 */
const validateEnums = (req, res, next) => {
    const enums = {
        role: ['client', 'fournisseur', 'transporteur', 'admin', 'banque'],
        statut: ['actif', 'inactif', 'bloque', 'supprime', 'en_attente'],
        statut_commande: ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'],
        statut_paiement: ['en_attente', 'complete', 'echouee', 'remboursee'],
        methode_paiement: ['mobile_money', 'carte_bancaire', 'portefeuille', 'crypto', 'virement'],
        type_litige: ['qualite', 'livraison', 'paiement', 'autre'],
        type_vehicule: ['moto', 'voiture', 'camion', 'velo', 'autre']
    };

    Object.keys(req.body || {}).forEach(key => {
        if (enums[key] && req.body[key]) {
            if (!enums[key].includes(req.body[key])) {
                return res.status(400).json({
                    message: 'Valeur invalide',
                    error: `${key} doit être l'une de: ${enums[key].join(', ')}`
                });
            }
        }
    });

    next();
};

/**
 * 9. Middleware de Validation des Tableaux
 * Valide les champs de type tableau
 */
const validateArrays = (req, res, next) => {
    const arrayFields = ['items', 'images', 'fichiers', 'tags', 'categories'];
    
    Object.keys(req.body || {}).forEach(key => {
        if (arrayFields.some(field => key.toLowerCase().includes(field))) {
            const value = req.body[key];
            
            if (value !== undefined && !Array.isArray(value)) {
                return res.status(400).json({
                    message: 'Format invalide',
                    error: `${key} doit être un tableau`
                });
            }

            // Vérifier la taille du tableau
            if (Array.isArray(value) && value.length > 1000) {
                return res.status(400).json({
                    message: 'Tableau trop volumineux',
                    error: `${key} ne peut contenir plus de 1000 éléments`
                });
            }
        }
    });

    next();
};

/**
 * 10. Middleware de Validation des Objets Imbriqués
 * Valide les structures d'objets imbriqués
 */
const validateNestedObjects = (req, res, next) => {
    const validateObject = (obj, path = '') => {
        if (typeof obj !== 'object' || obj === null) return true;

        for (const key in obj) {
            const fullPath = path ? `${path}.${key}` : key;
            const value = obj[key];

            // Vérifier la profondeur
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const depth = fullPath.split('.').length;
                if (depth > 5) {
                    return false;
                }
                if (!validateObject(value, fullPath)) {
                    return false;
                }
            }
        }
        return true;
    };

    if (!validateObject(req.body)) {
        return res.status(400).json({
            message: 'Structure invalide',
            error: 'Les objets imbriqués ne peuvent pas dépasser 5 niveaux de profondeur'
        });
    }

    next();
};

/**
 * Middleware Composite: Applique toutes les validations
 */
const globalValidationMiddleware = [
    globalSanitization,
    globalValidation,
    validateUUIDParams,
    validateMonetaryAmounts,
    validateDates,
    validateEnums,
    validateArrays,
    validateNestedObjects,
    handleValidationErrors
];

module.exports = {
    globalSanitization,
    globalValidation,
    handleValidationErrors,
    validateUUIDParams,
    validatePagination,
    validateMonetaryAmounts,
    validateDates,
    validateEnums,
    validateArrays,
    validateNestedObjects,
    globalValidationMiddleware
};
