const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Wallet, sequelize } = require('../src/models');

describe('📊 Export comptable SYSCOHADA (analyse concurrentielle #9)', () => {
    let vendor1Token, vendor2Token, clientToken, adminToken;
    let vendor1Id, vendor2Id, clientId;
    let store1, store2, category, product1, product2;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        app.set('socketio', { to: () => ({ emit: () => {} }), emit: () => {} });

        const makeUser = async (email, role) => {
            const u = await User.create({
                nom_complet: `Export ${role}`, email, telephone: `61130${Math.floor(1000 + Math.random() * 8999)}`,
                mot_de_passe: await bcrypt.hash('SecurePass123!', 10), role, est_approuve: true,
            });
            const token = (await request(app).post('/api/auth/login').send({ email, mot_de_passe: 'SecurePass123!' })).body.accessToken;
            return { user: u, token };
        };

        const v1 = await makeUser('vendor1-export@bca.gn', 'fournisseur');
        const v2 = await makeUser('vendor2-export@bca.gn', 'fournisseur');
        const c = await makeUser('client-export@bca.gn', 'client');
        const admin = await makeUser('admin-export@bca.gn', 'admin');

        vendor1Id = v1.user.id; vendor1Token = v1.token;
        vendor2Id = v2.user.id; vendor2Token = v2.token;
        clientId = c.user.id; clientToken = c.token;
        adminToken = admin.token;

        store1 = await Store.create({ proprietaire_id: vendor1Id, nom_boutique: 'Export Boutique 1', slug: 'export-boutique-1', statut: 'actif', nif: 'NIF-E1' });
        store2 = await Store.create({ proprietaire_id: vendor2Id, nom_boutique: 'Export Boutique 2', slug: 'export-boutique-2', statut: 'actif', nif: 'NIF-E2' });
        category = await Category.create({ nom_categorie: 'Test Export' });

        product1 = await Product.create({ boutique_id: store1.id, categorie_id: category.id, nom_produit: 'Produit Export 1', prix_unitaire: 118000, stock_quantite: 100 });
        product2 = await Product.create({ boutique_id: store2.id, categorie_id: category.id, nom_produit: 'Produit Export 2', prix_unitaire: 236000, stock_quantite: 100 });

        await Wallet.create({ user_id: clientId, solde_virtuel: 10000000, solde_sequestre: 0 });
        await Wallet.create({ user_id: vendor1Id, solde_virtuel: 0, solde_sequestre: 0 });
        await Wallet.create({ user_id: vendor2Id, solde_virtuel: 0, solde_sequestre: 0 });

        // Une commande + facture par vendeur, pour avoir des données à exporter.
        for (const product of [product1, product2]) {
            const orderRes = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    items: [{ productId: product.id, quantity: 1 }],
                    deliveryInfo: { nom: 'Client Export', telephone: '611300001', adresse: 'Conakry' },
                    paymentMethod: 'wallet',
                });
            await request(app).post(`/api/invoices/from-order/${orderRes.body.id}`).set('Authorization', `Bearer ${clientToken}`).send({});
        }
    });

    it('refuse l\'export à un client (réservé vendeurs/admin)', async () => {
        const res = await request(app).get('/api/invoices/export/syscohada').set('Authorization', `Bearer ${clientToken}`);
        expect(res.status).toBe(403);
    });

    it('un vendeur n\'exporte que ses propres écritures, en partie double équilibrée', async () => {
        const res = await request(app).get('/api/invoices/export/syscohada').set('Authorization', `Bearer ${vendor1Token}`);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/csv/);

        const csv = res.text.replace(/^﻿/, '');
        const lines = csv.trim().split('\r\n');
        expect(lines[0]).toContain('Compte');
        expect(csv).toContain('411000');
        expect(csv).toContain('701000');
        expect(csv).toContain('443000');
        expect(csv).not.toContain('Export Boutique 2');

        // Partie double : total débit == total crédit sur tout le journal exporté.
        const dataLines = lines.slice(1).filter(Boolean);
        let totalDebit = 0, totalCredit = 0;
        for (const line of dataLines) {
            const cols = line.split(';').map((c) => c.replace(/^"|"$/g, ''));
            totalDebit += parseFloat(cols[4].replace(',', '.'));
            totalCredit += parseFloat(cols[5].replace(',', '.'));
        }
        expect(Math.round(totalDebit * 100)).toBe(Math.round(totalCredit * 100));
        expect(totalDebit).toBeGreaterThan(0);
    });

    it('l\'admin exporte le journal complet, tous vendeurs confondus', async () => {
        const res = await request(app).get('/api/invoices/export/syscohada').set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        const csv = res.text.replace(/^﻿/, '');
        expect(csv).toContain('Export Boutique 1');
        expect(csv).toContain('Export Boutique 2');
    });

    it('filtre par période (debut/fin)', async () => {
        const future = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10);
        const res = await request(app)
            .get(`/api/invoices/export/syscohada?debut=${future}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        const csv = res.text.replace(/^﻿/, '');
        const lines = csv.trim().split('\r\n');
        expect(lines.length).toBe(1); // en-tête seulement, aucune facture dans le futur
    });
});
