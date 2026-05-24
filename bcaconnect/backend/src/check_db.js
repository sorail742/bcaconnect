const { sequelize } = require('./models');
const Category = require('./models/Category');

async function check() {
    try {
        const qi = sequelize.getQueryInterface();
        const def = await qi.describeTable('categories');
        console.log('Columns in categories:', Object.keys(def));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
