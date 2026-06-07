/**
 * Remet du stock sur les produits à 0 (démo / tests)
 * Usage: node scripts/restore-product-stock.js
 */
require('dotenv').config();
const { Product } = require('../src/models');

async function run() {
    const [count] = await Product.update(
        { stock_quantite: 25 },
        { where: { stock_quantite: 0 } },
    );
    console.log(`✅ Stock restauré sur ${count} produit(s).`);
    process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
