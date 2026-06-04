require('dotenv').config();
const { sequelize, Order, User } = require('./src/models');

async function seedFakeOrders() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");

        const client = await User.findOne({ where: { role: 'client' } }) || await User.findOne();
        
        if (!client) {
            console.log("Aucun utilisateur trouvé.");
            return;
        }

        // Créer 2 fausses commandes valides pour le transporteur
        const order1 = await Order.create({
            total_ttc: 50000,
            frais_port: 10000,
            statut: 'payé', // Doit être 'payé' avec l'accent
            statut_livraison: 'pret', // Doit être 'pret' pour apparaître en dispo
            utilisateur_id: client.id,
            nom_destinataire: 'Test Destinataire 3',
            telephone_livraison: '620000003',
            adresse_livraison: 'Conakry, Kaloum'
        });

        const order2 = await Order.create({
            total_ttc: 75000,
            frais_port: 10000,
            statut: 'payé',
            statut_livraison: 'pret',
            utilisateur_id: client.id,
            nom_destinataire: 'Test Destinataire 4',
            telephone_livraison: '620000004',
            adresse_livraison: 'Conakry, Dixinn'
        });

        console.log("✅ 2 fausses commandes PARFAITES créées avec succès !");
        console.log("Order 3:", order1.id);
        console.log("Order 4:", order2.id);

    } catch (error) {
        console.error("Erreur:", error);
    } finally {
        process.exit(0);
    }
}

seedFakeOrders();
