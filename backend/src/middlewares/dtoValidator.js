const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware Global de Validation
 * Intercepte et formate les erreurs de validation
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Données invalides (Validation DTO)',
            errors: errors.array().map(e => ({
                field: e.path || e.param,
                value: e.value,
                message: e.msg,
                location: e.location
            }))
        });
    }
    next();
};

/**
 * ═══════════════════════════════════════════════════════════════
 * AUTHENTIFICATION (Auth)
 * ═══════════════════════════════════════════════════════════════
 */

const validateRegister = [
    body('nom_complet')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit faire entre 2 et 100 caractères.')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes.')
        .escape(),
    body('email')
        .isEmail().withMessage('Format d\'email invalide.')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email trop long (max 255 caractères).'),
    body('telephone')
        .trim()
        .isLength({ min: 8, max: 20 }).withMessage('Le numéro de téléphone est invalide (min 8 chiffres).')
        .matches(/^[0-9+\-\s()]+$/).withMessage('Le numéro de téléphone contient des caractères invalides.'),
    body('mot_de_passe')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères.')
        .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule.')
        .escape(),
    body('role')
        .isIn(['client', 'fournisseur', 'transporteur', 'admin', 'banque'])
        .withMessage('Rôle invalide. Doit être: client, fournisseur, transporteur, admin ou banque.'),
    body('nom_boutique')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Le nom de la boutique doit faire entre 2 et 100 caractères.')
        .escape(),
    body('description_boutique')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La description ne doit pas dépasser 500 caractères.')
        .escape(),
    body('adresse_boutique')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('L\'adresse ne doit pas dépasser 255 caractères.')
        .escape(),
    body('categorie_activite')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('La catégorie ne doit pas dépasser 100 caractères.')
        .escape(),
    body('registre_commerce')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Le registre de commerce ne doit pas dépasser 50 caractères.')
        .escape(),
    body('type_vehicule')
        .optional()
        .isIn(['moto', 'voiture', 'camion', 'velo', 'autre'])
        .withMessage('Type de véhicule invalide.'),
    body('numero_permis')
        .optional()
        .trim()
        .isLength({ min: 5, max: 50 }).withMessage('Le numéro de permis est invalide.')
        .escape(),
    body('zone_couverture')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('La zone de couverture est invalide.')
        .escape(),
    body('adresse')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('L\'adresse ne doit pas dépasser 255 caractères.')
        .escape(),
    validateRequest
];

const validateLogin = [
    body('email')
        .isEmail().withMessage('Email invalide.')
        .normalizeEmail(),
    body('mot_de_passe')
        .notEmpty().withMessage('Mot de passe requis.')
        .isLength({ min: 8 }).withMessage('Mot de passe invalide.'),
    validateRequest
];

const validateGoogleLogin = [
    body('credential')
        .notEmpty().withMessage('Jeton Google requis.')
        .isLength({ min: 10 }).withMessage('Jeton Google invalide.'),
    validateRequest
];

const validateRefreshToken = [
    body('userId')
        .notEmpty().withMessage('ID utilisateur requis.')
        .isUUID().withMessage('ID utilisateur invalide (doit être UUID).'),
    validateRequest
];

const validateVerify2FA = [
    body('userId')
        .notEmpty().withMessage('ID utilisateur requis.')
        .isUUID().withMessage('ID utilisateur invalide.'),
    body('code')
        .notEmpty().withMessage('Code 2FA requis.')
        .isLength({ min: 6, max: 6 }).withMessage('Code 2FA doit faire 6 chiffres.')
        .isNumeric().withMessage('Code 2FA doit être numérique.'),
    validateRequest
];

const validateConfirm2FA = [
    body('code')
        .notEmpty().withMessage('Code 2FA requis.')
        .isLength({ min: 6, max: 6 }).withMessage('Code 2FA doit faire 6 chiffres.')
        .isNumeric().withMessage('Code 2FA doit être numérique.'),
    validateRequest
];

const validateUpdateProfile = [
    body('nom_complet')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit faire entre 2 et 100 caractères.')
        .escape(),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Format d\'email invalide.')
        .normalizeEmail(),
    body('telephone')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 8, max: 20 }).withMessage('Le numéro de téléphone est invalide.')
        .matches(/^[0-9+\-\s()]+$/).withMessage('Le numéro de téléphone contient des caractères invalides.'),
    body('mot_de_passe')
        .optional({ checkFalsy: true })
        .isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères.')
        .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre.'),
    body('avatar_url')
        .optional({ checkFalsy: true })
        .isString().withMessage('URL de l\'avatar invalide.'),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * PRODUITS (Products)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateProduct = [
    body('nom_produit')
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage('Le nom du produit doit faire entre 2 et 200 caractères.')
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('La description ne doit pas dépasser 2000 caractères.')
        .escape(),
    body('prix_unitaire')
        .isFloat({ min: 0.01 }).withMessage('Le prix doit être supérieur à 0.')
        .toFloat(),
    body('stock_quantite')
        .isInt({ min: 0 }).withMessage('La quantité doit être un nombre positif.')
        .toInt(),
    body('categorie_id')
        .notEmpty().withMessage('Catégorie requise.')
        .custom(value => {
            const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
            const staticRegex = /^static-cat-\d+$/;
            if (uuidRegex.test(value) || staticRegex.test(value)) return true;
            throw new Error('ID catégorie invalide. Doit être UUID ou static-cat-<num>.');
        })
        .withMessage('ID catégorie invalide.'),
    body('images')
        .optional()
        .isArray().withMessage('Les images doivent être un tableau.'),
    validateRequest
];

