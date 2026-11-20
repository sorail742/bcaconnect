const AppError = require('../../utils/AppError');
const couponRepository = require('../repository/coupon.repository');

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

// create/getMine/validateCart/toggleActive/getStats ont basculé vers
// NestJS/Prisma (backend-nest/src/coupon) — seules validate/
// applyDiscountToItems/recordUsage restent ici, appelées directement par
// order.service.js à l'intérieur de sa propre transaction Sequelize (verrou
// sur le coupon pendant la création de commande, voir schema.prisma#coupons
// pour le détail du partage de table).
const couponService = {
    /**
     * Valide un code promo pour un panier donné et calcule la réduction totale
     * applicable, SANS effet de bord (ne consomme pas l'usage — voir recordUsage).
     * `items` : [{ produit_id, fournisseur_id, boutique_id, quantite, prix_unitaire_achat }]
     * Utilisée directement par order.service.js (mise en place de commande).
     */
    async validate(code, userId, items, transaction) {
        const normalized = normalizeCode(code);
        if (!normalized) throw new AppError('Code promo requis.', 400);

        const coupon = await couponRepository.findByCode(normalized, {
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined,
        });
        if (!coupon || !coupon.actif) {
            throw new AppError('Code promo invalide ou inactif.', 400);
        }

        const now = new Date();
        if (coupon.date_debut && now < new Date(coupon.date_debut)) {
            throw new AppError('Ce code promo n\'est pas encore actif.', 400);
        }
        if (coupon.date_fin && now > new Date(coupon.date_fin)) {
            throw new AppError('Ce code promo a expiré.', 400);
        }
        if (coupon.usage_max !== null && coupon.usage_count >= coupon.usage_max) {
            throw new AppError('Ce code promo a atteint sa limite d\'utilisation.', 400);
        }

        const userUsageCount = await couponRepository.countUserUsage(coupon.id, userId, { transaction });
        if (userUsageCount >= coupon.usage_max_par_utilisateur) {
            throw new AppError('Vous avez déjà utilisé ce code promo le nombre maximum de fois autorisé.', 400);
        }

        // Un coupon boutique ne réduit que les articles de cette boutique.
        const qualifyingItems = coupon.boutique_id
            ? items.filter((it) => it.boutique_id === coupon.boutique_id)
            : items;

        if (qualifyingItems.length === 0) {
            throw new AppError('Ce code promo ne s\'applique à aucun article de votre panier.', 400);
        }

        const qualifyingSubtotal = qualifyingItems.reduce(
            (sum, it) => sum + parseFloat(it.prix_unitaire_achat) * it.quantite, 0,
        );

        if (coupon.montant_min && qualifyingSubtotal < parseFloat(coupon.montant_min)) {
            throw new AppError(`Montant minimum de ${parseFloat(coupon.montant_min).toLocaleString('fr-GN')} GNF requis pour ce code promo.`, 400);
        }

        let discount = coupon.type === 'percentage'
            ? qualifyingSubtotal * (parseFloat(coupon.valeur) / 100)
            : parseFloat(coupon.valeur);
        discount = Math.min(discount, qualifyingSubtotal);
        discount = Math.round(discount * 100) / 100;

        return { coupon, discount, qualifyingItems };
    },

    /**
     * Applique la réduction PROPORTIONNELLEMENT au prix unitaire des articles
     * qualifiants (mutation directe des objets `items`), pour que le séquestre
     * fournisseur — calculé à partir de `prix_unitaire_achat` — reste exact.
     * Le dernier article qualifiant absorbe le reste d'arrondi.
     * Utilisée directement par order.service.js.
     */
    applyDiscountToItems(items, coupon, discount, qualifyingItems) {
        if (discount <= 0) return;
        const qualifyingSubtotal = qualifyingItems.reduce(
            (sum, it) => sum + parseFloat(it.prix_unitaire_achat) * it.quantite, 0,
        );
        if (qualifyingSubtotal <= 0) return;

        let allocated = 0;
        qualifyingItems.forEach((item, idx) => {
            const itemTotal = parseFloat(item.prix_unitaire_achat) * item.quantite;
            const isLast = idx === qualifyingItems.length - 1;
            let itemDiscount = isLast
                ? Math.round((discount - allocated) * 100) / 100
                : Math.round((itemTotal / qualifyingSubtotal) * discount * 100) / 100;
            itemDiscount = Math.min(itemDiscount, itemTotal);
            allocated += itemDiscount;

            const newUnitPrice = (itemTotal - itemDiscount) / item.quantite;
            item.prix_unitaire_achat = Math.max(0, Math.round(newUnitPrice * 100) / 100);
        });
    },

    // Utilisée directement par order.service.js après création de la commande.
    async recordUsage(coupon, userId, orderId, discount, transaction) {
        await couponRepository.createUsage({
            coupon_id: coupon.id,
            utilisateur_id: userId,
            commande_id: orderId,
            montant_reduction: discount,
        }, { transaction });
        coupon.usage_count += 1;
        await couponRepository.save(coupon, { transaction });
    },
};

module.exports = couponService;
