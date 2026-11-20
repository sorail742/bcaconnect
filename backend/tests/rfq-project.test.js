const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, sequelize } = require('../src/models');

describe("📐 Appel d'offres projet multi-lignes (analyse concurrentielle #10)", () => {
    let clientToken, vendorAToken, vendorBToken;
    let clientId;
    let demandeId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const makeUser = async (suffix, role) => {
            await User.create({
                nom_complet: `User ${suffix}`,
                email: `rfqp-${suffix}@bca.gn`,
                telephone: `61100007${suffix}`,
                mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
                role,
                est_approuve: true,
            });
            return (await request(app).post('/api/auth/login').send({
                email: `rfqp-${suffix}@bca.gn`, mot_de_passe: 'SecurePass123!',
            })).body.accessToken;
        };

        clientToken = await makeUser(0, 'client');
        vendorAToken = await makeUser(1, 'fournisseur');
        vendorBToken = await makeUser(2, 'fournisseur');

        const clientRes = await request(app).post('/api/auth/login').send({ email: 'rfqp-0@bca.gn', mot_de_passe: 'SecurePass123!' });
        clientId = clientRes.body.user?.id;
    });

    it('publie un appel d\'offres projet avec plusieurs lignes', async () => {
        const res = await request(app)
            .post('/api/rfq/project')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                titre: 'Rénovation entrepôt Matoto',
                description: 'Fourniture matériaux gros œuvre',
                ville_livraison: 'Conakry',
                lignes: [
                    { description: 'Ciment CEM II 50kg', quantite: 200, unite: 'sacs' },
                    { description: 'Fer à béton 12mm', quantite: 500, unite: 'barres' },
                    { description: 'Sable de rivière', quantite: 30, unite: 'm3' },
                ],
            });

        expect(res.status).toBe(201);
        expect(res.body.demande.type_demande).toBe('projet');
        demandeId = res.body.demande.id;
    });

    it('rejette un appel d\'offres sans lignes', async () => {
        const res = await request(app)
            .post('/api/rfq/project')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ titre: 'Vide', description: 'Sans lignes', lignes: [] });
        expect(res.status).toBe(400);
    });

    let lineIds;

    it('deux fournisseurs soumettent des offres comparables', async () => {
        const detailRes = await request(app).get(`/api/rfq/${demandeId}`).set('Authorization', `Bearer ${clientToken}`);
        lineIds = detailRes.body.lignes.map((l) => l.id);
        expect(lineIds.length).toBe(3);

        // Fournisseur A : offre complète, moins chère.
        const quoteA = await request(app)
            .post(`/api/rfq/${demandeId}/project-quotes`)
            .set('Authorization', `Bearer ${vendorAToken}`)
            .send({
                delai_livraison_jours: 5,
                lignes: [
                    { ligne_id: lineIds[0], prix_unitaire: 90000, quantite_proposee: 200 },
                    { ligne_id: lineIds[1], prix_unitaire: 15000, quantite_proposee: 500 },
                    { ligne_id: lineIds[2], prix_unitaire: 120000, quantite_proposee: 30 },
                ],
            });
        expect(quoteA.status).toBe(201);
        // 200*90000 + 500*15000 + 30*120000 = 18M + 7.5M + 3.6M = 29.1M
        expect(parseFloat(quoteA.body.quote.montant_total)).toBe(29100000);

        // Fournisseur B : ne peut pas fournir le sable, plus cher sur le reste.
        const quoteB = await request(app)
            .post(`/api/rfq/${demandeId}/project-quotes`)
            .set('Authorization', `Bearer ${vendorBToken}`)
            .send({
                delai_livraison_jours: 3,
                lignes: [
                    { ligne_id: lineIds[0], prix_unitaire: 95000, quantite_proposee: 200 },
                    { ligne_id: lineIds[1], prix_unitaire: 16000, quantite_proposee: 500 },
                    { ligne_id: lineIds[2], disponible: false },
                ],
            });
        expect(quoteB.status).toBe(201);
        // 200*95000 + 500*16000 = 19M + 8M = 27M (sable non compté, indisponible)
        expect(parseFloat(quoteB.body.quote.montant_total)).toBe(27000000);
    });

    it('le client compare les offres, triées par montant total croissant', async () => {
        const res = await request(app)
            .get(`/api/rfq/${demandeId}/comparison`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(res.status).toBe(200);
        expect(res.body.devis.length).toBe(2);
        // B (27M) moins cher que A (29.1M) doit arriver en premier.
        expect(parseFloat(res.body.devis[0].montant_total)).toBe(27000000);
        expect(res.body.devis[0].lignes.length).toBe(3);
    });

    it('un fournisseur ne peut pas voir la comparaison complète (pas propriétaire)', async () => {
        const res = await request(app)
            .get(`/api/rfq/${demandeId}/comparison`)
            .set('Authorization', `Bearer ${vendorAToken}`);
        expect(res.status).toBe(403);
    });
});
