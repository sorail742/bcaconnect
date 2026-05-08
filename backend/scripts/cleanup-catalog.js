const { Product, Category, Store, User, Wallet, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function cleanup() {
    try {
        console.log('🧹 Démarrage du nettoyage du catalogue...');

        // 1. Identifier et supprimer le vendeur global et sa boutique
        const vendor = await User.findOne({ where: { email: 'vendeur_pro@bca.com' } });
        if (vendor) {
            const store = await Store.findOne({ where: { proprietaire_id: vendor.id } });
            if (store) {
                const deletedProducts = await Product.destroy({ where: { boutique_id: store.id } });
                console.log(`✅ ${deletedProducts} produits supprimés de la boutique globale.`);
                await store.destroy();
                console.log('✅ Boutique globale supprimée.');
            }
            await Wallet.destroy({ where: { user_id: vendor.id } });
            await vendor.destroy();
            console.log('✅ Vendeur global supprimé.');
        }

        // 2. Supprimer les catégories créées aujourd'hui (01 Mai 2026) par le script de peuplement
        // Note: Les catégories originales ont été créées le 22 Avril 2026.
        const deletedCategories = await Category.destroy({
            where: {
                createdAt: {
                    [Op.gte]: new Date('2026-05-01T12:00:00Z')
                }
            }
        });
        console.log(`✅ ${deletedCategories} catégories créées aujourd'hui supprimées.`);

        // 3. Restaurer les images pour "Mangue" et "Voiture"
        // On utilise les images qui étaient définies dans repair-images.js ou qui semblent être les originales préférées
        const productsToRestore = await Product.findAll({
            where: {
                [Op.or]: [
                    { nom_produit: { [Op.like]: '%Mangue%' } },
                    { nom_produit: { [Op.like]: '%Voiture%' } }
                ]
            }
        });

        for (const p of productsToRestore) {
            let oldUrl = p.image_url;
            if (p.nom_produit.toLowerCase().includes('mangue')) {
                p.image_url = 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800';
            } else if (p.nom_produit.toLowerCase().includes('voiture')) {
                // Pour les voitures, on tente de remettre l'image de voiture sportive si c'est une voiture de sport
                if (p.nom_produit.toLowerCase().includes('sport')) {
                    p.image_url = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800';
                } else {
                    p.image_url = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800';
                }
            }
            await p.save();
            console.log(`🔄 Image restaurée pour : ${p.nom_produit} (${oldUrl} -> ${p.image_url})`);
        }

        console.log('✨ Nettoyage et restauration terminés !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
        process.exit(1);
    }
}

cleanup();
