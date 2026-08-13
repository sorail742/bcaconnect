const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, AlertThreshold, Notification, sequelize } = require('../src/models');
const alertThresholdService = require('../src/alert-threshold/service/alertThreshold.service');

describe('🔔 Seuils d\'alerte dynamiques (cahier des charges 3.6)', () => {
    let clientToken;
    let clientId;
    let productId;
    let product;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Alert Threshold',
            email: 'vendor-alertth@bca.gn',
            telephone: '611000030',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });

        const client = await User.create({
            nom_complet: 'Client Alert Threshold',
            email: 'client-alertth@bca.gn',
            telephone: '611000031',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'client',
            est_approuve: true,
        });
        clientId = client.id;
        clientToken = (await request(app).post('/api/auth/login').send({
            email: 'client-alertth@bca.gn',
            mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const store = await Store.create({
            proprietaire_id: vendor.id,
            nom_boutique: 'Boutique Alert Threshold',
            slug: 'boutique-alert-threshold',
            statut: 'actif',
        });

        const category = await Category.create({ nom_categorie: 'Test Alert Threshold' });

        product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Ciment CEM II 50kg',
            prix_unitaire: 90000,
            stock_quantite: 200,
        });
        productId = product.id;
    });

    it('crée un seuil de prix pour un produit', async () => {
        const res = await request(app)
            .post('/api/alert-thresholds')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ produit_id: productId, type: 'prix_produit', valeur_seuil: 85000 });

        expect(res.status).toBe(201);
        expect(res.body.type).toBe('prix_produit');
        expect(res.body.operateur).toBe('inferieur_egal');
        expect(Number(res.body.valeur_seuil)).toBe(85000);
        expect(res.body.actif).toBe(true);
    });

    it('rejette un type de seuil invalide', async () => {
        const res = await request(app)
            .post('/api/alert-thresholds')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ produit_id: productId, type: 'inconnu', valeur_seuil: 100 });

        expect(res.status).toBe(422);
    });

    it('met à jour le seuil existant plutôt que d\'en créer un doublon', async () => {
        const res = await request(app)
            .post('/api/alert-thresholds')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ produit_id: productId, type: 'prix_produit', valeur_seuil: 80000 });

        expect(res.status).toBe(201);
        expect(Number(res.body.valeur_seuil)).toBe(80000);

        const count = await AlertThreshold.count({ where: { utilisateur_id: clientId, produit_id: productId, type: 'prix_produit' } });
        expect(count).toBe(1);
    });

    it('liste mes seuils avec le produit associé', async () => {
        const res = await request(app)
            .get('/api/alert-thresholds/mine')
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].produit.nom_produit).toBe('Ciment CEM II 50kg');
    });

    it('déclenche une notification quand le prix passe sous le seuil', async () => {
        await product.update({ prix_unitaire: 79000 });

        const { evalues, declenches } = await alertThresholdService.evaluateAll(null);
        expect(evalues).toBe(1);
        expect(declenches).toBe(1);

        const notifs = await Notification.findAll({ where: { utilisateur_id: clientId } });
        expect(notifs.length).toBe(1);
        expect(notifs[0].titre).toMatch(/Alerte prix/);
    });

    it('respecte le cooldown et ne redéclenche pas immédiatement', async () => {
        const { declenches } = await alertThresholdService.evaluateAll(null);
        expect(declenches).toBe(0);

        const notifs = await Notification.findAll({ where: { utilisateur_id: clientId } });
        expect(notifs.length).toBe(1);
    });

    it('désactive un seuil', async () => {
        const seuil = await AlertThreshold.findOne({ where: { utilisateur_id: clientId, produit_id: productId } });
        const res = await request(app)
            .patch(`/api/alert-thresholds/${seuil.id}/toggle`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ actif: false });

        expect(res.status).toBe(200);
        expect(res.body.actif).toBe(false);
    });

    it('supprime un seuil', async () => {
        const seuil = await AlertThreshold.findOne({ where: { utilisateur_id: clientId, produit_id: productId } });
        const res = await request(app)
            .delete(`/api/alert-thresholds/${seuil.id}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.status).toBe(200);
        const remaining = await AlertThreshold.count({ where: { utilisateur_id: clientId } });
        expect(remaining).toBe(0);
    });
});
