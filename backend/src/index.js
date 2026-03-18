const app = require('./app');
const sequelize = require('./config/database');
require('./models'); // Initialise les relations entre modèles

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Synchronisation de la base de données
        // Utiliser { alter: true } en développement pour mettre à jour les tables
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données PostgreSQL établie.');

        // En phase 1 & 2, on synchronise les modèles
        const useLocalDB = process.env.USE_LOCAL_DB === 'true';
        await sequelize.sync({
            alter: !useLocalDB,
            force: useLocalDB
        });
        console.log(`✅ Modèles synchronisés (${useLocalDB ? 'FORCE' : 'ALTER'}).`);

        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur : http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Impossible de se connecter à la base de données :', error);
        process.exit(1);
    }
}

startServer();
