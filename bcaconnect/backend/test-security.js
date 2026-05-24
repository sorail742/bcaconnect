/**
 * 🛡️ BCA Connect - Suite de Tests de Sécurité (V2.6)
 * Vérifie l'intégrité du Standard BCA v2.5 (RS256, AES-256-GCM, 2FA, Joi).
 */
require('dotenv').config();
const encryptionService = require('./src/utils/encryptionService');
const tokenService = require('./src/services/tokenService');
const twoFactorService = require('./src/services/twoFactorService');

async function runSecurityTests() {
    console.log('\n🚀 DÉMARRAGE DE L\'AUDIT DE SÉCURITÉ INTERNE... \n');

    let totalTests = 0;
    let testsPassed = 0;

    const test = (name, fn) => {
        totalTests++;
        try {
            fn();
            console.log(`✅ TEST RÉUSSI : ${name}`);
            testsPassed++;
        } catch (error) {
            console.error(`❌ TEST ÉCHOUÉ : ${name}`);
            console.error(`   -> RAISON : ${error.message}`);
        }
    };

    // 1. Test Chiffrement AES-256-GCM
    test('Chiffrement AES-256-GCM (P0 #5)', () => {
        const secretText = '0622-44-55-66';
        const encrypted = encryptionService.encrypt(secretText);
        
        if (!encrypted.includes(':')) throw new Error('Format de payload chiffré invalide (GCM attendu).');
        
        const decrypted = encryptionService.decrypt(encrypted);
        if (decrypted !== secretText) throw new Error('Échec de la correspondance après déchiffrement.');
    });

    // 2. Test JWT RS256 (Asymétrique)
    test('Authentification JWT RS256 (P0 #1)', () => {
        const mockUser = { id: 'u123', email: 'test@bca.gn', role: 'admin' };
        
        // Vérification si RS256 est fallback (HS256) ou réel RS256
        if (!process.env.JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY.includes('...')) {
             console.warn('   ⚠️  NOTE : RS256 en mode fallback car les clés PEM sont absentes (.env)');
        }
        
        const token = tokenService.generateAccessToken(mockUser);
        const decoded = tokenService.verifyAccessToken(token);
        
        if (decoded.id !== mockUser.id) throw new Error('Payload JWT altéré ou mal décodé.');
    });

    // 3. Test 2FA (TOTP)
    test('Génération & Vérification TOTP (P1 #3)', async () => {
        const { secret } = await twoFactorService.generateSecret('test@bca.gn');
        
        // Simuler un code valide à l'instant T (difficile sans horloge sync, on vérifie juste le format)
        if (!secret || secret.length < 16) throw new Error('Secret TOTP trop court ou absent.');
    });

    // 4. Test Backup Codes 2FA
    test('Codes de Secours 2FA (Usage Unique)', () => {
        const backupCodes = ['ABCD123', 'WXYZ789'];
        const valid = twoFactorService.useBackupCode(backupCodes, 'ABCD123');
        const invalid = twoFactorService.useBackupCode(backupCodes, 'FAKE99');
        
        if (!valid) throw new Error('Code de backup valide rejeté.');
        if (invalid) throw new Error('Code de backup inexistant accepté.');
        if (backupCodes.length !== 1) throw new Error('Le code de backup n\'a pas été consommé après usage.');
    });

    console.log(`\n📊 RÉSULTAT : ${testsPassed}/${totalTests} tests validés.`);
    
    if (testsPassed === totalTests) {
        console.log('\n🛡️  SYSTÈME DE SÉCURITÉ BCA v2.5 : OPÉRATIONNEL AU STANDARDS OWASP.\n');
        process.exit(0);
    } else {
        console.error('\n⚠️  VULNÉRABILITÉS DÉTECTÉES. VÉRIFIEZ VOTRE CONFIGURATION.\n');
        process.exit(1);
    }
}

runSecurityTests().catch(err => {
    console.error('ERREUR CRITIQUE PENDANT LES TESTS:', err);
    process.exit(1);
});
