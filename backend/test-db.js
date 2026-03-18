const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}

testConnection();
