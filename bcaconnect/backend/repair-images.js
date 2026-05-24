/**
 * 🛠️ BCA Connect — Script de Réparation des Images
 * Ce script met à jour les URLs des images dans la base de données
 * vers des images réelles Unsplash pour assurer un affichage parfait.
 */

require('dotenv').config();
const { Product, Store } = require('./src/models');

const REPLACEMENTS = [
    { name: 'Mangue', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800' },
    { name: 'Banane', url: 'https://images.unsplash.com/photo-1571771894821-ad9958a35c47?auto=format&fit=crop&q=80&w=800' },
    { name: 'voiture', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800' },
    { name: 'Veste', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800' },
    { name: 'Électronique', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800' }
];

async function repair() {
    try {
        console.log('🔍 Analyse de la base de données...');
        const products = await Product.findAll();
        
        let count = 0;
        for (const product of products) {
            // Trouver une image de remplacement basée sur le nom
            const match = REPLACEMENTS.find(r => 
                product.nom_produit.toLowerCase().includes(r.name.toLowerCase())
            );

            // Si c'est une URL localhost qui n'existe plus ou une image par défaut
            if (match && (product.image_url.includes('localhost') || !product.image_url)) {
                product.image_url = match.url;
                await product.save();
                console.log(`✅ Mis à jour : ${product.nom_produit} -> ${match.name}`);
                count++;
            }
        }

        // Réparer aussi les logos des boutiques si nécessaire
        const stores = await Store.findAll();
        for (const store of stores) {
            if (!store.logo_url || store.logo_url.includes('localhost')) {
                store.logo_url = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=400';
                await store.save();
                console.log(`✅ Boutique réparée : ${store.nom_boutique}`);
            }
        }

        console.log(`\n🎉 Réparation terminée ! ${count} produits mis à jour.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de réparation :', error);
        process.exit(1);
    }
}

repair();
