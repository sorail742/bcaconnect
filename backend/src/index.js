#!/usr/bin/env node
/**
 * BCA Connect — Script de démarrage pour la production.
 * Vérifie les variables d'environnement essentielles avant de lancer le serveur.
 */
require('dotenv').config(); // ← Doit être PREMIER

require('dotenv').config();

const requiredVars = ['JWT_SECRET'];

// Vérification de la Base de Données
const hasDbUrl = !!process.env.DATABASE_URL;
const hasDbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'].every(v => !!process.env[v]);

if (!hasDbUrl && !hasDbVars) {
    console.warn('\n⚠️  ALERTE : Aucune base PostgreSQL. Mode SQLite actif.\n');
}

// Sécurité JWT souple (on ne crash pas, on met un défaut)
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET MANQUANT : Utilisation d\'une clé de secours instable.');
    console.error('   Veuillez définir JWT_SECRET dans le dashboard Render.');
    process.env.JWT_SECRET = 'bca_connect_super_secret_fallback_key_2024';
}

const app = require('./app');
const { sequelize } = require('./models');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // En dév, on laisse ouvert. En prod, à restreindre.
        methods: ["GET", "POST"]
    }
});

// Attacher io à l'app pour y accéder dans les contrôleurs
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('⚡ Un utilisateur s\'est connecté :', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 Utilisateur ${userId} a rejoint son canal personnel.`);
    });

    socket.on('disconnect', () => {
        console.log('🔥 Utilisateur déconnecté');
    });
});

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion PostgreSQL établie.');

        // Synchronisation standard (Stable)
        await sequelize.sync();
        console.log('✅ Modèles synchronisés.');

        server.listen(PORT, () => {
            console.log(`\n🚀 BCA Connect Real-Time API v2.5 — Port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Échec du démarrage du serveur :', error);
        process.exit(1);
    }
};

start();
