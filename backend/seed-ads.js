const { Publicite, PubliciteCiblage, PubliciteStat, sequelize } = require('./src/models');

async function seedAds() {
    try {
        await sequelize.sync();

        // 1. Pub pour tout le monde (Banner)
        const ad1 = await Publicite.create({
            titre: "Promotion Spéciale BCA",
            contenu: "Profitez de 20% de réduction sur tous les produits locaux ce week-end !",
            url_image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
            url_destination: "https://bcaconnect.com/promo",
            format: 'banner',
            statut: 'active',
            date_debut: new Date(),
            date_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
            budget_total: 1000000,
            budget_restant: 1000000
        });

        await PubliciteCiblage.create({
            publicite_id: ad1.id,
            role_cible: 'all'
        });

        await PubliciteStat.create({ publicite_id: ad1.id });

        // 2. Pub pour les Vendeurs (Services Marketing)
        const ad2 = await Publicite.create({
            titre: "Boostez votre Boutique",
            contenu: "Nouveaux outils d'analyse disponibles pour optimiser vos ventes.",
            url_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
            url_destination: "https://bcaconnect.com/vendor-tools",
            format: 'banner',
            statut: 'active',
            date_debut: new Date(),
            date_fin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            budget_total: 500000,
            budget_restant: 500000
        });

        await PubliciteCiblage.create({
            publicite_id: ad2.id,
            role_cible: 'vendor'
        });

        await PubliciteStat.create({ publicite_id: ad2.id });

        console.log("✅ Publicités de test insérées avec succès !");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur seeding ads:", error);
        process.exit(1);
    }
}

seedAds();
