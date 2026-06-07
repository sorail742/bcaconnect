const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const {
    User, Wallet, Store, Product, Category, Order, sequelize,
} = require('../src/models');

describe('📦 Phase 1 — Catalogue → Commandes → Paiements', () => {
    let buyerToken;
    let vendorToken;
    let productId;
    let initialStock = 10;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Phase Un',
            email: 'vendor-p1@bca.gn',
            telephone: '620000001',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });

        await Wallet.create({ user_id: vendor.id, solde_virtuel: 0, solde_sequestre: 0 });

        const store = await Store.create({
            proprietaire_id: vendor.id,
            nom_boutique: 'Boutique P1',
            slug: 'boutique-p1',
            statut: 'actif',
        });

        const category = await Category.create({ nom_categorie: 'Test P1', slug: 'test-p1' });

        const product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Produit Phase 1',
            prix_unitaire: 25000,
            stock_quantite: initialStock,
        });
        productId = product.id;

        const buyerRes = await request(app).post('/api/auth/register').send({
            nom_complet: 'Buyer Phase Un',
            email: 'buyer-p1@bca.gn',
            telephone: '620000002',
            mot_de_passe: 'SecurePass123!',
            role: 'client',
        });
        expect(buyerRes.status).toBe(201);

        const buyerId = buyerRes.body.user.id;
        await Wallet.update({ solde_virtuel: 500000 }, { where: { user_id: buyerId } });

        buyerToken = (await request(app).post('/api/auth/login').send({
            email: 'buyer-p1@bca.gn',
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        expect(buyerToken).toBeTruthy();

        vendorToken = (await request(app).post('/api/auth/login').send({
            email: 'vendor-p1@bca.gn',
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        expect(vendorToken).toBeTruthy();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    const orderPayload = (paymentMethod = 'wallet') => ({
        items: [{ productId, quantity: 2 }],
        paymentMethod,
        deliveryInfo: {
            nom: 'Buyer Test',
            telephone: '620000002',
            adresse: 'Ratoma, Conakry',
        },
    });

    test('RBAC — fournisseur ne peut pas passer commande', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send(orderPayload('wallet'));

        expect(res.status).toBe(403);
    });

    test('Wallet — commande créée et stock décrémenté', async () => {
        const before = await Product.findByPk(productId);
        const stockBefore = before.stock_quantite;

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send(orderPayload('wallet'));

        expect(res.status).toBe(201);
        expect(res.body.statut).toBe('payé');

        const after = await Product.findByPk(productId);
        expect(after.stock_quantite).toBe(stockBefore - 2);
    });

    test('Mobile Money — stock intact avant paiement, décrémenté après capture', async () => {
        await Product.update({ stock_quantite: 5 }, { where: { id: productId } });

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send(orderPayload('mobile_money'));

        expect(orderRes.status).toBe(201);
        expect(orderRes.body.statut).toBe('en_attente_paiement');

        const midStock = (await Product.findByPk(productId)).stock_quantite;
        expect(midStock).toBe(5);

        const initRes = await request(app)
            .post('/api/payments/initiate')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                montant: orderRes.body.total_ttc,
                order_id: orderRes.body.id,
                moyen_paiement: 'mobile_money',
            });

        expect(initRes.status).toBe(201);

        const captureRes = await request(app)
            .post('/api/payments/capture-simulation')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ transaction_id: initRes.body.transaction_id });

        expect(captureRes.status).toBe(200);

        const afterStock = (await Product.findByPk(productId)).stock_quantite;
        expect(afterStock).toBe(3);

        const paidOrder = await Order.findByPk(orderRes.body.id);
        expect(paidOrder.statut).toBe('payé');
    });

    test('OTP — demande et vérification', async () => {
        const reqRes = await request(app)
            .post('/api/auth/otp/request')
            .send({ telephone: '620000099', type_action: 'inscription' });

        expect(reqRes.status).toBe(200);
        expect(reqRes.body.code_dev).toBeDefined();

        const verifyRes = await request(app)
            .post('/api/auth/otp/verify')
            .send({
                telephone: '620000099',
                code: reqRes.body.code_dev,
                type_action: 'inscription',
            });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.verified).toBe(true);
    });

    test('Commande hors ligne — mode_resilience enregistré', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ ...orderPayload('cod'), mode_resilience: true });

        expect(res.status).toBe(201);
        expect(res.body.mode_resilience).toBe(true);
    });
});
