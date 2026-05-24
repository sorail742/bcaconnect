const redis = require('redis');
const jwtService = require('./jwtService');

/**
 * Service de Rotation des Refresh Tokens
 * - Stocke les tokens en Redis
 * - Détecte la réutilisation (compromission)
 * - Invalide tous les tokens en cas de détection
 */
class RefreshTokenService {
    constructor() {
        if (process.env.REDIS_URL) {
            this.client = redis.createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
                }
            });

            this.client.on('error', (err) => {
                console.error('❌ Erreur Redis:', err);
            });

            this.client.on('connect', () => {
                console.log('✅ Redis connecté');
            });
        } else {
            console.warn('⚠️  Redis désactivé (REDIS_URL manquant)');
            this.client = { isOpen: false }; // Mock minimal pour éviter les crashs
        }
    }

    async connect() {
        try {
            if (this.client && typeof this.client.connect === 'function') {
                await this.client.connect();
            }
        } catch (error) {
            console.error('❌ Impossible de connecter à Redis:', error);
            // En développement, continuer sans Redis
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
        }
    }

    /**
     * Stocker un refresh token en Redis
     */
    async storeRefreshToken(userId, token) {
        try {
            if (!this.client.isOpen) {
                console.warn('⚠️  Redis non connecté - token non stocké');
                return true; // Continuer sans Redis en dev
            }
            const key = `rt:${userId}`;
            const tokenHash = jwtService.generateRevocationKey(token);
            
            // Stocker pendant 7 jours
            await this.client.setEx(key, 604800, tokenHash);
            
            console.log(`✅ Refresh token stocké pour user ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Erreur stockage refresh token:', error);
            return false;
        }
    }

    /**
     * Vérifier et rotater un refresh token
     * Détecte la réutilisation et invalide tous les tokens
     */
    async rotateRefreshToken(userId, oldToken, newPayload = null) {
        try {
            // Si Redis n'est pas connecté, générer simplement une nouvelle paire
            if (!this.client.isOpen) {
                const payload = newPayload || { id: userId };
                return jwtService.generateTokenPair(payload);
            }

            const key = `rt:${userId}`;
            const oldTokenHash = jwtService.generateRevocationKey(oldToken);
            
            // Récupérer le token stocké
            const storedHash = await this.client.get(key);
            
            if (!storedHash) {
                throw new Error('Refresh token non trouvé - reconnexion requise');
            }

            // Vérifier que c'est le même token
            if (storedHash !== oldTokenHash) {
                console.warn(`🚨 COMPROMISSION DÉTECTÉE: Tentative de réutilisation du token pour user ${userId}`);
                
                // Invalider TOUS les tokens de cet utilisateur
                await this.client.del(key);
                
                // Logger l'incident de sécurité
                await this.logSecurityIncident(userId, 'TOKEN_REUSE_DETECTED');
                
                throw new Error('Token compromis - tous les tokens invalidés. Reconnexion requise.');
            }

            // Générer une nouvelle paire de tokens
            const payload = newPayload || { id: userId };
            const newTokenPair = jwtService.generateTokenPair(payload);
            
            // Stocker le nouveau refresh token
            await this.storeRefreshToken(userId, newTokenPair.refreshToken);
            
            console.log(`✅ Refresh token rotaté pour user ${userId}`);
            
            return newTokenPair;
        } catch (error) {
            console.error('❌ Erreur rotation refresh token:', error);
            throw error;
        }
    }

    /**
     * Révoquer tous les tokens d'un utilisateur
     */
    async revokeAllTokens(userId) {
        try {
            if (!this.client.isOpen) {
                return true;
            }
            const key = `rt:${userId}`;
            await this.client.del(key);
            console.log(`✅ Tous les tokens révoqués pour user ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Erreur révocation tokens:', error);
            return false;
        }
    }

    /**
     * Vérifier si un token est valide (non révoqué)
     */
    async isTokenValid(userId, token) {
        try {
            if (!this.client.isOpen) {
                return true; // Accepter en dev sans Redis
            }
            const key = `rt:${userId}`;
            const tokenHash = jwtService.generateRevocationKey(token);
            const storedHash = await this.client.get(key);
            
            return storedHash === tokenHash;
        } catch (error) {
            console.error('❌ Erreur vérification token:', error);
            return false;
        }
    }

    /**
     * Logger les incidents de sécurité
     */
    async logSecurityIncident(userId, incidentType) {
        try {
            if (!this.client.isOpen) {
                return;
            }
            const key = `security:${userId}:${incidentType}`;
            const timestamp = new Date().toISOString();
            
            await this.client.setEx(
                key,
                86400, // 24 heures
                timestamp
            );
            
            console.warn(`🚨 Incident de sécurité: ${incidentType} pour user ${userId}`);
        } catch (error) {
            console.error('❌ Erreur logging incident:', error);
        }
    }

    /**
     * Nettoyer les tokens expirés (optionnel - Redis le fait automatiquement)
     */
    async cleanup() {
        try {
            // Redis gère automatiquement l'expiration avec setEx
            console.log('✅ Cleanup Redis effectué');
        } catch (error) {
            console.error('❌ Erreur cleanup:', error);
        }
    }

    /**
     * Fermer la connexion Redis
     */
    async disconnect() {
        try {
            if (this.client.isOpen) {
                await this.client.quit();
                console.log('✅ Redis déconnecté');
            }
        } catch (error) {
            console.error('❌ Erreur déconnexion Redis:', error);
        }
    }
}

module.exports = new RefreshTokenService();
