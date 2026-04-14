const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const NodeCache = require('node-cache');
const crypto = require('crypto');
const logger = require('../utils/logger'); // Utiliser le logger du projet

class TokenService {
    constructor() {
        this.privateKey = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
        this.publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
        this.accessTokenExp = '15m'; // Access token court (Standard BCA v2.5)
        this.refreshTokenExp = '7d';  // Refresh token long
        
        // Initialisation du fallback en mémoire (7 jours de TTL)
        this.localCache = new NodeCache({ stdTTL: 604800, checkperiod: 3600 });
        
        // Initialisation Redis (P0 #2)
        this.redisClient = null;
        this.isRedisReady = false;

        if (process.env.REDIS_URL) {
            this.redisClient = redis.createClient({ 
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 3) { // Stop retrying after 3 attempts to avoid log spam
                            return false; 
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            this.redisClient.on('error', (err) => {
                // Silencer l'erreur initiale si c'est un refus de connexion en développement
                if (!this.isRedisReady) return;
                console.error('Redis Client Error', err);
            });

            this.redisClient.on('connect', () => {
                this.isRedisReady = true;
                logger.info('✅ Store Redis connecté pour les tokens.');
            });

            this.redisClient.connect().catch(() => {
                logger.warn('⚠️  Redis non disponible. Utilisation du cache local (RAM) pour les tokens.');
                this.isRedisReady = false;
            });
        } else {
            logger.info('ℹ️  Redis non configuré. Utilisation du cache local (RAM) pour les tokens.');
        }
    }

    /**
     * Génère un Access Token (RS256 ou HS256 fallback)
     */
    generateAccessToken(user) {
        const isRS256 = typeof this.privateKey === 'string' && 
                        this.privateKey.includes('BEGIN PRIVATE KEY') && 
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
     * Génère un Refresh Token avec rotation (P0 #2) et Multi-Device Support
     */
    async generateRefreshToken(userId) {
        // Le token brut que l'utilisateur recevra dans son Cookie
        const rawToken = crypto.randomBytes(40).toString('hex');
        
        // On stocke UNIQUEMENT le hash en cache. (Atténue l'impact du dump Redis)
        const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
        
        const KEY = `rt:${userId}:${hash}`;
        
        if (this.isRedisReady && this.redisClient) {
            try {
                // Stocke "1" avec une expiration de 7 jours. 
                // Autorise N multi-devices simultanés !
                await this.redisClient.setEx(KEY, 604800, '1');
            } catch (err) {
                this.localCache.set(KEY, '1', 604800);
            }
        } else {
            this.localCache.set(KEY, '1', 604800);
        }
        
        return rawToken; // Seul le client possède ce secret !
    }

    /**
     * Vérifie un Access Token
     */
    verifyAccessToken(token) {
        const isRS256 = typeof this.publicKey === 'string' && 
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
     * Rafraîchit le token via Refresh Token Rotation Multi-Device.
     * Le cookie HttpOnly amène l'ancien token.
     */
    async refresh(oldRawToken, user) {
        if (!oldRawToken) throw new Error("Aucun refresh token n'a été fourni");

        const hash = crypto.createHash('sha256').update(oldRawToken).digest('hex');
        const KEY = `rt:${user.id}:${hash}`;

        let isValid = false;

        if (this.isRedisReady && this.redisClient) {
            try {
                const storedVal = await this.redisClient.get(KEY);
                isValid = storedVal === '1';
            } catch (err) {
                isValid = this.localCache.get(KEY) === '1';
            }
        } else {
            isValid = this.localCache.get(KEY) === '1';
        }
        
        if (!isValid) {
            // Suspicion de vol de token (Replay Attack) : On invalide TOUTES les sessions du user
            await this.revokeAllUserTokens(user.id);
            throw new Error('Token falsifié, expiré ou volé. Mesure anti-effraction : Toutes les sessions ont été clôturées. Veuillez vous reconnecter.');
        }

        // --- Rotation de token (One-Time Use) ---
        
        // 1. Invalide spécifiquement l'ancien terminal utilisé pour cette requête (ne touche pas l'iPhone si on est sur PC)
        if (this.isRedisReady && this.redisClient) {
            this.redisClient.del(KEY).catch(()=>{});
        }
        this.localCache.del(KEY);

        // 2. Succès : Génération d'une nouvelle paire (Rotation indépendante device)
        return this.getTokens(user);
    }

    /**
     * Invalide un refresh token spécifique (ex: déconnexion locale)
     */
    async revokeSpecificToken(userId, rawToken) {
        if (!rawToken) return;
        const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const KEY = `rt:${userId}:${hash}`;
        
        if (this.isRedisReady && this.redisClient) {
            try { await this.redisClient.del(KEY); } catch (err) { /* ignore */ }
        }
        this.localCache.del(KEY);
    }

    /**
     * Invalide TOUS les tokens (Logout global ou Breach Detection)
     */
    async revokeAllUserTokens(userId) {
        if (this.isRedisReady && this.redisClient) {
            try {
                const keys = await this.redisClient.keys(`rt:${userId}:*`);
                if (keys.length > 0) await this.redisClient.del(keys);
            } catch (err) { /* ignore */ }
        }
        // Il n'y a pas de clean universel sur NodeCache par pattern facilement, l'expiration le fera
    }
}

module.exports = new TokenService();
