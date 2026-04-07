const Joi = require('joi');

/**
 * Schéma de validation des variables d'environnement.
 * Empêche le démarrage du serveur si une configuration critique est absente ou invalide.
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  
  // Base de données
  DATABASE_URL: Joi.string().uri().required(),
  
  // Sécurité JWT (BCA Connect v2.5 Standard)
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  
  // Chiffrement AES-256 (Paires de clés 256 bits hex)
  ENCRYPTION_KEY: Joi.string().length(64).required(),
  
  // Cache & Session (Redis)
  REDIS_URL: Joi.string().uri().required(),
  
  // Services Externes
  AWS_REGION: Joi.string().default('eu-west-3'),
  SENTRY_DSN: Joi.string().uri().optional(),
  
}).unknown();

const validateEnv = (env) => {
  const { error, value } = envSchema.validate(env);
  
  if (error) {
    console.error('❌ Erreur de configuration (Variables d\'environnement) :');
    error.details.forEach(detail => {
      console.error(`   - ${detail.message}`);
    });
    // On arrête le processus en mode production pour éviter de tourner avec un état instable
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
  
  return value;
};

module.exports = validateEnv;
