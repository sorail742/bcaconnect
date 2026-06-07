/**
 * Crée des garanties actives pour client@test.com
 * Usage: node scripts/seed-guarantees.js
 */
require('dotenv').config();
const { User, Product, Order, OrderItem, Guarantee } = require('../src/models');

async function seed() {
    try {
        const client = await User.findOne({ where: { email: 'client@test.com' } });
        if (!client) {
            console.error('❌ client@test.com introuvable — lancez npm run seed:accounts');
            process.exit(1);
        }

        const order = await Order.findOne({
            where: { utilisateur_id: client.id },
            order: [['created_at', 'DESC']],
        });

        let productIds = [];
        if (order) {
            const items = await OrderItem.findAll({ where: { commande_id: order.id }, limit: 3 });
            productIds = items.map((i) => i.produit_id).filter(Boolean);
        }

        if (productIds.length === 0) {
            const products = await Product.findAll({ limit: 3 });
            productIds = products.map((p) => p.id);
        }

        if (productIds.length === 0) {
            console.error('❌ Aucun produit trouvé pour créer des garanties.');
            process.exit(1);
        }

        let created = 0;
        for (const produit_id of productIds) {
            const exists = await Guarantee.findOne({
                where: { acheteur_id: client.id, produit_id, status: 'active' },
            });
            if (exists) continue;

            const dateFin = new Date();
            dateFin.setMonth(dateFin.getMonth() + 12);

            await Guarantee.create({
                produit_id,
                acheteur_id: client.id,
                commande_id: order?.id || null,
                duree_mois: 12,
                date_debut: new Date(),
                date_fin: dateFin,
                status: 'active',
                conditions: 'Garantie constructeur BCA Connect — pièces et main d\'œuvre incluses.',
            });
            created++;
        }

        const total = await Guarantee.count({ where: { acheteur_id: client.id, status: 'active' } });
        console.log(`✅ ${created} garantie(s) créée(s). Total actives : ${total}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

seed();
