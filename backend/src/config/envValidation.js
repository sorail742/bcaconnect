const Joi = require('joi');

/**
 * Schéma de validation des variables d'environnement
 * Valide toutes les variables au démarrage du serveur
 */
const envSchema = Joi.object({
    // Environnement
    NODE_ENV: Joi.string()
        .valid('development', 'staging', 'production')
        .required()
        .messages({
            'any.required': 'NODE_ENV est requis',
            'any.only': 'NODE_ENV doit être: development, staging ou production'
        }),

    PORT: Joi.number()
        .default(5000)
        .messages({
            'number.base': 'PORT doit être un nombre'
        }),

    // Base de données
    DATABASE_URL: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'DATABASE_URL doit être une URI valide'
        }),

    DB_HOST: Joi.string().optional(),
    DB_NAME: Joi.string().optional(),
    DB_USER: Joi.string().optional(),
    DB_PASS: Joi.string().optional(),

    // JWT - Authentification RS256
    JWT_SECRET: Joi.string()
        .min(32)
        .required()
        .messages({
            'string.min': 'JWT_SECRET doit faire au moins 32 caractères (256 bits)',
            'any.required': 'JWT_SECRET est requis'
        }),

    JWT_PRIVATE_KEY: Joi.string()
        .required()
        .pattern(/BEGIN (RSA )?PRIVATE KEY/)
        .messages({
            'any.required': 'JWT_PRIVATE_KEY est requis',
            'string.pattern.base': 'JWT_PRIVATE_KEY doit être une clé RSA valide (PKCS#1 ou PKCS#8)'
        }),

    JWT_PUBLIC_KEY: Joi.string()
        .required()
        .pattern(/BEGIN PUBLIC KEY/)
        .messages({
            'any.required': 'JWT_PUBLIC_KEY est requis',
            'string.pattern.base': 'JWT_PUBLIC_KEY doit être une clé publique valide'
        }),

    // Chiffrement AES-256-GCM
    ENCRYPTION_KEY: Joi.string()
        .length(64)
        .required()
        .pattern(/^[a-f0-9]{64}$/)
        .messages({
            'string.length': 'ENCRYPTION_KEY doit faire exactement 64 caractères (256 bits hex)',
            'string.pattern.base': 'ENCRYPTION_KEY doit être en hexadécimal',
            'any.required': 'ENCRYPTION_KEY est requis'
        }),

    // Redis - Refresh Token Rotation
    REDIS_URL: Joi.string()
        .uri()
        .allow('')
        .optional()
        .messages({
            'string.uri': 'REDIS_URL doit être une URI valide'
        }),

    // Groq AI
    GROQ_API_KEY: Joi.string()
        .required()
        .messages({
            'any.required': 'GROQ_API_KEY est requis'
        }),

    GROQ_MODEL: Joi.string()
        .default('llama-3.3-70b-versatile')
        .messages({
            'string.base': 'GROQ_MODEL doit être une chaîne'
        }),

    // Monitoring & Logging
    SENTRY_DSN: Joi.string()
        .uri()
        .allow('')
        .optional()
        .messages({
            'string.uri': 'SENTRY_DSN doit être une URI valide'
        }),

    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug')
        .default('info')
        .messages({
            'any.only': 'LOG_LEVEL doit être: error, warn, info ou debug'
        }),

    // Google OAuth (optionnel)
    GOOGLE_CLIENT_ID: Joi.string().optional(),

    // AWS (optionnel)
    AWS_REGION: Joi.string().optional(),
    AWS_ACCESS_KEY_ID: Joi.string().optional(),
    AWS_SECRET_ACCESS_KEY: Joi.string().optional(),

    // CinetPay Mobile Money (requis en production)
    PAYMENT_API_KEY: Joi.string().allow('').optional(),
    PAYMENT_SITE_ID: Joi.string().allow('').optional(),
    PAYMENT_SECRET: Joi.string().allow('').optional(),
    PAYMENT_PROVIDER_URL: Joi.string().uri().allow('').optional(),
    BACKEND_URL: Joi.string().uri().allow('').optional(),
    FRONTEND_URL: Joi.string().uri().allow('').optional(),

    PAYMENT_MODE: Joi.string()
        .valid('simulation', 'live')
        .default('simulation'),

    // Migration progressive vers NestJS — URL du service Nest pour le proxy
    // des modules déjà migrés (cf. backend/src/nestProxy.js). Optionnel tant
    // qu'aucun module n'a basculé.
    NEST_BACKEND_URL: Joi.string().uri().allow('').optional(),

    // Secret HMAC du pont interne Express <-> NestJS (backend/src/internal/
    // internal.route.js) — requis dès que backend-nest/ existe, même avant
    // qu'un module n'appelle réellement ces routes.
    INTERNAL_SECRET: Joi.string().min(32).required().messages({
        'string.min': 'INTERNAL_SECRET doit faire au moins 32 caractères',
        'any.required': 'INTERNAL_SECRET est requis (pont interne Express <-> NestJS)',
    }),

    // Blockchain — Polygon Amoy (testnet uniquement, cf. cahier des charges 3.16)
    BLOCKCHAIN_ENABLED: Joi.boolean().default(true),
    BLOCKCHAIN_PRIVATE_KEY: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{64}$/)
        .allow('')
        .optional()
        .messages({
            'string.pattern.base': 'BLOCKCHAIN_PRIVATE_KEY doit être une clé privée hexadécimale (0x + 64 caractères)',
        }),
    AMOY_RPC_URL: Joi.string().uri().allow('').optional(),

    // SMS Phase 3 (optionnel)
    SMS_ENABLED: Joi.boolean().default(false),
    SMS_PROVIDER: Joi.string().valid('console', 'http').default('console'),
    SMS_WEBHOOK_URL: Joi.string().uri().allow('').optional(),
    SMS_SENDER_ID: Joi.string().max(11).default('BCAConnect'),

}).unknown();

