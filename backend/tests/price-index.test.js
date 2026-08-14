const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User, Store, Product, Category, Order, OrderItem, sequelize } = require('../src/models');

describe('📈 Indice de prix des matériaux (analyse concurrentielle #8)', () => {
    let categoryId;
    let productId;
    let buyerId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const vendor = await User.create({
            nom_complet: 'Vendor Price Index',
            email: 'vendor-priceindex@bca.gn',
            telephone: '611000030',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'fournisseur',
            est_approuve: true,
        });

        const buyer = await User.create({
            nom_complet: 'Buyer Price Index',
            email: 'buyer-priceindex@bca.gn',
            telephone: '611000031',
            mot_de_passe: await bcrypt.hash('SecurePass123!', 10),
            role: 'client',
        });
        buyerId = buyer.id;

        const store = await Store.create({
            proprietaire_id: vendor.id,
            nom_boutique: 'Boutique Price Index',
            slug: 'boutique-price-index',
            statut: 'actif',
        });

        const category = await Category.create({ nom_categorie: 'Ciment' });
        categoryId = category.id;

        const product = await Product.create({
            boutique_id: store.id,
            categorie_id: category.id,
            nom_produit: 'Ciment CEM II 50kg',
            prix_unitaire: 90000,
            stock_quantite: 1000,
        });
        productId = product.id;

        // Deux commandes "confirmées" à des prix différents, sur 2 mois distincts,
        // + une commande annulée (doit être exclue de l'indice).
        const makeOrder = async (statut, monthsAgo, prix, quantite) => {
            const createdAt = new Date();
            createdAt.setMonth(createdAt.getMonth() - monthsAgo);
            const order = await Order.create({
                utilisateur_id: buyerId,
                statut,
                total_ttc: prix * quantite,
                methode_paiement: 'wallet',
                cle_idempotence: `PI-${statut}-${monthsAgo}-${Math.random()}`,
                createdAt,
                updatedAt: createdAt,
            });
            await OrderItem.create({
                commande_id: order.id,
                produit_id: productId,
                fournisseur_id: vendor.id,
                quantite,
                prix_unitaire_achat: prix,
                statut: 'confirmé',
                createdAt,
                updatedAt: createdAt,
            });
        };

        await makeOrder('payé', 0, 90000, 10);
        await makeOrder('payé', 1, 85000, 20);
        await makeOrder('annulé', 0, 50000, 100); // prix aberrant, doit être exclu
    });

    it("calcule l'indice de prix par catégorie en excluant les commandes annulées", async () => {
        const res = await request(app).get(`/api/price-index/category/${categoryId}?months=6`);

        expect(res.status).toBe(200);
        expect(res.body.categorie.nom).toBe('Ciment');
        expect(res.body.echantillon_total).toBe(2); // pas 3 : la commande annulée est exclue
        expect(res.body.points.length).toBe(2);

        const totalUnites = res.body.points.reduce((sum, p) => sum + p.volume_unites, 0);
        expect(totalUnites).toBe(30);
        // Aucun point ne doit refléter le prix aberrant de la commande annulée (50000)
        for (const point of res.body.points) {
            expect(point.prix_moyen).not.toBe(50000);
        }
    });

    it("calcule l'indice de prix par produit", async () => {
        const res = await request(app).get(`/api/price-index/product/${productId}`);

        expect(res.status).toBe(200);
        expect(res.body.produit.nom).toBe('Ciment CEM II 50kg');
        expect(res.body.echantillon_total).toBe(2);
    });

    it('renvoie 404 pour une catégorie inexistante', async () => {
        const res = await request(app).get('/api/price-index/category/00000000-0000-4000-8000-000000000000');
        expect(res.status).toBe(404);
    });
});
