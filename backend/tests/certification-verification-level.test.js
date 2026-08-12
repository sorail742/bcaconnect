const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, sequelize } = require('../src/models');

describe('🏅 Vérification fournisseur à plusieurs niveaux (analyse concurrentielle #5)', () => {
    let adminToken;
    let vendorToken;
    let vendorId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const admin = await User.create({
            nom_complet: 'Admin Verif',
            email: 'admin-verif@bca.gn',
            telephone: '611000040',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'admin',
            est_approuve: true,
        });
        adminToken = (await request(app).post('/api/auth/login').send({
            email: 'admin-verif@bca.gn', mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        const vendor = await User.create({
            nom_complet: 'Vendor Verif',
            email: 'vendor-verif@bca.gn',
            telephone: '611000041',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        vendorId = vendor.id;
        vendorToken = (await request(app).post('/api/auth/login').send({
            email: 'vendor-verif@bca.gn', mot_de_passe: 'SecurePass123!',
        })).body.accessToken;

        await Store.create({
            proprietaire_id: vendorId,
            nom_boutique: 'Boutique Verif',
            slug: 'boutique-verif',
            statut: 'actif',
        });
    });

    const submitAndValidate = async (type) => {
        const createRes = await request(app)
            .post('/api/certifications')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ type, document_url: `https://example.com/${type}.pdf` });

        return request(app)
            .put(`/api/certifications/${createRes.body.id}/review`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ statut: 'validee' });
    };

    it('reste non_verifie sans certification validée', async () => {
        const res = await request(app).get(`/api/certifications/vendor/${vendorId}/status`);
        expect(res.body.niveau_verification).toBe('non_verifie');
    });

    it('passe à "verifie" après une première certification validée', async () => {
        const reviewRes = await submitAndValidate('Registre de commerce');
        expect(reviewRes.status).toBe(200);
        expect(reviewRes.body.niveau_verification).toBe('verifie');

        const statusRes = await request(app).get(`/api/certifications/vendor/${vendorId}/status`);
        expect(statusRes.body.niveau_verification).toBe('verifie');
    });

    it('passe à "verifie_or" après 3 types distincts de certifications validées', async () => {
        await submitAndValidate('Certification qualité');
        const lastReview = await submitAndValidate('Attestation fiscale');

        expect(lastReview.body.niveau_verification).toBe('verifie_or');

        const statusRes = await request(app).get(`/api/certifications/vendor/${vendorId}/status`);
        expect(statusRes.body.niveau_verification).toBe('verifie_or');
        expect(statusRes.body.count).toBe(3);
    });

    it("ne compte pas deux fois le même type pour atteindre verifie_or", async () => {
        await submitAndValidate('Registre de commerce'); // même type que le tout premier, déjà compté

        const statusRes = await request(app).get(`/api/certifications/vendor/${vendorId}/status`);
        // Toujours 3 types distincts (Registre de commerce, Certification qualité, Attestation fiscale)
        expect(statusRes.body.niveau_verification).toBe('verifie_or');
    });
});
