const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Order, OrderItem, Wallet, Invoice, sequelize } = require('../src/models');

describe('🧾 Facturation électronique conforme CGI Guinée (analyse concurrentielle #3)', () => {
    let vendor1Token, vendor2Token, clientToken, strangerToken;
    let vendor1Id, vendor2Id, clientId;
    let store1, store2, category, product1, product2;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        app.set('socketio', { to: () => ({ emit: () => {} }), emit: () => {} });

        const makeUser = async (email, role) => {
            const u = await User.create({
                nom_complet: `Invoice ${role}`, email, telephone: `61120${Math.floor(1000 + Math.random() * 8999)}`,
                mot_de_passe: await bcrypt.hash('SecurePass123!', 10), role, est_approuve: true,
            });
            const token = (await request(app).post('/api/auth/login').send({ email, mot_de_passe: 'SecurePass123!' })).body.accessToken;
            return { user: u, token };
        };

        const v1 = await makeUser('vendor1-invoice@bca.gn', 'fournisseur');
        const v2 = await makeUser('vendor2-invoice@bca.gn', 'fournisseur');
        const c = await makeUser('client-invoice@bca.gn', 'client');
        const stranger = await makeUser('stranger-invoice@bca.gn', 'client');

        vendor1Id = v1.user.id; vendor1Token = v1.token;
        vendor2Id = v2.user.id; vendor2Token = v2.token;
        clientId = c.user.id; clientToken = c.token;
        strangerToken = stranger.token;

        store1 = await Store.create({ proprietaire_id: vendor1Id, nom_boutique: 'Boutique 1', slug: 'boutique-invoice-1', statut: 'actif', nif: 'NIF-001', rccm: 'RCCM-GN-001' });
        store2 = await Store.create({ proprietaire_id: vendor2Id, nom_boutique: 'Boutique 2', slug: 'boutique-invoice-2', statut: 'actif' });
        category = await Category.create({ nom_categorie: 'Test Invoice' });

        product1 = await Product.create({ boutique_id: store1.id, categorie_id: category.id, nom_produit: 'Produit V1', prix_unitaire: 118000, stock_quantite: 100 });
        product2 = await Product.create({ boutique_id: store2.id, categorie_id: category.id, nom_produit: 'Produit V2', prix_unitaire: 59000, stock_quantite: 100 });

        await Wallet.create({ user_id: clientId, solde_virtuel: 10000000, solde_sequestre: 0 });
        await Wallet.create({ user_id: vendor1Id, solde_virtuel: 0, solde_sequestre: 0 });
        await Wallet.create({ user_id: vendor2Id, solde_virtuel: 0, solde_sequestre: 0 });
    });

    let singleVendorOrderId, multiVendorOrderId;

    it('calcule correctement HT/TVA/TTC à partir du prix TTC affiché (118 000 GNF)', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                items: [{ productId: product1.id, quantity: 1 }],
                deliveryInfo: { nom: 'Client Invoice', telephone: '611200001', adresse: 'Conakry' },
                paymentMethod: 'wallet',
            });
        expect(res.status).toBe(201);
        singleVendorOrderId = res.body.id;

        const invRes = await request(app)
            .post(`/api/invoices/from-order/${singleVendorOrderId}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({});
        expect(invRes.status).toBe(201);
        expect(invRes.body.length).toBe(1);

        const inv = invRes.body[0];
        expect(Number(inv.montant_ttc)).toBe(118000);
        expect(Number(inv.montant_ht)).toBe(100000);
        expect(Number(inv.montant_tva)).toBe(18000);
        expect(Number(inv.taux_tva)).toBe(18);
        expect(inv.numero).toMatch(/^FAC-\d{8}$/);
    });

    it('est idempotente : un second appel renvoie la même facture, même numéro', async () => {
        const res1 = await request(app).post(`/api/invoices/from-order/${singleVendorOrderId}`).set('Authorization', `Bearer ${clientToken}`).send({});
        const res2 = await request(app).post(`/api/invoices/from-order/${singleVendorOrderId}`).set('Authorization', `Bearer ${clientToken}`).send({});
        expect(res1.body[0].numero).toBe(res2.body[0].numero);

        const count = await Invoice.count({ where: { commande_id: singleVendorOrderId } });
        expect(count).toBe(1);
    });

    it('émet une facture distincte par vendeur pour une commande multi-vendeurs', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                items: [{ productId: product1.id, quantity: 1 }, { productId: product2.id, quantity: 1 }],
                deliveryInfo: { nom: 'Client Invoice', telephone: '611200001', adresse: 'Conakry, Ratoma' },
                paymentMethod: 'wallet',
            });
        expect(res.status).toBe(201);
        multiVendorOrderId = res.body.id;

        const invRes = await request(app)
            .post(`/api/invoices/from-order/${multiVendorOrderId}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ acheteur_nif: 'NIF-CLIENT-999' });
        expect(invRes.status).toBe(201);
        expect(invRes.body.length).toBe(2);

        const boutiqueIds = invRes.body.map((i) => i.boutique_id).sort();
        expect(boutiqueIds).toEqual([store1.id, store2.id].sort());

        const invForStore2 = invRes.body.find((i) => i.boutique_id === store2.id);
        expect(Number(invForStore2.montant_ttc)).toBe(59000);
        expect(invForStore2.acheteur_nif).toBe('NIF-CLIENT-999');

        // Chaque vendeur ne voit que sa propre facture dans son propre historique.
        const v1List = await request(app).get('/api/invoices/vendor-mine').set('Authorization', `Bearer ${vendor1Token}`);
        expect(v1List.body.some((i) => i.boutique_id === store1.id)).toBe(true);
        expect(v1List.body.some((i) => i.boutique_id === store2.id)).toBe(false);
    });

    it('numérote les factures séquentiellement sans trou à travers les commandes', async () => {
        const all = await Invoice.findAll({ order: [['numero', 'ASC']] });
        const numbers = all.map((i) => parseInt(i.numero.replace('FAC-', ''), 10)).sort((a, b) => a - b);
        for (let i = 1; i < numbers.length; i++) {
            expect(numbers[i]).toBe(numbers[i - 1] + 1);
        }
    });

    it('refuse l\'accès à un tiers non impliqué dans la commande', async () => {
        const res = await request(app)
            .post(`/api/invoices/from-order/${singleVendorOrderId}`)
            .set('Authorization', `Bearer ${strangerToken}`)
            .send({});
        expect(res.status).toBe(403);
    });

    it('le vendeur peut accéder à sa propre facture par ID', async () => {
        const invoice = await Invoice.findOne({ where: { commande_id: singleVendorOrderId, boutique_id: store1.id } });
        const res = await request(app).get(`/api/invoices/${invoice.id}`).set('Authorization', `Bearer ${vendor1Token}`);
        expect(res.status).toBe(200);
        expect(res.body.boutique.nif).toBe('NIF-001');
        expect(res.body.lignes.length).toBe(1);
        expect(res.body.lignes[0].designation).toBe('Produit V1');
        expect(res.body.lignes[0].montant_ttc).toBe(118000);
    });
});
