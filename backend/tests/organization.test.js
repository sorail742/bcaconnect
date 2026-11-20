const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Wallet, Store, Product, Category, sequelize } = require('../src/models');

describe('🏢 Comptes entreprise multi-utilisateurs + approbation (analyse concurrentielle #2)', () => {
    let ownerToken, buyerToken, validatorToken;
    let ownerId, buyerId, validatorId;
    let organizationId;
    let productId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const makeUser = async (suffix, role = 'client') => {
            const u = await User.create({
                nom_complet: `User ${suffix}`,
                email: `org-${suffix}@bca.gn`,
                telephone: `61100006${suffix}`,
                mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
                role,
                est_approuve: true,
            });
            await Wallet.create({ user_id: u.id, solde_virtuel: 10_000_000, solde_sequestre: 0 });
            const token = (await request(app).post('/api/auth/login').send({
                email: `org-${suffix}@bca.gn`, mot_de_passe: 'SecurePass123!',
            })).body.accessToken;
            return { id: u.id, token };
        };

        const owner = await makeUser(0);
        ownerId = owner.id; ownerToken = owner.token;

        const buyer = await makeUser(1);
        buyerId = buyer.id; buyerToken = buyer.token;

        const validator = await makeUser(2);
        validatorId = validator.id; validatorToken = validator.token;

        // Vendeur + produit pour passer de vraies commandes.
        const vendor = await User.create({
            nom_complet: 'Vendor Org',
            email: 'vendor-org@bca.gn',
            telephone: '611000069',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        const store = await Store.create({ proprietaire_id: vendor.id, nom_boutique: 'Boutique Org', slug: 'boutique-org', statut: 'actif' });
        const category = await Category.create({ nom_categorie: 'Org Cat' });
        const product = await Product.create({
            boutique_id: store.id, categorie_id: category.id,
            nom_produit: 'Ciment Org', prix_unitaire: 100000, stock_quantite: 1000,
        });
        productId = product.id;
    });

    it("crée une organisation avec un plafond d'approbation à 200000 GNF", async () => {
        const res = await request(app)
            .post('/api/organizations')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ nom: 'BCA Chantier SARL', plafond_approbation_auto: 200000 });

        expect(res.status).toBe(201);
        organizationId = res.body.id;
    });

    it('invite un acheteur et un valideur', async () => {
        const r1 = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ email: 'org-1@bca.gn', role_membre: 'acheteur' });
        expect(r1.status).toBe(201);

        const r2 = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ email: 'org-2@bca.gn', role_membre: 'valideur' });
        expect(r2.status).toBe(201);
    });

    it("rejette l'invitation d'un email sans compte BCA", async () => {
        const res = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ email: 'inconnu@nulle-part.gn', role_membre: 'acheteur' });
        expect(res.status).toBe(404);
    });

    it("crée la commande immédiatement si le montant est sous le plafond", async () => {
        const res = await request(app)
            .post(`/api/organizations/${organizationId}/order-requests`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                items: [{ id: productId, quantity: 1 }],
                deliveryInfo: { nom: 'Chantier A', telephone: '611111111', adresse: 'Conakry' },
                paymentMethod: 'wallet',
                type_livraison: 'standard',
            });

        expect(res.status).toBe(201);
        expect(res.body.statut).toBe('approuvee_automatiquement');
        expect(res.body.order.order).toBeDefined();
    });

    let pendingRequestId;

    it('met en attente une commande au-delà du plafond (acheteur)', async () => {
        const res = await request(app)
            .post(`/api/organizations/${organizationId}/order-requests`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                items: [{ id: productId, quantity: 3 }], // 300000 GNF > plafond 200000
                deliveryInfo: { nom: 'Chantier A', telephone: '611111111', adresse: 'Conakry' },
                paymentMethod: 'wallet',
                type_livraison: 'standard',
            });

        expect(res.status).toBe(201);
        expect(res.body.statut).toBe('en_attente');
        expect(parseFloat(res.body.request.montant_estime)).toBe(300000);
        pendingRequestId = res.body.request.id;
    });

    it("n'autorise pas l'acheteur lui-même à approuver sa propre demande", async () => {
        const res = await request(app)
            .put(`/api/organizations/order-requests/${pendingRequestId}/approve`)
            .set('Authorization', `Bearer ${buyerToken}`);
        expect(res.status).toBe(403);
    });

    it('un valideur peut approuver — la commande est alors réellement créée', async () => {
        const res = await request(app)
            .put(`/api/organizations/order-requests/${pendingRequestId}/approve`)
            .set('Authorization', `Bearer ${validatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.statut).toBe('approuvee');
        expect(res.body.commande_id).not.toBeNull();
    });

    it("liste les membres de l'organisation", async () => {
        const res = await request(app)
            .get(`/api/organizations/${organizationId}/members`)
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3); // owner (admin) + acheteur + valideur
    });

    it('un valideur peut créer une commande au-delà du plafond sans approbation', async () => {
        const res = await request(app)
            .post(`/api/organizations/${organizationId}/order-requests`)
            .set('Authorization', `Bearer ${validatorToken}`)
            .send({
                items: [{ id: productId, quantity: 5 }], // 500000 GNF, mais rôle valideur
                deliveryInfo: { nom: 'Chantier B', telephone: '611111112', adresse: 'Conakry' },
                paymentMethod: 'wallet',
                type_livraison: 'standard',
            });

        expect(res.status).toBe(201);
        expect(res.body.statut).toBe('approuvee_automatiquement');
    });
});
