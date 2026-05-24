const crypto = require('crypto');

/**
 * Service de chiffrement AES-256-GCM pour les données sensibles.
 * Assure la confidentialité (chiffrement) et l'intégrité (GCM auth tag).
 */
class EncryptionService {
    constructor() {
        // ENCRYPTION_KEY doit être une chaîne hexadécimale de 64 caractères (256 bits)
        const keyHex = process.env.ENCRYPTION_KEY;
        if (!keyHex || keyHex.length !== 64) {
             console.warn('⚠️ ENCRYPTION_KEY invalide ou absente. Le chiffrement ne fonctionnera pas correctement.');
             this.key = null;
        } else {
             this.key = Buffer.from(keyHex, 'hex');
        }
    }

    /**
     * Chiffre un texte
     * @param {string} text - Le texte à chiffrer
     * @returns {string|null} - Le payload chiffré au format iv:tag:encryptedData ou null si erreur
     */
    encrypt(text) {
        if (!this.key || !text) return text;

        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const tag = cipher.getAuthTag().toString('hex');
            
            // Format: iv:tag:data
            return `${iv.toString('hex')}:${tag}:${encrypted}`;
        } catch (error) {
            console.error('Erreur de chiffrement:', error);
            return null;
        }
    }

    /**
     * Déchiffre un payload
     * @param {string} encryptedPayload - Le payload au format iv:tag:encryptedData
     * @returns {string|null} - Le texte clair ou null si erreur
     */
    decrypt(encryptedPayload) {
        if (!this.key || !encryptedPayload || !encryptedPayload.includes(':')) return encryptedPayload;

        try {
            const [ivHex, tagHex, encryptedData] = encryptedPayload.split(':');
            
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
            decipher.setAuthTag(tag);
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Erreur de déchiffrement:', error);
            return null;
        }
    }
}

module.exports = new EncryptionService();
