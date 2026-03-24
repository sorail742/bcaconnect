const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const useLocalDB = !process.env.DATABASE_URL || process.env.USE_LOCAL_DB === 'true';

let sequelize;

const path = require('path');

if (useLocalDB || isTest) {
    console.log('📦 Utilisation de SQLite (Local/Persistant)');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../data/database.sqlite'),
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
        }
    });
} else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        /* dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }, */
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
        },
    });
}

module.exports = sequelize;
