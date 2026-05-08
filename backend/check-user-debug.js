const { User } = require('./src/models');

async function checkUser() {
    try {
        const user = await User.findOne({ where: { email: 'thioye@gmail.com' } });
        if (user) {
            console.log('✅ User found:', {
                id: user.id,
                email: user.email,
                role: user.role,
                statut: user.statut,
                has_password: !!user.mot_de_passe
            });
        } else {
            console.log('❌ User not found');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUser();
