const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Order, OrderItem, Review, Litige, sequelize } = require('../src/models');

describe('📋 Scorecard fournisseur (analyse concurrentielle #6)', () => {
    let vendorId;
    let buyerId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Scorecard',
            email: 'vendor-scorecard@bca.gn',
            telephone: '611000050',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });
        vendorId = vendor.id;

        const buyer = await User.create({
            nom_complet: 'Buyer Scorecard',
            email: 'buyer-scorecard@bca.gn',
            telephone: '611000051',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'client',
        });
        buyerId = buyer.id;

        const store = await Store.create({
            proprietaire_id: vendorId,
            nom_boutique: 'Boutique Scorecard',
            slug: 'boutique-scorecard',
            statut: 'actif',
            temps_reponse: 30,
        });

        const category = await Category.create({ nom_categorie: 'Scorecard Cat' });
        const product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Produit Scorecard',
            prix_unitaire: 10000,
            stock_quantite: 500,
        });

        // 4 commandes complétées, 1 litige sur l'une d'entre elles, 2 avis 5 étoiles.
        for (let i = 0; i < 4; i++) {
            const order = await Order.create({
                utilisateur_id: buyerId,
                statut: 'livré',
                total_ttc: 10000,
                methode_paiement: 'wallet',
                cle_idempotence: `SC-${i}-${Math.random()}`,
            });
            await OrderItem.create({
                commande_id: order.id,
                produit_id: product.id,
                fournisseur_id: vendorId,
                quantite: 1,
                prix_unitaire_achat: 10000,
                statut: 'livré',
            });
            if (i === 0) {
                await Litige.create({
                    commande_id: order.id,
                    demandeur_id: buyerId,
                    defenseur_id: vendorId,
                    description: 'Produit non conforme',
                    statut: 'resolu',
                });
            }
        }

        await Review.create({ utilisateur_id: buyerId, produit_id: product.id, note: 5, commentaire: 'Top qualité, largement suffisant.' });
        await Review.create({ utilisateur_id: buyerId, produit_id: product.id, note: 5, commentaire: 'Rapide et fiable, je recommande.' });
    });

    it('calcule le scorecard avec le détail des 5 sous-scores', async () => {
        const res = await request(app).get(`/api/vendor-scorecard/${vendorId}`);

        expect(res.status).toBe(200);
        expect(res.body.fournisseur.nom).toBe('Vendor Scorecard');
        expect(res.body.details.volume.valeur).toBe(4);
        expect(res.body.details.litiges.valeur).toBe(25); // 1/4 commandes en litige = 25%
        expect(res.body.details.avis.valeur).toBe(5);
        expect(res.body.details.avis.echantillon).toBe(2);
        expect(res.body.score_total).toBeGreaterThan(0);
        expect(res.body.score_total).toBeLessThanOrEqual(100);
        expect(['excellent', 'fiable', 'a_surveiller']).toContain(res.body.niveau);
    });

    it('renvoie donnees_insuffisantes pour un fournisseur sans historique', async () => {
        const freshVendor = await User.create({
            nom_complet: 'Vendor Neuf',
            email: 'vendor-neuf@bca.gn',
            telephone: '611000052',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
        });

        const res = await request(app).get(`/api/vendor-scorecard/${freshVendor.id}`);
        expect(res.status).toBe(200);
        expect(res.body.niveau).toBe('donnees_insuffisantes');
        expect(res.body.details.volume.valeur).toBe(0);
    });

    it('renvoie 404 pour un utilisateur qui n\'est pas fournisseur', async () => {
        const res = await request(app).get(`/api/vendor-scorecard/${buyerId}`);
        expect(res.status).toBe(404);
    });
});
