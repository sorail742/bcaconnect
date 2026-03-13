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

        // En phase 1, on synchronise les modèles
        // ATTENTION: { force: false } ne supprime pas les données existantes
        await sequelize.sync({ force: false });
        console.log('✅ Modèles synchronisés avec la base de données.');

        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur : http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Impossible de se connecter à la base de données :', error);
        process.exit(1);
    }
}

startServer();
