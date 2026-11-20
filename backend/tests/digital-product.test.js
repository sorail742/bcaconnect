const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Notification, OrderItem, sequelize } = require('../src/models');

describe('💾 Revente de services/biens numériques (analyse concurrentielle #7)', () => {
    let vendorToken, clientToken;
    let vendorId, clientId;
    let category;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // orderService ne crée les notifications (dont la livraison numérique)
        // que si `req.app.get('socketio')` est défini — jamais le cas via
        // supertest seul (pas de vrai serveur socket.io attaché). Stub minimal
        // pour exercer réellement ce chemin de code dans ce test.
        app.set('socketio', { to: () => ({ emit: () => {} }), emit: () => {} });

        const vendor = await User.create({
            nom_complet: 'Vendor Digital', email: 'vendor-digital@bca.gn', telephone: '611000040',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10), role: 'fournisseur', est_approuve: true,
        });
        vendorId = vendor.id;
        vendorToken = (await request(app).post('/api/auth/login').send({ email: 'vendor-digital@bca.gn', mot_de_passe: 'SecurePass123!' })).body.accessToken;

        const client = await User.create({
            nom_complet: 'Client Digital', email: 'client-digital@bca.gn', telephone: '611000041',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10), role: 'client', est_approuve: true,
        });
        clientId = client.id;
        clientToken = (await request(app).post('/api/auth/login').send({ email: 'client-digital@bca.gn', mot_de_passe: 'SecurePass123!' })).body.accessToken;

        await Store.create({ proprietaire_id: vendorId, nom_boutique: 'Boutique Digitale', slug: 'boutique-digitale', statut: 'actif' });
        category = await Category.create({ nom_categorie: 'Test Digital' });

        const clientWallet = await require('../src/models').Wallet.create({ user_id: clientId, solde_virtuel: 500000, solde_sequestre: 0 });
        await require('../src/models').Wallet.create({ user_id: vendorId, solde_virtuel: 0, solde_sequestre: 0 });
        void clientWallet;
    });

    it('crée un produit numérique', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({
                nom_produit: 'Formation en ligne BCA', prix_unitaire: 25000, stock_quantite: 1000,
                categorie_id: category.id, est_numerique: true, contenu_numerique: 'Accès : https://formation.bca.gn/xyz',
            });

        expect(res.status).toBe(201);
        expect(res.body.est_numerique).toBe(true);
        expect(res.body.contenu_numerique).toBe('Accès : https://formation.bca.gn/xyz');
    });

    it("commande 100% numérique : pas de frais de port, article livré immédiatement, contenu envoyé par notification", async () => {
        const product = await Product.create({
            boutique_id: (await Store.findOne({ where: { proprietaire_id: vendorId } })).id,
            categorie_id: category.id, nom_produit: 'Licence logicielle', prix_unitaire: 15000, stock_quantite: 500,
            est_numerique: true, contenu_numerique: 'Clé : ABC-<script>alert(1)</script>-123',
        });

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                items: [{ productId: product.id, quantity: 1 }],
                deliveryInfo: { nom: 'Client Digital', telephone: '611000041', adresse: 'Conakry' },
                paymentMethod: 'wallet',
            });

        expect(res.status).toBe(201);
        const orderId = res.body.id;

        const order = await require('../src/models').Order.findByPk(orderId);
        expect(Number(order.frais_port)).toBe(0);
        expect(Number(order.total_ttc)).toBe(15000);

        const items = await OrderItem.findAll({ where: { commande_id: orderId } });
        expect(items[0].statut).toBe('livre');

        const notifs = await Notification.findAll({ where: { utilisateur_id: clientId, titre: { [require('sequelize').Op.like]: 'Accès numérique%' } } });
        expect(notifs.length).toBe(1);
        // Le contenu vendeur est échappé — pas de balise <script> exécutable dans le message stocké.
        expect(notifs[0].message).not.toContain('<script>');
        expect(notifs[0].message).toContain('&lt;script&gt;');
    });

    it('commande mixte (numérique + physique) : les frais de port normaux s\'appliquent', async () => {
        const store = await Store.findOne({ where: { proprietaire_id: vendorId } });
        const digitalProduct = await Product.create({
            boutique_id: store.id, categorie_id: category.id, nom_produit: 'E-book', prix_unitaire: 5000,
            stock_quantite: 500, est_numerique: true, contenu_numerique: 'Lien de téléchargement',
        });
        const physicalProduct = await Product.create({
            boutique_id: store.id, categorie_id: category.id, nom_produit: 'Casquette BCA', prix_unitaire: 10000, stock_quantite: 500,
        });

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                items: [{ productId: digitalProduct.id, quantity: 1 }, { productId: physicalProduct.id, quantity: 1 }],
                deliveryInfo: { nom: 'Client Digital', telephone: '611000041', adresse: 'Conakry, Ratoma' },
                paymentMethod: 'wallet',
            });

        expect(res.status).toBe(201);
        const order = await require('../src/models').Order.findByPk(res.body.id);
        expect(Number(order.frais_port)).toBeGreaterThan(0);

        const items = await OrderItem.findAll({ where: { commande_id: order.id } });
        const digitalItem = items.find((i) => i.prix_unitaire_achat == 5000);
        const physicalItem = items.find((i) => i.prix_unitaire_achat == 10000);
        expect(digitalItem.statut).toBe('livre');
        expect(physicalItem.statut).toBe('en_attente');
    });
});
