require('dotenv').config();
const { sequelize, Order } = require('./src/models');

async function fixOrders() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");

        const [updatedCount] = await Order.update(
            { statut: 'payé', statut_livraison: 'pret' },
            { where: { statut_livraison: 'en_attente' } }
        );

        console.log(`✅ ${updatedCount} commandes mises à jour vers pret/payé !`);
    } catch (error) {
        console.error("Erreur:", error);
    } finally {
        process.exit(0);
    }
}
fixOrders();
