const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, sequelize } = require('../src/models');

describe('🏭 Stock partenaire / entrepôt tiers (cahier des charges 2.5)', () => {
    let vendorToken;
    let otherVendorToken;
    let productId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Partner Stock',
            email: 'vendor-partnerstock@bca.gn',
            telephone: '611000020',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        vendorToken = (await request(app).post('/api/auth/login').send({
            email: 'vendor-partnerstock@bca.gn',
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const otherVendor = await User.create({
            nom_complet: 'Autre Vendeur',
            email: 'vendor-other-ps@bca.gn',
            telephone: '611000021',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        otherVendorToken = (await request(app).post('/api/auth/login').send({
            email: 'vendor-other-ps@bca.gn',
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const store = await Store.create({
            proprietaire_id: vendor.id,
            nom_boutique: 'Boutique Partner Stock',
            slug: 'boutique-partner-stock',
            statut: 'actif',
        });

        const category = await Category.create({ nom_categorie: 'Test Partner Stock' });

        const product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Carrelage 60x60',
            prix_unitaire: 25000,
            stock_quantite: 100,
        });
        productId = product.id;
    });

    it('crée une entrée de stock partenaire pour son propre produit', async () => {
        const res = await request(app)
            .post(`/api/partner-stock/product/${productId}`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({
                partenaire_nom: 'Entrepôt Conakry Sud',
                type_stock: 'entrepot_tiers',
                quantite: 40,
                localisation: 'Conakry, Matoto',
            });

        expect(res.status).toBe(201);
        expect(res.body.partenaire_nom).toBe('Entrepôt Conakry Sud');
        expect(res.body.quantite).toBe(40);
    });

    it('refuse la création pour un produit qui ne nous appartient pas', async () => {
        const res = await request(app)
            .post(`/api/partner-stock/product/${productId}`)
            .set('Authorization', `Bearer ${otherVendorToken}`)
            .send({ partenaire_nom: 'Intrus', quantite: 10 });

        expect(res.status).toBe(403);
    });

    it('consolide le stock propre + tous les partenaires', async () => {
        await request(app)
            .post(`/api/partner-stock/product/${productId}`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ partenaire_nom: 'Dropship Kankan', type_stock: 'dropshipping', quantite: 15 });

        const res = await request(app)
            .get(`/api/partner-stock/product/${productId}/total`)
            .set('Authorization', `Bearer ${vendorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.stock_propre).toBe(100);
        // 40 (Entrepôt Conakry Sud) + 15 (Dropship Kankan)
        expect(res.body.stock_partenaires).toBe(55);
        expect(res.body.stock_total).toBe(155);
        expect(res.body.detail.length).toBe(2);
    });

    it('rejette une quantité négative', async () => {
        const res = await request(app)
            .post(`/api/partner-stock/product/${productId}`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ partenaire_nom: 'Invalide', quantite: -5 });

        // 422 = convention du middleware validateRequest (express-validator)
        expect(res.status).toBe(422);
    });
});
