const { PartnerStock, Product, Store } = require('../../models');
const AppError = require('../../utils/AppError');

const isUuid = (v) => typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

async function assertOwnsProduct(produitId, user) {
    if (!isUuid(produitId)) throw new AppError("Format d'identifiant produit invalide.", 400);

    const product = await Product.findByPk(produitId, {
        include: [{ model: Store, as: 'boutique' }],
    });
    if (!product) throw new AppError('Produit non trouvé.', 404);
    if (product.boutique.proprietaire_id !== user.id && user.role !== 'admin') {
        throw new AppError('Action non autorisée sur ce produit.', 403);
    }
    return product;
}

const partnerStockService = {
    // Liste des entrées de stock partenaire pour un produit (vendeur propriétaire ou admin)
    async listByProduct(produitId, user) {
        await assertOwnsProduct(produitId, user);
        return PartnerStock.findAll({ where: { produit_id: produitId }, order: [['created_at', 'ASC']] });
    },

    async create(produitId, data, user) {
        await assertOwnsProduct(produitId, user);
        if (!data.partenaire_nom || !data.partenaire_nom.trim()) {
            throw new AppError('Le nom du partenaire est requis.', 400);
        }
        return PartnerStock.create({
            produit_id: produitId,
            partenaire_nom: data.partenaire_nom.trim(),
            partenaire_contact: data.partenaire_contact || null,
            type_stock: data.type_stock || 'entrepot_tiers',
            quantite: data.quantite ?? 0,
            localisation: data.localisation || null,
            notes: data.notes || null,
            derniere_synchro: new Date(),
        });
    },

    async update(id, data, user) {
        if (!isUuid(id)) throw new AppError("Format d'identifiant invalide.", 400);
        const entry = await PartnerStock.findByPk(id);
        if (!entry) throw new AppError('Entrée de stock partenaire non trouvée.', 404);
        await assertOwnsProduct(entry.produit_id, user);

        const fields = ['partenaire_nom', 'partenaire_contact', 'type_stock', 'quantite', 'localisation', 'notes'];
        const updates = {};
        for (const f of fields) {
            if (data[f] !== undefined) updates[f] = data[f];
        }
        updates.derniere_synchro = new Date();

        await entry.update(updates);
        return entry;
    },

    async delete(id, user) {
        if (!isUuid(id)) throw new AppError("Format d'identifiant invalide.", 400);
        const entry = await PartnerStock.findByPk(id);
        if (!entry) throw new AppError('Entrée de stock partenaire non trouvée.', 404);
        await assertOwnsProduct(entry.produit_id, user);
        await entry.destroy();
        return { message: 'Entrée de stock partenaire supprimée.' };
    },

    // Stock total consolidé (propre + tous les partenaires) — utile pour l'affichage vendeur
    async getTotalStock(produitId, user) {
        const product = await assertOwnsProduct(produitId, user);
        const entries = await PartnerStock.findAll({ where: { produit_id: produitId } });
        const stockPartenaires = entries.reduce((sum, e) => sum + e.quantite, 0);
        return {
            stock_propre: product.stock_quantite,
            stock_partenaires: stockPartenaires,
            stock_total: product.stock_quantite + stockPartenaires,
            detail: entries,
        };
    },
};

module.exports = partnerStockService;
