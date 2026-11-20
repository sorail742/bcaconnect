jest.mock('../src/config/blockchain', () => ({
    isConfigured: jest.fn(() => true),
    getWallet: jest.fn(),
    getProvider: jest.fn(),
    explorerTxUrl: (hash) => `https://amoy.polygonscan.com/tx/${hash}`,
    AMOY_CHAIN_ID: 80002,
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Order, OrderItem, BlockchainTransactionStub, sequelize } = require('../src/models');
const blockchainConfig = require('../src/config/blockchain');

describe('⛓️ Ancrage blockchain réel — Polygon Amoy testnet (cahier des charges 3.16)', () => {
    let vendorToken, otherVendorToken, adminToken, strangerToken;
    let vendorId;
    let orderId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        app.set('socketio', { to: () => ({ emit: () => {} }), emit: () => {} });

        const makeUser = async (email, role) => {
            const u = await User.create({
                nom_complet: `Blockchain ${role}`, email, telephone: `61140${Math.floor(1000 + Math.random() * 8999)}`,
                mot_de_passe: await bcrypt.hash('SecurePass123!', 10), role, est_approuve: true,
            });
            const token = (await request(app).post('/api/auth/login').send({ email, mot_de_passe: 'SecurePass123!' })).body.accessToken;
            return { user: u, token };
        };

        const vendor = await makeUser('vendor-chain@bca.gn', 'fournisseur');
        const otherVendor = await makeUser('vendor-chain-other@bca.gn', 'fournisseur');
        const admin = await makeUser('admin-chain@bca.gn', 'admin');
        const buyer = await makeUser('buyer-chain@bca.gn', 'client');
        const stranger = await makeUser('stranger-chain@bca.gn', 'client');

        vendorId = vendor.user.id; vendorToken = vendor.token;
        otherVendorToken = otherVendor.token;
        adminToken = admin.token;
        strangerToken = stranger.token;

        const store = await Store.create({ proprietaire_id: vendorId, nom_boutique: 'Boutique Chain', slug: 'boutique-chain', statut: 'actif' });
        const category = await Category.create({ nom_categorie: 'Test Chain' });
        const product = await Product.create({ boutique_id: store.id, categorie_id: category.id, nom_produit: 'Produit Chain', prix_unitaire: 50000, stock_quantite: 20 });

        const order = await Order.create({
            utilisateur_id: buyer.user.id,
            statut: 'confirmé',
            total_ttc: 50000,
            methode_paiement: 'wallet',
            cle_idempotence: `CHAIN-${Date.now()}`,
        });
        await OrderItem.create({
            commande_id: order.id, produit_id: product.id, fournisseur_id: vendorId,
            quantite: 1, prix_unitaire_achat: 50000, statut: 'confirmé',
        });
        orderId = order.id;
    });

    beforeEach(() => {
        blockchainConfig.isConfigured.mockReturnValue(true);
    });

    afterEach(() => jest.clearAllMocks());

    it('refuse un vendeur non lié à la commande', async () => {
        const res = await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${otherVendorToken}`)
            .send({ commande_id: orderId, type_contrat: 'escrow' });
        expect(res.status).toBe(403);
    });

    it("refuse quand le portefeuille Amoy n'est pas configuré (503)", async () => {
        blockchainConfig.isConfigured.mockReturnValue(false);
        const res = await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ commande_id: orderId, type_contrat: 'escrow' });
        expect(res.status).toBe(503);
    });

    it('rejette un type de contrat invalide (validation)', async () => {
        const res = await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ commande_id: orderId, type_contrat: 'not_a_real_type' });
        expect(res.status).toBe(422);
    });

    it('envoie une transaction réelle signée sur Amoy et retourne un hash on-chain vérifiable', async () => {
        let resolveWait;
        const waitPromise = new Promise((resolve) => { resolveWait = resolve; });
        const sendTransaction = jest.fn().mockResolvedValue({
            hash: '0xabc123txhash',
            wait: () => waitPromise,
        });
        blockchainConfig.getWallet.mockReturnValue({ address: '0xWALLET', sendTransaction });

        const res = await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ commande_id: orderId, type_contrat: 'escrow' });

        expect(res.status).toBe(201);
        expect(res.body.stub.hash_transaction).toBe('0xabc123txhash');
        expect(res.body.stub.reseau).toBe('polygon_amoy');
        expect(res.body.stub.statut_onchain).toBe('pending');
        expect(res.body.stub.explorer_url).toBe('https://amoy.polygonscan.com/tx/0xabc123txhash');

        // La transaction envoyée porte le hash SHA-256 du contenu prouvé,
        // vers le propre émetteur (ancrage par preuve d'existence).
        expect(sendTransaction).toHaveBeenCalledWith(expect.objectContaining({
            to: '0xWALLET',
            value: 0n,
            data: expect.stringMatching(/^0x[a-f0-9]{64}$/),
        }));

        resolveWait();
        await new Promise((r) => setImmediate(r));
        const stub = await BlockchainTransactionStub.findOne({ where: { hash_transaction: '0xabc123txhash' } });
        expect(stub.statut_onchain).toBe('confirmed');
    });

    it('marque la preuve en échec si la transaction ne se confirme pas', async () => {
        const sendTransaction = jest.fn().mockResolvedValue({
            hash: '0xdeadfailhash',
            wait: () => Promise.reject(new Error('replacement transaction underpriced')),
        });
        blockchainConfig.getWallet.mockReturnValue({ address: '0xWALLET', sendTransaction });

        const res = await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ commande_id: orderId, type_contrat: 'certificat_authenticite' });

        expect(res.status).toBe(201);
        await new Promise((r) => setImmediate(r));
        const stub = await BlockchainTransactionStub.findOne({ where: { hash_transaction: '0xdeadfailhash' } });
        expect(stub.statut_onchain).toBe('failed');
    });

    it("retourne 502 si l'envoi de la transaction échoue", async () => {
        const sendTransaction = jest.fn().mockRejectedValue(new Error('insufficient funds for gas'));
        blockchainConfig.getWallet.mockReturnValue({ address: '0xWALLET', sendTransaction });

        const res = await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ commande_id: orderId, type_contrat: 'escrow' });

        expect(res.status).toBe(502);
    });

    it("liste les preuves ancrées pour les acteurs légitimes de la commande, avec lien vers l'explorateur Amoy, et refuse un tiers", async () => {
        const sendTransaction = jest.fn().mockResolvedValue({
            hash: '0xlistabletxhash',
            wait: () => new Promise(() => {}), // jamais résolue dans ce test — le statut reste "pending"
        });
        blockchainConfig.getWallet.mockReturnValue({ address: '0xWALLET', sendTransaction });

        await request(app)
            .post('/api/iot/smart-contract')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ commande_id: orderId, type_contrat: 'transfert_propriete' });

        const res = await request(app)
            .get(`/api/iot/orders/${orderId}/smart-contracts`)
            .set('Authorization', `Bearer ${vendorToken}`);
        expect(res.status).toBe(200);
        const found = res.body.stubs.find((s) => s.hash_transaction === '0xlistabletxhash');
        expect(found).toBeDefined();
        expect(found.explorer_url).toBe('https://amoy.polygonscan.com/tx/0xlistabletxhash');

        const denied = await request(app)
            .get(`/api/iot/orders/${orderId}/smart-contracts`)
            .set('Authorization', `Bearer ${strangerToken}`);
        expect(denied.status).toBe(403);
    });
});
