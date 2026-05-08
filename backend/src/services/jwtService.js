const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Service JWT Sécurisé avec RS256 (Asymétrique)
 * - Access Token: 15 minutes
 * - Refresh Token: 7 jours avec rotation
 */
class JwtService {
    constructor() {
        this.privateKey = process.env.JWT_PRIVATE_KEY ? process.env.JWT_PRIVATE_KEY.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n') : null;
        this.publicKey = process.env.JWT_PUBLIC_KEY ? process.env.JWT_PUBLIC_KEY.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n') : null;
        
        if (!this.privateKey || !this.publicKey) {
            throw new Error('JWT_PRIVATE_KEY et JWT_PUBLIC_KEY sont requis');
        }
    }

    /**
     * Générer un Access Token (court terme - 15 minutes)
     */
    generateAccessToken(payload) {
        return jwt.sign(payload, this.privateKey, {
            algorithm: 'RS256',
            expiresIn: '15m',
            issuer: 'bcaconnect.api',
            audience: 'bcaconnect.client',
            subject: payload.id?.toString()
        });
    }

    /**
     * Générer un Refresh Token (long terme - 7 jours)
     */
    generateRefreshToken(payload) {
        const refreshTokenId = crypto.randomBytes(16).toString('hex');
        
        return jwt.sign(
            { ...payload, jti: refreshTokenId },
            this.privateKey,
            {
                algorithm: 'RS256',
                expiresIn: '7d',
                issuer: 'bcaconnect.api',
                audience: 'bcaconnect.client',
                subject: payload.id?.toString()
            }
        );
    }

    /**
     * Générer une paire Access + Refresh Token
     */
    generateTokenPair(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
            expiresIn: 900 // 15 minutes en secondes
        };
    }

    /**
     * Vérifier et décoder un token
     */
    verifyToken(token, type = 'access') {
        try {
            const decoded = jwt.verify(token, this.publicKey, {
                algorithms: ['RS256'],
                issuer: 'bcaconnect.api',
                audience: 'bcaconnect.client'
            });

            // Vérifications supplémentaires
            if (!decoded.id) {
                throw new Error('Token invalide: pas de user ID');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expiré');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Token invalide');
            }
            throw error;
        }
    }

    /**
     * Vérifier que l'algorithme est RS256 (protection contre alg:none)
     */
    validateAlgorithm(token) {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded || decoded.header.alg !== 'RS256') {
            throw new Error('Algorithme de token invalide');
        }
        return true;
    }

    /**
     * Générer une clé de révocation pour un token
     */
    generateRevocationKey(token) {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }
}

module.exports = new JwtService();
