
const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkUsers() {
    try {
        const users = await User.findAll({ attributes: ['email', 'role'] });
        console.log('--- USERS IN DATABASE ---');
        users.forEach(u => console.log(`${u.email}: ${u.role}`));
        console.log('-------------------------');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUsers();
