const { Product } = require('./backend/src/models');

async function checkProducts() {
    try {
        const products = await Product.findAll({
            attributes: ['nom_produit', 'image_url', 'categorie_id'],
            limit: 20
        });
        console.log(JSON.stringify(products, null, 2));
    } catch (error) {
        console.error(error);
    }
}

checkProducts();
