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
        .pattern(/BEGIN RSA PRIVATE KEY/)
        .messages({
            'any.required': 'JWT_PRIVATE_KEY est requis',
            'string.pattern.base': 'JWT_PRIVATE_KEY doit être une clé RSA valide'
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
        .required()
        .messages({
            'string.uri': 'REDIS_URL doit être une URI valide',
            'any.required': 'REDIS_URL est requis'
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
    return value;
}

module.exports = { validateEnv, envSchema };
