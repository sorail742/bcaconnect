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
    const sslOptions = process.env.DATABASE_URL.includes('sslmode=require') || process.env.DB_SSL === 'true'
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
        : {};

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ...sslOptions,
            connectTimeout: 60000
        },
        pool: {
            max: 20,
            min: 2, // Garder des connexions chaudes pour éviter ECONNRESET
            acquire: 60000,
            idle: 30000, // Augmenté à 30s pour Neon
        },
        define: {
            timestamps: true,
            underscored: true,
        },
        retry: {
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /TimeoutError/,
                /ECONNRESET/, // Ajouté pour la résilience réseau
                /EPIPE/       // Ajouté pour la résilience réseau
            ],
            max: 5 // Augmenté pour plus de robustesse
        }
    });
}

module.exports = sequelize;
