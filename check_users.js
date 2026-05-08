const { User } = require('./backend/src/models');
const { sequelize } = require('./backend/src/models');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({ attributes: ['email', 'role'], limit: 20 });
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUsers();
