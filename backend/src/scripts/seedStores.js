const { sequelize, Store, User } = require('../models');

async function seed() {
    try {
        console.log('Synchronisation de la table boutiques (alter: true)...');
        await Store.sync({ alter: true });
        console.log('✅ Table boutiques synchronisée.');

        // On cherche ou on crée un utilisateur générique pour posséder les boutiques
        let proprietaire = await User.findOne({ where: { email: 'seed.vendor@bcaconnect.gn' } });
        if (!proprietaire) {
            proprietaire = await User.create({
                nom_complet: 'Fournisseur Test',
                email: 'seed.vendor@bcaconnect.gn',
                mot_de_passe: 'password123',
                telephone: '+224 620 00 00 00',
                role: 'fournisseur',
                is_verified: true,
                statut: 'actif'
            });
            console.log('👤 Utilisateur de test créé.');
        }

        const storesToSeed = [
            {
                nom_boutique: "AgriTech Guinée",
                description: "Leader dans l'importation de matériels agricoles et d'engrais organiques.",
                slug: "agritech-guinee-seed",
                statut: "actif",
                email_boutique: "contact@agritech.gn",
                telephone_boutique: "+224 621 11 11 11",
                is_verified: true,
                rating: 4.8,
                categorie_principale: "Agriculture",
                temps_reponse: "< 1h",
                localisation: "Kindia, Guinée",
                logo_url: "https://images.unsplash.com/photo-1592982537447-6f296ca8e192?auto=format&fit=crop&q=80&w=200"
            },
            {
                nom_boutique: "BCA Électronique Pro",
                description: "Distributeur officiel de grandes marques. Ordinateurs, smartphones, et domotique.",
                slug: "bca-electronique-seed",
                statut: "actif",
                email_boutique: "electro@bca.gn",
                telephone_boutique: "+224 622 22 22 22",
                is_verified: true,
                rating: 4.9,
                categorie_principale: "Électronique",
                temps_reponse: "< 2h",
                localisation: "Conakry, Kaloum",
                logo_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=200"
            },
            {
                nom_boutique: "Auto Parts Conakry",
                description: "Pièces détachées d'origine pour véhicules légers et poids lourds.",
                slug: "autoparts-seed",
                statut: "actif",
                email_boutique: "auto@parts.gn",
                telephone_boutique: "+224 623 33 33 33",
                is_verified: false,
                rating: 4.2,
                categorie_principale: "Pièces Auto",
                temps_reponse: "24h",
                localisation: "Conakry, Matoto",
                logo_url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=200"
            },
            {
                nom_boutique: "Guinée BTP Matériaux",
                description: "Ciment, fer à béton, et outillage professionnel pour vos chantiers.",
                slug: "guinee-btp-seed",
                statut: "actif",
                email_boutique: "contact@gbtp.gn",
                telephone_boutique: "+224 624 44 44 44",
                is_verified: true,
                rating: 4.6,
                categorie_principale: "Construction",
                temps_reponse: "< 4h",
                localisation: "Conakry, Dixinn",
                logo_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200"
            },
            {
                nom_boutique: "Fashion K",
                description: "Vêtements de créateurs et mode locale.",
                slug: "fashion-k-seed",
                statut: "actif",
                email_boutique: "mode@fashionk.gn",
                telephone_boutique: "+224 625 55 55 55",
                is_verified: false,
                rating: 4.0,
                categorie_principale: "Mode",
                temps_reponse: "< 1h",
                localisation: "Conakry, Ratoma",
                logo_url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=200"
            }
        ];

        for (const storeData of storesToSeed) {
            const exists = await Store.findOne({ where: { slug: storeData.slug } });
            if (!exists) {
                // Remove existing store for the owner if we want to assign multiple?
                // Wait, our backend validation limits 1 store per owner in 'create', 
                // but direct Store.create bypasses it. So we can assign them to the same user
                // or create different users.
                
                // Let's create a distinct user per store to respect the 1-to-1 relation ideally
                let storeUser = await User.findOne({ where: { email: storeData.email_boutique } });
                if (!storeUser) {
                    storeUser = await User.create({
                        nom_complet: storeData.nom_boutique + ' Owner',
                        email: storeData.email_boutique,
                        mot_de_passe: 'password123',
                        telephone: storeData.telephone_boutique,
                        role: 'fournisseur',
                        is_verified: true,
                        statut: 'actif'
                    });
                }

                await Store.create({
                    ...storeData,
                    proprietaire_id: storeUser.id
                });
                console.log(`🏬 Boutique insérée : ${storeData.nom_boutique}`);
            } else {
                console.log(`⏩ Boutique déjà existante : ${storeData.nom_boutique}`);
            }
        }

        console.log('✅ Seeding terminé avec succès.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        process.exit(1);
    }
}

seed();
