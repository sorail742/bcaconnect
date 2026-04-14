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
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            connectTimeout: 60000 // Timeout de connexion socket
        },
        pool: {
            max: 20, // Augmenté pour gérer les bouffées de requêtes
            min: 1,
            acquire: 60000,
            idle: 10000,
            evict: 1000,
        },
        define: {
            timestamps: true,
            underscored: true,
        },
        // Ajout d'une stratégie de retry pour Sequelize
        retry: {
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /TimeoutError/
            ],
            max: 3
        }
    });
}

module.exports = sequelize;
