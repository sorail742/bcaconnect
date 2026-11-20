const bcrypt = require('bcryptjs');
const { User, Store, Product, Category, Notification, sequelize } = require('../src/models');
const { runStockAlerts } = require('../src/cron/stockAlertCron');

describe('📦 Réapprovisionnement automatique sur seuil de stock (analyse concurrentielle #4)', () => {
    let vendorId;
    let storeId;
    let categoryId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Reappro',
            email: 'vendor-reappro@bca.gn',
            telephone: '611000010',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        vendorId = vendor.id;

        const store = await Store.create({
            proprietaire_id: vendorId,
            nom_boutique: 'Boutique Reappro',
            slug: 'boutique-reappro',
            statut: 'actif',
        });
        storeId = store.id;

        const category = await Category.create({ nom_categorie: 'Test Reappro' });
        categoryId = category.id;
    });

    afterEach(async () => {
        await Notification.destroy({ where: {}, truncate: true });
    });

    it('réapprovisionne automatiquement un produit configuré, même au-dessus du seuil global par défaut', async () => {
        // stock=8 > LOW_STOCK_THRESHOLD(5) : l'ancienne logique n'aurait rien fait.
        const product = await Product.create({
            boutique_id: storeId,
            categorie_id: categoryId,
            nom_produit: 'Ciment 50kg',
            prix_unitaire: 90000,
            stock_quantite: 8,
            reappro_auto_actif: true,
            reappro_seuil: 10,
            reappro_quantite: 50,
        });

        await runStockAlerts(null);

        await product.reload();
        expect(product.stock_quantite).toBe(58);
        expect(product.reappro_derniere_execution).not.toBeNull();

        const notif = await Notification.findOne({ where: { utilisateur_id: vendorId } });
        expect(notif).not.toBeNull();
        expect(notif.titre).toBe('Réapprovisionnement automatique effectué');
    });

    it("n'envoie qu'une alerte (sans toucher au stock) pour un produit sous le seuil sans auto-réappro activé", async () => {
        const product = await Product.create({
            boutique_id: storeId,
            categorie_id: categoryId,
            nom_produit: 'Fer à béton',
            prix_unitaire: 15000,
            stock_quantite: 3,
            reappro_auto_actif: false,
        });

        await runStockAlerts(null);

        await product.reload();
        expect(product.stock_quantite).toBe(3);

        const notif = await Notification.findOne({ where: { utilisateur_id: vendorId } });
        expect(notif).not.toBeNull();
        expect(notif.titre).toBe('Alerte de Stock Bas');
    });

    it('ne déclenche rien pour un produit auto-réappro activé mais encore au-dessus de son seuil', async () => {
        const product = await Product.create({
            boutique_id: storeId,
            categorie_id: categoryId,
            nom_produit: 'Peinture 20L',
            prix_unitaire: 60000,
            stock_quantite: 25,
            reappro_auto_actif: true,
            reappro_seuil: 10,
            reappro_quantite: 30,
        });

        await runStockAlerts(null);

        await product.reload();
        expect(product.stock_quantite).toBe(25);
        expect(product.reappro_derniere_execution).toBeNull();
    });
});
