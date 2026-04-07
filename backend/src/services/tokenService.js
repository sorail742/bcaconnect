const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');

class TokenService {
    constructor() {
        this.privateKey = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
        this.publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
        this.accessTokenExp = '15m'; // Access token court (Standard BCA v2.5)
        this.refreshTokenExp = '7d';  // Refresh token long
        
        // Initialisation Redis (P0 #2)
        this.redisClient = null;
        if (process.env.REDIS_URL) {
            this.redisClient = redis.createClient({ url: process.env.REDIS_URL });
            this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
            this.redisClient.connect().catch(console.error);
        }
    }

    /**
     * Génère un Access Token (RS256 ou HS256 fallback)
     */
    generateAccessToken(user) {
        const isRS256 = this.privateKey && 
                        this.privateKey.includes('BEGIN RSA PRIVATE KEY') && 
                        !this.privateKey.includes('...'); // Éviter les placeholders
        
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            isRS256 ? this.privateKey : process.env.JWT_SECRET,
            { 
                algorithm: isRS256 ? 'RS256' : 'HS256', 
                expiresIn: this.accessTokenExp,
                issuer: 'bcaconnect.api',
                audience: 'bcaconnect.client'
            }
        );
    }

    /**
     * Génère un Refresh Token avec rotation (P0 #2)
     */
    async generateRefreshToken(userId) {
        const refreshToken = uuidv4();
        
        if (this.redisClient) {
            // Stockage dans Redis avec expiration (7 jours)
            await this.redisClient.setEx(`rt:${userId}`, 604800, refreshToken);
        }
        
        return refreshToken;
    }

    /**
     * Vérifie un Access Token
     */
    verifyAccessToken(token) {
        const isRS256 = this.publicKey && 
                        this.publicKey.includes('BEGIN PUBLIC KEY') && 
                        !this.publicKey.includes('...'); // Éviter les placeholders
        
        return jwt.verify(token, isRS256 ? this.publicKey : process.env.JWT_SECRET, { 
            algorithms: isRS256 ? ['RS256'] : ['HS256'],
            issuer: 'bcaconnect.api',
            audience: 'bcaconnect.client'
        });
    }

    /**
     * Récupère les tokens (Access + Refresh)
     */
    async getTokens(user) {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user.id);
        
        return { accessToken, refreshToken };
    }

    /**
     * Rafraîchit le token via Refresh Token Rotation (P0 #2)
     */
    async refresh(oldRefreshToken, user) {
        if (!this.redisClient) {
            throw new Error('Rotation des tokens impossible (Redis non configuré).');
        }

        const storedToken = await this.redisClient.get(`rt:${user.id}`);
        
        if (!storedToken || storedToken !== oldRefreshToken) {
            // Suspicion de vol : on invalide tout
            await this.redisClient.del(`rt:${user.id}`);
            throw new Error('Token compromis ou expiré. Reconnexion requise.');
        }

        // Succès : Génération d'une nouvelle paire (Rotation)
        return this.getTokens(user);
    }

    /**
     * Invalide le refresh token (Logout)
     */
    async revokeRefreshToken(userId) {
        if (this.redisClient) {
            await this.redisClient.del(`rt:${userId}`);
        }
    }
}

module.exports = new TokenService();
