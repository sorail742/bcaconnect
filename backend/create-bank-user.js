const { User, Wallet } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createBankUser() {
    try {
        const email = 'banque@bca.gn';

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log(`L'utilisateur ${email} existe déjà.`);
            process.exit(0);
        }

        const password = 'Banque2024!';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            nom_complet: 'BCA Banque Centrale',
            email: email,
            telephone: '620000000',
            mot_de_passe: hashedPassword,
            role: 'banque',
            statut: 'actif',
            est_approuve: true
        });

        await Wallet.create({ user_id: newUser.id });

        console.log(`Utilisateur Banque créé avec succès !`);
        console.log(`Email : ${email}`);
        console.log(`Mot de passe : ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur banque :', error);
        process.exit(1);
    }
}

createBankUser();
