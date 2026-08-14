const AppError = require('../../utils/AppError');
const couponRepository = require('../repository/coupon.repository');

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

const couponService = {
    // Créer un coupon — admin (plateforme, boutique_id null) ou fournisseur (sa propre boutique)
    async create({ code, type, valeur, montant_min, date_debut, date_fin, usage_max, usage_max_par_utilisateur }, user) {
        if (!code?.trim() || !type || valeur === undefined || valeur === null) {
            throw new AppError('Code, type et valeur sont requis.', 400);
        }
        if (!['percentage', 'fixed'].includes(type)) {
            throw new AppError('Type invalide (percentage ou fixed).', 400);
        }
        if (type === 'percentage' && (Number(valeur) <= 0 || Number(valeur) > 100)) {
            throw new AppError('Une réduction en pourcentage doit être comprise entre 1 et 100.', 400);
        }
        if (type === 'fixed' && Number(valeur) <= 0) {
            throw new AppError('Le montant de réduction doit être positif.', 400);
        }

        let boutique_id = null;
        if (user.role === 'fournisseur') {
            const store = await couponRepository.findStoreByOwner(user.id);
            if (!store) throw new AppError('Aucune boutique associée à votre compte.', 404);
            boutique_id = store.id;
        }

        const normalizedCode = normalizeCode(code);
        const existing = await couponRepository.findByCode(normalizedCode);
        if (existing) throw new AppError('Ce code promo existe déjà.', 400);

        return couponRepository.create({
            code: normalizedCode,
            createur_id: user.id,
            boutique_id,
            type,
            valeur: Number(valeur),
            montant_min: montant_min ? Number(montant_min) : null,
            date_debut: date_debut || null,
            date_fin: date_fin || null,
            usage_max: usage_max ? Number(usage_max) : null,
            usage_max_par_utilisateur: usage_max_par_utilisateur ? Number(usage_max_par_utilisateur) : 1,
        });
    },

    // Mes coupons (admin = tous les coupons plateforme ; fournisseur = ceux de sa boutique)
    async getMine(user) {
        const where = user.role === 'admin' ? {} : { createur_id: user.id };
        return couponRepository.findAllFiltered(where);
    },

    // Validation à froid pour l'aperçu panier (sans consommer l'usage)
    async validateCart(code, items, user) {
        if (!code || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Code promo et panier requis.', 400);
        }

        // Les items du panier frontend n'ont que produit_id/quantite/prix — on
        // récupère boutique_id et le vrai prix depuis la base pour ne jamais faire
        // confiance à un montant fourni par le client.
        const productIds = items.map((it) => it.produit_id || it.id).filter(Boolean);
        const products = await couponRepository.findProductsByIds(productIds);
        const productMap = new Map(products.map((p) => [p.id, p]));

        const enrichedItems = items.map((it) => {
            const pid = it.produit_id || it.id;
            const product = productMap.get(pid);
            return {
                produit_id: pid,
                boutique_id: product?.boutique_id,
                quantite: it.quantite || it.quantity || 1,
                prix_unitaire_achat: product ? product.prix_unitaire : (it.prix_unitaire || 0),
            };
        }).filter((it) => it.boutique_id);

        if (enrichedItems.length === 0) {
            throw new AppError('Produits du panier introuvables.', 400);
        }

        const validation = await couponService.validate(code, user.id, enrichedItems);
        return {
            valid: true,
            code: validation.coupon.code,
            type: validation.coupon.type,
            valeur: validation.coupon.valeur,
            discount: validation.discount,
        };
    },

    async toggleActive(id, user) {
        const coupon = await couponRepository.findById(id);
        if (!coupon) throw new AppError('Code promo introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isOwner = coupon.createur_id === user.id;
        if (!isAdmin && !isOwner) throw new AppError('Non autorisé.', 403);

        coupon.actif = !coupon.actif;
        await couponRepository.save(coupon);
        return { message: coupon.actif ? 'Code promo activé.' : 'Code promo désactivé.', coupon };
    },

    async getStats(id, user) {
        const coupon = await couponRepository.findById(id);
        if (!coupon) throw new AppError('Code promo introuvable.', 404);

        const isAdmin = user.role === 'admin';
        const isOwner = coupon.createur_id === user.id;
        if (!isAdmin && !isOwner) throw new AppError('Non autorisé.', 403);

        const totalDiscount = await couponRepository.sumDiscountForCoupon(coupon.id);
        const usages = await couponRepository.findUsagesForCoupon(coupon.id, 50);

        return { coupon, total_reduction_accordee: totalDiscount || 0, usages };
    },

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
