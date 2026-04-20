const jwtService = require('./jwtService');
const refreshTokenService = require('./refreshTokenService');

/**
 * Service de Gestion des Tokens
 * - Génère les paires Access/Refresh tokens
 * - Gère la rotation des refresh tokens
 * - Valide les tokens
 */
class TokenService {
    /**
     * Générer une paire de tokens pour un utilisateur
     */
    async getTokens(user) {
        try {
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
                nom_complet: user.nom_complet
            };

            // Générer la paire de tokens avec RS256
            const tokenPair = jwtService.generateTokenPair(payload);

            // Stocker le refresh token en Redis
            await refreshTokenService.storeRefreshToken(user.id, tokenPair.refreshToken);

            console.log(`✅ Tokens générés pour user ${user.id}`);

            return tokenPair;
        } catch (error) {
            console.error('❌ Erreur génération tokens:', error);
            throw error;
        }
    }

    /**
     * Rafraîchir les tokens (rotation du refresh token)
     */
    async refresh(oldRefreshToken, user) {
        try {
            // Vérifier le token
            jwtService.validateAlgorithm(oldRefreshToken);
            const decoded = jwtService.verifyToken(oldRefreshToken);

            // Vérifier que c'est le bon utilisateur
            if (decoded.id !== user.id) {
                throw new Error('Token appartient à un autre utilisateur');
            }

            // Rotater le refresh token (détecte la réutilisation)
            const newTokenPair = await refreshTokenService.rotateRefreshToken(
                user.id,
                oldRefreshToken
            );

            console.log(`✅ Tokens rafraîchis pour user ${user.id}`);

            return newTokenPair;
        } catch (error) {
            console.error('❌ Erreur rafraîchissement tokens:', error);
            throw error;
        }
    }

    /**
     * Révoquer tous les tokens d'un utilisateur
     */
    async revokeAllTokens(userId) {
        try {
            await refreshTokenService.revokeAllTokens(userId);
            console.log(`✅ Tous les tokens révoqués pour user ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Erreur révocation tokens:', error);
            return false;
        }
    }

    /**
     * Vérifier si un token est valide
     */
    async isTokenValid(userId, token) {
        try {
            jwtService.validateAlgorithm(token);
            const decoded = jwtService.verifyToken(token);
            
            if (decoded.id !== userId) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur vérification token:', error);
            return false;
        }
    }
}

module.exports = new TokenService();
