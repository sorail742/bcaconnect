const { User } = require('./src/models');
require('dotenv').config();

async function checkAdmin() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@bca.com' } });
        if (admin) {
            console.log('Admin found:');
            console.log('ID:', admin.id);
            console.log('Role:', admin.role);
            console.log('Email:', admin.email);
        } else {
            console.log('Admin NOT found');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkAdmin();
