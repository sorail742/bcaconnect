const { User, Wallet } = require('./src/models');
const bcrypt = require('bcryptjs');

async function create() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            nom_complet: 'Test Vendor',
            email: 'testvendor@bca.com',
            mot_de_passe: hashedPassword,
            role: 'vendeur',
            telephone: '622000000'
        });
        await Wallet.create({ user_id: user.id });
        console.log('✅ Utilisateur de test créé: testvendor@bca.com / password123');
        process.exit(0);
    } catch (e) {
        console.error('❌ Erreur:', e.message);
        process.exit(1);
    }
}
create();