const validateUpdateProduct = [
    param('id')
        .isUUID().withMessage('ID produit invalide.'),
    body('nom_produit')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 }).withMessage('Le nom du produit doit faire entre 2 et 200 caractères.')
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('La description ne doit pas dépasser 2000 caractères.')
        .escape(),
    body('prix_unitaire')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Le prix doit être supérieur à 0.')
        .toFloat(),
    body('stock_quantite')
        .optional()
        .isInt({ min: 0 }).withMessage('La quantité doit être un nombre positif.')
        .toInt(),
    validateRequest
];

const validateDeleteProduct = [
    param('id')
        .isUUID().withMessage('ID produit invalide.'),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * COMMANDES (Orders)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateOrder = [
    body('items')
        .isArray({ min: 1 }).withMessage('La commande doit contenir au moins un article.')
        .custom(items => {
            if (!Array.isArray(items)) return false;
            return items.every(item => 
                (item.produit_id || item.productId || item.id) && 
                typeof (item.quantite || item.quantity) === 'number' && 
                (item.quantite || item.quantity) > 0
            );
        }).withMessage('Chaque article doit avoir un produit_id et une quantité valide.'),
    
    // Support both deliveryInfo (Object) and adresse_livraison (String)
    body('deliveryInfo')
        .optional()
        .isObject().withMessage('deliveryInfo doit être un objet.'),
    body('deliveryInfo.adresse')
        .if(body('deliveryInfo').exists())
        .trim()
        .isLength({ min: 5, max: 255 }).withMessage('L\'adresse de livraison est trop courte.'),
    
    body('adresse_livraison')
        .if(body('deliveryInfo').not().exists())
        .trim()
        .isLength({ min: 5, max: 255 }).withMessage('L\'adresse de livraison est invalide.'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Les notes ne doivent pas dépasser 500 caractères.')
        .escape(),
    validateRequest
];

const validateUpdateOrder = [
    param('id')
        .isUUID().withMessage('ID commande invalide.'),
    body('statut')
        .optional()
        .isIn(['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'])
        .withMessage('Statut invalide.'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Les notes ne doivent pas dépasser 500 caractères.')
        .escape(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * PAIEMENTS (Payments)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreatePayment = [
    body('montant')
        .isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0.')
        .toFloat(),
    body('methode_paiement')
        .isIn(['mobile_money', 'carte_bancaire', 'portefeuille', 'crypto', 'virement'])
        .withMessage('Méthode de paiement invalide.'),
    body('commande_id')
        .optional()
        .isUUID().withMessage('ID commande invalide.'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('La description ne doit pas dépasser 255 caractères.')
        .escape(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * CRÉDIT (Credit)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreditRequest = [
    body('montant_principal')
        .isFloat({ min: 10000 }).withMessage('Montant minimum : 10 000 GNF.')
        .toFloat(),
    body('duree_mois')
        .isInt({ min: 1, max: 60 }).withMessage('Durée : entre 1 et 60 mois.')
        .toInt(),
    body('motif')
        .trim()
        .isLength({ min: 10, max: 500 }).withMessage('Le motif doit faire entre 10 et 500 caractères.')
        .escape(),
    body('taux_interet')
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Le taux d\'intérêt doit être entre 0 et 100.')
        .toFloat(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * PORTEFEUILLE (Wallet)
 * ═══════════════════════════════════════════════════════════════
 */

const validateWalletTransfer = [
    body('destinataire_id')
        .notEmpty().withMessage('ID destinataire requis.')
        .isUUID().withMessage('ID destinataire invalide.'),
    body('montant')
        .isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0.')
        .toFloat(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('La description ne doit pas dépasser 255 caractères.')
        .escape(),
    validateRequest
];

const validateWalletDeposit = [
    body('montant')
        .isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0.')
        .toFloat(),
    body('methode_paiement')
        .isIn(['mobile_money', 'carte_bancaire', 'virement'])
        .withMessage('Méthode de paiement invalide.'),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * AVIS & ÉVALUATIONS (Reviews)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateReview = [
    body('produit_id')
        .notEmpty().withMessage('ID produit requis.')
        .isUUID().withMessage('ID produit invalide.'),
    body('note')
        .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5.')
        .toInt(),
    body('commentaire')
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Le commentaire doit faire entre 10 et 1000 caractères.')
        .escape(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * LITIGES (Disputes)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateDispute = [
    body('commande_id')
        .notEmpty().withMessage('ID commande requis.')
        .isUUID().withMessage('ID commande invalide.'),
    body('type')
        .isIn(['qualite', 'livraison', 'paiement', 'autre'])
        .withMessage('Type de litige invalide.'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('La description doit faire entre 10 et 2000 caractères.')
        .escape(),
    validateRequest
];

const validateUpdateDispute = [
    param('id')
        .isUUID().withMessage('ID litige invalide.'),
    body('statut')
        .optional()
        .isIn(['ouvert', 'en_cours', 'resolu', 'ferme'])
        .withMessage('Statut invalide.'),
    body('resolution')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La résolution ne doit pas dépasser 1000 caractères.')
        .escape(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * LIVRAISON (Delivery)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateDelivery = [
    body('commande_id')
        .notEmpty().withMessage('ID commande requis.')
        .isUUID().withMessage('ID commande invalide.'),
    body('livreur_id')
        .notEmpty().withMessage('ID livreur requis.')
        .isUUID().withMessage('ID livreur invalide.'),
    body('adresse_livraison')
        .trim()
        .isLength({ min: 5, max: 255 }).withMessage('L\'adresse de livraison est invalide.')
        .escape(),
    validateRequest
];

const validateUpdateDelivery = [
    param('id')
        .isUUID().withMessage('ID livraison invalide.'),
    body('statut')
        .optional()
        .isIn(['en_attente', 'en_cours', 'livree', 'echouee'])
        .withMessage('Statut invalide.'),
    body('localisation')
        .optional()
        .custom(value => {
            if (!value) return true;
            return typeof value.latitude === 'number' && typeof value.longitude === 'number';
        }).withMessage('Localisation invalide (latitude et longitude requises).'),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * MESSAGES (Messages)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateMessage = [
    body('destinataire_id')
        .notEmpty().withMessage('ID destinataire requis.')
        .isUUID().withMessage('ID destinataire invalide.'),
    body('contenu')
        .trim()
        .isLength({ min: 1, max: 5000 }).withMessage('Le message doit faire entre 1 et 5000 caractères.')
        .escape(),
    body('type')
        .optional()
        .isIn(['texte', 'image', 'fichier', 'audio'])
        .withMessage('Type de message invalide.'),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * ANNONCES (Ads)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateAd = [
    body('titre')
        .trim()
        .isLength({ min: 5, max: 100 }).withMessage('Le titre doit faire entre 5 et 100 caractères.')
        .escape(),
    body('description')
        .trim()
        .isLength({ min: 20, max: 2000 }).withMessage('La description doit faire entre 20 et 2000 caractères.')
        .escape(),
    body('budget')
        .isFloat({ min: 1000 }).withMessage('Le budget minimum est 1000 GNF.')
        .toFloat(),
    body('duree_jours')
        .isInt({ min: 1, max: 365 }).withMessage('La durée doit être entre 1 et 365 jours.')
        .toInt(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * CATÉGORIES (Categories)
 * ═══════════════════════════════════════════════════════════════
 */

const validateCreateCategory = [
    body('nom')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit faire entre 2 et 100 caractères.')
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La description ne doit pas dépasser 500 caractères.')
        .escape(),
    body('icone')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('L\'icône ne doit pas dépasser 100 caractères.')
        .escape(),
    validateRequest
];

/**
 * ═══════════════════════════════════════════════════════════════
 * RECHERCHE & FILTRAGE (Search & Filtering)
 * ═══════════════════════════════════════════════════════════════
 */

const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('La recherche doit faire entre 1 et 100 caractères.')
        .escape(),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Le numéro de page doit être supérieur à 0.')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100.')
        .toInt(),
    query('categorie_id')
        .optional()
        .custom(value => {
            const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
            const staticRegex = /^static-cat-\d+$/;
            if (uuidRegex.test(value) || staticRegex.test(value)) return true;
            throw new Error('ID catégorie invalide. Doit être UUID ou static-cat-<num>.');
        })
        .withMessage('ID catégorie invalide.'),
    query('prix_min')
        .optional()
        .isFloat({ min: 0 }).withMessage('Le prix minimum doit être positif.')
        .toFloat(),
    query('prix_max')
        .optional()
        .isFloat({ min: 0 }).withMessage('Le prix maximum doit être positif.')
        .toFloat(),
    validateRequest
];

module.exports = {
    validateRequest,
    // Auth
    validateRegister,
    validateLogin,
    validateGoogleLogin,
    validateRefreshToken,
    validateVerify2FA,
    validateConfirm2FA,
    validateUpdateProfile,
    // Products
    validateCreateProduct,
    validateUpdateProduct,
    validateDeleteProduct,
    // Orders
    validateCreateOrder,
    validateUpdateOrder,
    // Payments
    validateCreatePayment,
    // Credit
    validateCreditRequest,
    // Wallet
    validateWalletTransfer,
    validateWalletDeposit,
    // Reviews
    validateCreateReview,
    // Disputes
    validateCreateDispute,
    validateUpdateDispute,
    // Delivery
    validateCreateDelivery,
    validateUpdateDelivery,
    // Messages
    validateCreateMessage,
    // Ads
    validateCreateAd,
    // Categories
    validateCreateCategory,
    // Search
    validateSearch
};
