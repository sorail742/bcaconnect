const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

/**
 * Service AWS Secrets Manager pour BCA Connect.
 * En production : charge les secrets depuis AWS.
 * En développement : utilise les variables .env comme fallback.
 */

const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'eu-west-3',
});

const SECRET_NAME = process.env.AWS_SECRET_NAME || 'bcaconnect/production/secrets';

/**
 * Charge les secrets depuis AWS Secrets Manager.
 * @returns {Promise<Object>} Les secrets sous forme d'objet clé-valeur
 */
async function loadSecretsFromAWS() {
    const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
    const response = await client.send(command);
    return JSON.parse(response.SecretString);
}

/**
 * Injecte les secrets dans process.env.
 * En production : depuis AWS Secrets Manager.
 * En développement : utilise .env (déjà chargé par dotenv).
 */
async function injectSecrets() {
    if (process.env.NODE_ENV !== 'production') {
        console.log('ℹ️  Mode développement : secrets chargés depuis .env');
        return;
    }

    if (!process.env.AWS_REGION && !process.env.AWS_SECRET_NAME) {
        console.warn('⚠️  AWS_REGION/AWS_SECRET_NAME non configurés — fallback .env');
        return;
    }

    try {
        console.log(`🔐 Chargement des secrets depuis AWS Secrets Manager (${SECRET_NAME})...`);
        const secrets = await loadSecretsFromAWS();

        // Injecter uniquement les clés critiques
        const criticalKeys = [
            'JWT_SECRET',
            'JWT_PRIVATE_KEY',
            'JWT_PUBLIC_KEY',
            'ENCRYPTION_KEY',
            'REDIS_URL',
            'DATABASE_URL',
            'GROQ_API_KEY',
        ];

        let injected = 0;
        for (const key of criticalKeys) {
            if (secrets[key]) {
                process.env[key] = secrets[key];
                injected++;
            }
        }

        console.log(`✅ ${injected} secrets injectés depuis AWS Secrets Manager`);
    } catch (error) {
        // En production, une erreur ici est critique
        console.error('❌ Impossible de charger les secrets AWS:', error.message);
        process.exit(1);
    }
}

module.exports = { injectSecrets };