/**
 * Valider les variables d'environnement au démarrage
 */
function validateEnv() {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const messages = error.details.map(detail => 
            `❌ ${detail.path.join('.')}: ${detail.message}`
        ).join('\n');

        console.error('\n🚨 ERREUR DE CONFIGURATION (Variables d\'environnement):\n' + messages);
        process.exit(1);
    }

    console.log('✅ Configuration validée avec succès');

    const needsPaymentKeys = value.NODE_ENV === 'production' || value.PAYMENT_MODE === 'live';
    if (needsPaymentKeys) {
        const provider = (process.env.PAYMENT_PROVIDER || 'cinetpay').toLowerCase();
        const paymentKeys = provider === 'lengopay'
            ? ['LENGOPAY_LICENSE_KEY', 'LENGOPAY_WEBSITE_ID', 'BACKEND_URL', 'FRONTEND_URL']
            : ['PAYMENT_API_KEY', 'PAYMENT_SITE_ID', 'PAYMENT_SECRET', 'BACKEND_URL', 'FRONTEND_URL'];
        const missing = paymentKeys.filter((k) => !process.env[k]);
        if (missing.length) {
            const doc = value.NODE_ENV === 'production' ? 'DEPLOYMENT_PROD.md' : 'DEPLOYMENT_STAGING.md';
            console.warn(`⚠️  [${provider.toUpperCase()}] Variables manquantes (${value.NODE_ENV}/${value.PAYMENT_MODE}) : ${missing.join(', ')}`);
            console.warn(`    → Voir backend/${doc} et backend/.env.staging.example`);
        }
        if (process.env.BACKEND_URL && !process.env.BACKEND_URL.startsWith('https://')) {
            console.warn(`⚠️  [${provider.toUpperCase()}] BACKEND_URL doit être HTTPS pour recevoir les webhooks.`);
        }
    }

    return value;
}

module.exports = { validateEnv, envSchema };
