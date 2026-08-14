jest.mock('../src/ai/service/ai.service', () => ({
    mediateDispute: jest.fn().mockResolvedValue({
        solution_proposee: 'Remboursement intégral recommandé par l\'IA.',
        score_gravite: 0.75
    })
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Wallet, Store, Product, Category, Order, OrderItem, Litige, sequelize } = require('../src/models');

describe('⚖️ Litiges — Workflow + remboursement auto', () => {
    let buyerToken;
    let adminToken;
    let vendorId;
    let orderId;
    let disputeId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const admin = await User.create({
            nom_complet: 'Admin Litige',
            email: 'admin-litige@bca.gn',
            telephone: '622000001',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'admin',
            est_approuve: true,
        });
        adminToken = (await request(app).post('/api/auth/login').send({
            email: admin.email,
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const vendor = await User.create({
            nom_complet: 'Vendor Litige',
            email: 'vendor-litige@bca.gn',
            telephone: '622000002',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        vendorId = vendor.id;
        await Wallet.create({ user_id: vendorId, solde_virtuel: 0, solde_sequestre: 0 });

        const store = await Store.create({
            proprietaire_id: vendorId,
            nom_boutique: 'Shop Litige',
            slug: 'shop-litige',
            statut: 'actif',
        });

        const category = await Category.create({ nom_categorie: 'Litige', slug: 'litige' });
        const product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Article Litige',
            prix_unitaire: 75000,
            stock_quantite: 5,
        });

        await request(app).post('/api/auth/register').send({
            nom_complet: 'Buyer Litige',
            email: 'buyer-litige@bca.gn',
            telephone: '622000003',
            mot_de_passe: 'SecurePass123!',
            role: 'client',
        });

        const buyerLogin = await request(app).post('/api/auth/login').send({
            email: 'buyer-litige@bca.gn',
            mot_de_passe: 'SecurePass123!',
        });
        buyerToken = buyerLogin.body.accessToken;
        const buyerId = buyerLogin.body.user?.id;

        await Wallet.update({ solde_virtuel: 300000 }, { where: { user_id: buyerId } });

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                items: [{ productId: product.id, quantity: 1 }],
                paymentMethod: 'wallet',
                deliveryInfo: { nom: 'Buyer', telephone: '622000003', adresse: 'Kaloum, Conakry' },
            });

        orderId = orderRes.body.id;

        const disputeRes = await request(app)
            .post('/api/disputes')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                commande_id: orderId,
                type: 'qualite',
                description: 'Produit endommagé à la réception, emballage ouvert.',
                defenseur_id: vendorId,
            });

        expect(disputeRes.status).toBe(201);
        disputeId = disputeRes.body.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('doit créer un litige avec statut ouvert', async () => {
        const litige = await Litige.findByPk(disputeId);
        expect(litige.statut).toBe('ouvert');
        expect(litige.solution_proposee_ia).toBeTruthy();
    });

    it('doit passer en médiation (admin)', async () => {
        const res = await request(app)
            .put(`/api/disputes/${disputeId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ statut: 'en_mediation' });

        expect(res.status).toBe(200);
        expect(res.body.statut).toBe('en_mediation');
    });

    it('doit rejeter un litige sur commande d\'un autre client (IDOR)', async () => {
        const intruder = await User.create({
            nom_complet: 'Intrus Litige',
            email: 'intrus-litige@bca.gn',
            telephone: '622000099',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'client',
            est_approuve: true,
        });
        await Wallet.create({ user_id: intruder.id, solde_virtuel: 0, solde_sequestre: 0 });

        const intruderToken = (await request(app).post('/api/auth/login').send({
            email: intruder.email,
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const res = await request(app)
            .post('/api/disputes')
            .set('Authorization', `Bearer ${intruderToken}`)
            .send({
                commande_id: orderId,
                type: 'qualite',
                description: 'Tentative IDOR sur commande tierce.',
                defenseur_id: vendorId,
            });

        expect(res.status).toBe(403);
    });

    it('doit rejeter un défenseur non lié à la commande', async () => {
        const stranger = await User.create({
            nom_complet: 'Stranger Vendor',
            email: 'stranger-litige@bca.gn',
            telephone: '622000098',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });

        const product = await Product.findOne({ where: { nom_produit: 'Article Litige' } });
        const order2Res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                items: [{ productId: product.id, quantity: 1 }],
                paymentMethod: 'wallet',
                deliveryInfo: { nom: 'Buyer', telephone: '622000003', adresse: 'Kaloum, Conakry' },
            });

        const res = await request(app)
            .post('/api/disputes')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                commande_id: order2Res.body.id,
                type: 'qualite',
                description: 'Défenseur invalide pour cette commande.',
                defenseur_id: stranger.id,
            });

        expect(res.status).toBe(403);
    });

    it('doit rembourser automatiquement lors d\'une résolution intégrale', async () => {
        const orderBefore = await Order.findByPk(orderId);
        const buyerWalletBefore = await Wallet.findOne({
            where: { user_id: orderBefore.utilisateur_id }
        });
        const balanceBefore = parseFloat(buyerWalletBefore.solde_virtuel);

        const res = await request(app)
            .put(`/api/disputes/${disputeId}/resolve`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                decision_finale: 'Remboursement intégral accordé au client.',
                resolution_type: 'remboursement_integral',
                statut: 'resolu',
            });

        expect(res.status).toBe(200);
        expect(res.body.financial.refundAmount).toBeGreaterThan(0);

        const buyerWalletAfter = await Wallet.findOne({
            where: { user_id: orderBefore.utilisateur_id }
        });
        expect(parseFloat(buyerWalletAfter.solde_virtuel)).toBeGreaterThan(balanceBefore);
    });
});
