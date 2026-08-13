const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Order, OrderItem, IoTTrackingLog, Notification, sequelize } = require('../src/models');

describe('📡 Connecteur IoT réel (cahier des charges 3.15)', () => {
    let vendorToken, otherVendorToken, clientToken, carrierToken, strangerToken;
    let vendorId, clientId, carrierId;
    let orderId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const makeUser = async (email, role) => {
            const u = await User.create({
                nom_complet: `IoT ${role}`,
                email,
                telephone: `61100${Math.floor(1000 + Math.random() * 8999)}`,
                mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
                role,
                est_approuve: true,
            });
            const token = (await request(app).post('/api/auth/login').send({ email, mot_de_passe: 'SecurePass123!' })).body.accessToken;
            return { user: u, token };
        };

        const vendor = await makeUser('vendor-iot@bca.gn', 'fournisseur');
        const otherVendor = await makeUser('vendor-iot-other@bca.gn', 'fournisseur');
        const client = await makeUser('client-iot@bca.gn', 'client');
        const carrier = await makeUser('carrier-iot@bca.gn', 'transporteur');
        const stranger = await makeUser('stranger-iot@bca.gn', 'client');

        vendorToken = vendor.token; vendorId = vendor.user.id;
        otherVendorToken = otherVendor.token;
        clientToken = client.token; clientId = client.user.id;
        carrierToken = carrier.token; carrierId = carrier.user.id;
        strangerToken = stranger.token;

        const store = await Store.create({ proprietaire_id: vendorId, nom_boutique: 'Boutique IoT', slug: 'boutique-iot', statut: 'actif' });
        const category = await Category.create({ nom_categorie: 'Test IoT' });
        const product = await Product.create({ boutique_id: store.id, categorie_id: category.id, nom_produit: 'Vaccins réfrigérés', prix_unitaire: 50000, stock_quantite: 20 });

        const order = await Order.create({
            utilisateur_id: clientId,
            transporteur_id: carrierId,
            statut: 'confirmé',
            total_ttc: 50000,
            methode_paiement: 'wallet',
            cle_idempotence: `IOT-${Date.now()}`,
        });
        await OrderItem.create({
            commande_id: order.id, produit_id: product.id, fournisseur_id: vendorId,
            quantite: 1, prix_unitaire_achat: 50000, statut: 'confirmé',
        });
        orderId = order.id;
    });

    let deviceKey;

    it("refuse l'activation par un vendeur non lié à la commande", async () => {
        const res = await request(app)
            .post(`/api/iot/devices/${orderId}/activate`)
            .set('Authorization', `Bearer ${otherVendorToken}`)
            .send({ temp_min: 2, temp_max: 8 });
        expect(res.status).toBe(403);
    });

    it('active le suivi IoT et retourne une clé en clair une seule fois', async () => {
        const res = await request(app)
            .post(`/api/iot/devices/${orderId}/activate`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ temp_min: 2, temp_max: 8 });

        expect(res.status).toBe(201);
        expect(res.body.device_key).toBeDefined();
        expect(res.body.device_key.length).toBeGreaterThan(20);
        deviceKey = res.body.device_key;

        const order = await Order.findByPk(orderId);
        expect(order.suivi_iot_actif).toBe(true);
        expect(order.iot_device_key_hash).not.toBe(deviceKey); // jamais stocké en clair
    });

    it('rejette une lecture capteur sans clé d\'appareil', async () => {
        const res = await request(app)
            .post('/api/iot/sensor-data')
            .send({ commande_id: orderId, temperature: 5 });
        expect(res.status).toBe(401);
    });

    it('rejette une lecture capteur avec une clé invalide', async () => {
        const res = await request(app)
            .post('/api/iot/sensor-data')
            .set('X-Device-Key', 'clé-inventée-par-un-attaquant')
            .send({ commande_id: orderId, temperature: 5 });
        expect(res.status).toBe(401);
    });

    it('accepte une lecture capteur avec la clé valide, dans la plage normale', async () => {
        const res = await request(app)
            .post('/api/iot/sensor-data')
            .set('X-Device-Key', deviceKey)
            .send({ commande_id: orderId, temperature: 5, humidite: 60, latitude: 9.5, longitude: -13.6 });

        expect(res.status).toBe(201);
        expect(res.body.log.hors_seuil).toBe(false);
    });

    it('déclenche une alerte "hors seuil" une seule fois lors du franchissement', async () => {
        const res1 = await request(app)
            .post('/api/iot/sensor-data')
            .set('X-Device-Key', deviceKey)
            .send({ commande_id: orderId, temperature: 15 }); // > temp_max=8
        expect(res1.status).toBe(201);
        expect(res1.body.log.hors_seuil).toBe(true);

        const res2 = await request(app)
            .post('/api/iot/sensor-data')
            .set('X-Device-Key', deviceKey)
            .send({ commande_id: orderId, temperature: 16 }); // reste hors seuil
        expect(res2.status).toBe(201);
        expect(res2.body.log.hors_seuil).toBe(true);

        const notifs = await Notification.findAll({ where: { utilisateur_id: clientId, type: 'delivery' } });
        expect(notifs.length).toBe(1); // pas de doublon sur la 2e lecture hors seuil
    });

    it('liste les relevés pour le client, le transporteur, le vendeur et l\'admin, refuse pour un tiers', async () => {
        for (const token of [clientToken, carrierToken, vendorToken]) {
            const res = await request(app).get(`/api/iot/orders/${orderId}/tracking`).set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.logs.length).toBe(3);
        }

        const denied = await request(app).get(`/api/iot/orders/${orderId}/tracking`).set('Authorization', `Bearer ${strangerToken}`);
        expect(denied.status).toBe(403);
    });

    it('désactive le suivi IoT — les anciennes clés ne fonctionnent plus', async () => {
        const off = await request(app).post(`/api/iot/devices/${orderId}/deactivate`).set('Authorization', `Bearer ${vendorToken}`);
        expect(off.status).toBe(200);

        const res = await request(app)
            .post('/api/iot/sensor-data')
            .set('X-Device-Key', deviceKey)
            .send({ commande_id: orderId, temperature: 5 });
        expect(res.status).toBe(401);
    });
});
