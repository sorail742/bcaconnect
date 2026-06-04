const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const {
    User, Wallet, Store, Product, Category, Order, OrderItem, sequelize
} = require('../src/models');
const escrowService = require('../src/services/escrowService');
const tokenService = require('../src/services/tokenService');

describe('🛡️ Escrow Service — Séquestre bulletproof', () => {
    let buyerToken;
    let vendorId;
    let productId;
    let orderId;
    let orderItemId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Escrow',
            email: 'vendor-escrow@bca.gn',
            telephone: '611000001',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        vendorId = vendor.id;

        await Wallet.create({ user_id: vendorId, solde_virtuel: 0, solde_sequestre: 0 });

        const store = await Store.create({
            proprietaire_id: vendorId,
            nom_boutique: 'Boutique Test',
            slug: 'boutique-test',
            statut: 'actif',
        });

        const category = await Category.create({ nom_categorie: 'Test', slug: 'test' });

        const product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Produit Escrow',
            prix_unitaire: 50000,
            stock_quantite: 10,
        });
        productId = product.id;

        const buyerRes = await request(app).post('/api/auth/register').send({
            nom_complet: 'Buyer Escrow',
            email: 'buyer-escrow@bca.gn',
            telephone: '611000002',
            mot_de_passe: 'SecurePass123!',
            role: 'client',
        });
        const buyerId = buyerRes.body.user.id;

        await Wallet.update(
            { solde_virtuel: 500000 },
            { where: { user_id: buyerId } }
        );

        buyerToken = (await request(app).post('/api/auth/login').send({
            email: 'buyer-escrow@bca.gn',
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                items: [{ productId, quantity: 2 }],
                paymentMethod: 'wallet',
                deliveryInfo: {
                    nom: 'Buyer Test',
                    telephone: '611000002',
                    adresse: 'Ratoma, Conakry',
                },
            });

        expect(orderRes.status).toBe(201);
        orderId = orderRes.body.id;

        const item = await OrderItem.findOne({ where: { commande_id: orderId } });
        orderItemId = item.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('doit créditer le séquestre vendeur à la commande', async () => {
        const vWallet = await Wallet.findOne({ where: { user_id: vendorId } });
        expect(parseFloat(vWallet.solde_sequestre)).toBe(100000);
    });

    it('doit libérer le séquestre une seule fois (idempotent)', async () => {
        const t = await sequelize.transaction();
        const item = await OrderItem.findByPk(orderItemId, { transaction: t });

        const first = await escrowService.releaseItemEscrow(item, orderId, t, 'TEST', 'release_escrow');
        expect(first.released).toBe(true);
        expect(first.amount).toBe(100000);

        const itemReloaded = await OrderItem.findByPk(orderItemId, { transaction: t });
        const second = await escrowService.releaseItemEscrow(itemReloaded, orderId, t, 'TEST', 'release_escrow');
        expect(second.released).toBe(false);
        expect(second.reason).toBe('already_released');

        await t.commit();

        const vWallet = await Wallet.findOne({ where: { user_id: vendorId } });
        expect(parseFloat(vWallet.solde_virtuel)).toBe(100000);
        expect(parseFloat(vWallet.solde_sequestre)).toBe(0);
    });

    it('doit chiffrer adresse_livraison en base (AES-256-GCM)', async () => {
        const [rows] = await sequelize.query(
            `SELECT adresse_livraison FROM commandes WHERE id = '${orderId}'`
        );
        expect(rows[0].adresse_livraison).toContain(':');
    });
});
