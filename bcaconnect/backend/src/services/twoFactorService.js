const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class TwoFactorService {
    /**
     * Génère un nouveau secret TOTP pour un utilisateur
     * @param {string} userEmail 
     */
    async generateSecret(userEmail) {
        const secret = speakeasy.generateSecret({
            name: `BCA Connect (${userEmail})`,
            issuer: 'BCA Connect'
        });

        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
        
        // Codes de backup (10 codes de 8 caractères)
        const backupCodes = Array.from({ length: 10 }, () => uuidv4().slice(0, 8).toUpperCase());

        return {
            secret: secret.base32,
            qrCode: qrCodeDataUrl,
            backupCodes
        };
    }

    /**
     * Vérifie un code TOTP
     * @param {string} secret 
     * @param {string} token 
     */
    verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1 // Fenêtre de 30 secondes avant/après pour décalage horaire
        });
    }

    /**
     * Vérifie si un code de backup est valide et l'utilise
     * @param {Array} storedCodes 
     * @param {string} providedCode 
     */
    useBackupCode(storedCodes, providedCode) {
        const index = storedCodes.indexOf(providedCode.toUpperCase());
        if (index === -1) return false;
        
        // Supprime le code utilisé (usage unique)
        storedCodes.splice(index, 1);
        return true;
    }
}

module.exports = new TwoFactorService();
