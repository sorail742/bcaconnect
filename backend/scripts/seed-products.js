const sequelize = require('../src/config/database');
// Charger l'index des modèles pour avoir les associations
const { Category, Product, Store } = require('../src/models/index');

const IMAGE_POOLS = {
    fashion: [
        "https://images.unsplash.com/photo-1551028150-64b9f398f678",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772",
        "https://images.unsplash.com/photo-1581605405669-fcdf81165afa"
    ],
    tech: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"
    ],
    home: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        "https://images.unsplash.com/photo-1530018607912-eff2df114f11",
        "https://images.unsplash.com/photo-1534073828943-f801091bb18c",
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36"
    ],
    industrial: [
        "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad",
        "https://images.unsplash.com/photo-1565514020179-026b92b84bb6",
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
        "https://images.unsplash.com/photo-1541888946425-d81bb19480c5",
        "https://images.unsplash.com/photo-1504307651254-35680f3366d4"
    ],
    beauty: [
        "https://images.unsplash.com/photo-1570172619380-2126ad5e542c",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571"
    ],
    office: [
        "https://images.unsplash.com/photo-1519311965067-36d3e5f33d39",
        "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3",
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4"
    ],
    other: [
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f",
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7",
        "https://images.unsplash.com/photo-1544816155-12df9643f363"
    ]
};

const SUFFIX = "?auto=format&fit=crop&q=80&w=800";

function getPool(catName) {
    const name = catName.toLowerCase();
    if (name.includes('vêtement') || name.includes('chaussure') || name.includes('bagage') || name.includes('sac') || name.includes('mode') || name.includes('habit')) return IMAGE_POOLS.fashion;
    if (name.includes('électronique') || name.includes('electronique') || name.includes('composant') || name.includes('tech')) return IMAGE_POOLS.tech;
    if (name.includes('maison') || name.includes('jardin') || name.includes('construction') || name.includes('immobilier')) return IMAGE_POOLS.home;
    if (name.includes('industrielle') || name.includes('machine') || name.includes('fabrication') || name.includes('manutention') || name.includes('énergie')) return IMAGE_POOLS.industrial;
    if (name.includes('beauté') || name.includes('santé') || name.includes('hygiène') || name.includes('médical')) return IMAGE_POOLS.beauty;
    if (name.includes('bureau') || name.includes('service') || name.includes('cadeau')) return IMAGE_POOLS.office;
    return IMAGE_POOLS.other;
}

async function start() {
    try {
        console.log("🚀 Lancement de la diversification INTELLIGENTE des images...");
        
        const categories = await Category.findAll();
        for (const cat of categories) {
            console.log(`📦 Catégorie : ${cat.nom_categorie}`);
            const pool = getPool(cat.nom_categorie);
            const products = await Product.findAll({ where: { categorie_id: cat.id } });
            
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                // On met à jour TOUS les produits qui ne sont pas des originaux de l'utilisateur (on évite ceux avec des uploads locaux)
                if (product.image_url.startsWith('http')) {
                    const imgUrl = (pool[i % pool.length] || pool[0]) + SUFFIX;
                    await product.update({ image_url: imgUrl });
                    console.log(`   ✅ Image mise à jour pour : ${product.nom_produit}`);
                }
            }
        }
        
        console.log("✨ Catalogue diversifié avec succès !");
    } catch (error) {
        console.error("❌ Erreur :", error);
    } finally {
        await sequelize.close();
    }
}

start();
