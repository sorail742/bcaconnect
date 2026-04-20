#!/usr/bin/env node
/**
 * BCA Connect — Script de démarrage sécurisé.
 * Valide les variables d'environnement et initialise les services de sécurité.
 */
require('dotenv').config();

// 🔐 Validation des variables d'environnement (P0 - Sécurité)
const { validateEnv } = require('./config/envValidation');
validateEnv();

const app = require('./app');
const { sequelize } = require('./models');
const http = require('http');
const { Server } = require('socket.io');
const { QueryTypes } = require('sequelize');
const refreshTokenService = require('./services/refreshTokenService');

/**
 * Migration douce : ajoute les colonnes manquantes sans DROP/RECREATE.
 * Compatible SQLite avec contraintes FK.
 */
async function runSafeMigrations(sequelize) {
    const qi = sequelize.getQueryInterface();

    const migrations = [
        // Table boutiques — colonnes carousel
        {
            table: 'boutiques',
            column: 'use_carousel',
            definition: { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: false, allowNull: false }
        },
        {
            table: 'boutiques',
            column: 'banner_images',
            definition: { type: require('sequelize').DataTypes.TEXT, allowNull: true }
        }
    ];

    for (const m of migrations) {
        try {
            // Vérifier si la colonne existe déjà
            const tableDesc = await sequelize.query(
                `PRAGMA table_info(${m.table})`,
                { type: QueryTypes.SELECT }
            );
            const exists = tableDesc.some(col => col.name === m.column);

            if (!exists) {
                await qi.addColumn(m.table, m.column, m.definition);
                console.log(`✅ Migration : colonne '${m.column}' ajoutée à '${m.table}'`);
            }
        } catch (err) {
            console.warn(`⚠️  Migration '${m.column}' ignorée : ${err.message}`);
        }
    }
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
    ? ['https://bcaconnect-backend.onrender.com', 'https://bcaconnect.onrender.com', 'https://bcaconnect.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"]
    }
});

// Attacher io à l'app pour y accéder dans les contrôleurs
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('⚡ Un utilisateur s\'est connecté :', socket.id);

    // Rejoindre le canal personnel
    socket.on('join', (userId) => {
        socket.join(userId);
        socket.userId = userId;
        console.log(`👤 Utilisateur ${userId} a rejoint son canal personnel.`);
    });

    // Rejoindre une room de conversation
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conv_${conversationId}`);
    });

    // Indicateur de frappe
    socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(`conv_${conversationId}`).emit('user_typing', {
            conversationId,
            userId: socket.userId,
            isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log('🔥 Utilisateur déconnecté :', socket.id);
    });
});

const start = async () => {
    try {
        // 🔐 Initialiser Redis pour la rotation des refresh tokens
        console.log('🔄 Initialisation de Redis...');
        await refreshTokenService.connect();

        // Connexion à la base de données
        await sequelize.authenticate();
        console.log('✅ Connexion PostgreSQL établie.');

        // Synchronisation standard (ne modifie pas les tables existantes)
        await sequelize.sync();
        console.log('✅ Modèles synchronisés.');

        // Migration douce : ajout des colonnes manquantes sans toucher aux FK
        await runSafeMigrations(sequelize);

        // Démarrer le serveur
        server.listen(PORT, () => {
            console.log(`\n🚀 BCA Connect Real-Time API v2.6 — Port ${PORT}`);
            console.log(`🔐 Sécurité: RS256 JWT + Refresh Token Rotation + Redis`);
            console.log(`📊 Environnement: ${process.env.NODE_ENV}\n`);
        });

        // Gestion de l'arrêt gracieux
        process.on('SIGTERM', async () => {
            console.log('\n⏹️  Signal SIGTERM reçu. Arrêt gracieux...');
            await refreshTokenService.disconnect();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('\n⏹️  Signal SIGINT reçu. Arrêt gracieux...');
            await refreshTokenService.disconnect();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Échec du démarrage du serveur :', error);
        process.exit(1);
    }
};

start();
