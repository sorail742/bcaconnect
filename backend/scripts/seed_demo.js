const { User, Store, Category, Product, Order, OrderItem, Transaction, Wallet, sequelize } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    try {
        console.log('--- Démarrage du Seeding Démo (Correction) ---');
        await sequelize.sync({ force: false });

        // 1. Catégories
        const categoriesData = [
            { nom_categorie: 'ELECTRONIQUE', description: 'Gadgets et high-tech' },
            { nom_categorie: 'MODE', description: 'Vêtements et accessoires' },
            { nom_categorie: 'MAISON', description: 'Décoration et mobilier' },
            { nom_categorie: 'ALIMENTATION', description: 'Produits frais et épicerie' },
            { nom_categorie: 'SANTE', description: 'Soins et cosmétiques' }
        ];

        for (const cat of categoriesData) {
            await Category.findOrCreate({ where: { nom_categorie: cat.nom_categorie }, defaults: cat });
        }
        const categories = await Category.findAll();
        console.log(`✅ ${categories.length} catégories prêtes.`);

        // 2. Utilisateurs
        const usersToCreate = [
            { id: uuidv4(), nom_complet: 'Admin Démo', email: 'admin@bca.com', role: 'admin', tel: '622000000' },
            { id: uuidv4(), nom_complet: 'Fournisseur Alpha', email: 'vendor@bca.com', role: 'fournisseur', tel: '622111111' },
            { id: uuidv4(), nom_complet: 'Client Test', email: 'client@bca.com', role: 'client', tel: '622222222' }
        ];

        for (const u of usersToCreate) {
            const [userInstance] = await User.findOrCreate({
                where: { email: u.email },
                defaults: {
                    id: u.id,
                    nom_complet: u.nom_complet,
                    email: u.email,
                    mot_de_passe: '$2b$10$K7.tE.mRk6E5dG3f9eH.eO.eO.eO.eO.eO.eO.eO.eO.eO.eO',
                    role: u.role,
                    telephone: u.tel,
                    statut: 'actif'
                }
            });
            // Créer un portefeuille si inexistant
            await Wallet.findOrCreate({
                where: { user_id: userInstance.id },
                defaults: {
                    id: uuidv4(),
                    user_id: userInstance.id,
                    solde: 100000000 // 100M GNF pour tests
                }
            });
        }

        const admin = await User.findOne({ where: { email: 'admin@bca.com' } });
        const vendor = await User.findOne({ where: { email: 'vendor@bca.com' } });
        const client = await User.findOne({ where: { email: 'client@bca.com' } });
        const vendorWallet = await Wallet.findOne({ where: { user_id: vendor.id } });

        // 3. Boutique
        const [storeInstance] = await Store.findOrCreate({
            where: { proprietaire_id: vendor.id },
            defaults: {
                id: uuidv4(),
                nom_boutique: 'BCA Tech Hub',
                description: 'Boutique officielle de test',
                proprietaire_id: vendor.id,
                statut: 'actif'
            }
        });

        // 4. Produits
        const productsData = [
            { nom: 'iPhone 15 Pro', prix: 15000000, stock: 50, cat: 'ELECTRONIQUE' },
            { nom: 'MacBook Air M2', prix: 18000000, stock: 20, cat: 'ELECTRONIQUE' },
            { nom: 'Nike Air Max', prix: 1200000, stock: 100, cat: 'MODE' },
            { nom: 'Canapé Design', prix: 5500000, stock: 10, cat: 'MAISON' },
            { nom: 'Sac de Riz 50kg', prix: 350000, stock: 500, cat: 'ALIMENTATION' }
        ];

        for (const p of productsData) {
            const cat = categories.find(c => c.nom_categorie === p.cat);
            await Product.findOrCreate({
                where: { nom_produit: p.nom },
                defaults: {
                    id: uuidv4(),
                    nom_produit: p.nom,
                    description: `Super ${p.nom}`,
                    prix_unitaire: p.prix,
                    stock_quantite: p.stock,
                    categorie_id: cat ? cat.id : null,
                    boutique_id: storeInstance.id,
                    statut: 'publié'
                }
            });
        }
        const products = await Product.findAll();
        console.log(`✅ ${products.length} produits créés.`);

        // 5. Commandes sur 30 jours
        console.log('⏳ Génération des flux transactionnels...');
        const zones = ['CONAKRY', 'BOKÉ', 'KAMSAR', 'KINDIA', 'MAMOU', 'KANKAN', 'SIGUIRI', 'LABÉ', 'N\'ZÉRÉKORÉ'];
        
        for (let i = 0; i < 80; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const total = parseFloat(randomProduct.prix_unitaire) * quantity;
            const zone = zones[Math.floor(Math.random() * zones.length)];

            const order = await Order.create({
                id: uuidv4(),
                utilisateur_id: client.id,
                total_ttc: total,
                statut: 'payé',
                adresse_livraison: `Quartier Test, ${zone}, Guinée`,
                created_at: date,
                updated_at: date,
                date_commande: date
            });

            await OrderItem.create({
                id: uuidv4(),
                commande_id: order.id,
                produit_id: randomProduct.id,
                fournisseur_id: vendor.id,
                quantite: quantity,
                prix_unitaire_achat: randomProduct.prix_unitaire,
                created_at: date
            });

            // Transaction liée pour les graphs financiers
            await Transaction.create({
                id: uuidv4(),
                portefeuille_id: vendorWallet.id,
                montant: total,
                type_transaction: 'depot',
                statut: 'complete',
                commande_id: order.id,
                created_at: date
            });
        }

        console.log('✅ Base de données dynamisée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur critique de seeding:', error);
        process.exit(1);
    }
}

seed();
