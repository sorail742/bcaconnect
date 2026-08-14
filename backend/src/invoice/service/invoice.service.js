const { Op } = require('sequelize');
const { Invoice, InvoiceCounter, Order, OrderItem, Store, User, Product, sequelize } = require('../../models');
const AppError = require('../../utils/AppError');

// Prix affichés sur BCA Connect = TTC (pratique commerciale courante en
// Guinée) — la TVA est donc extraite du total, jamais ajoutée par-dessus.
const TVA_RATE = 18.00;

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Attribue le prochain numéro de facture sous verrou transactionnel —
 * garantit une numérotation strictement séquentielle sans trou (exigence
 * CGI Guinée en cas de contrôle fiscal). `t.LOCK.UPDATE` émet un vrai
 * SELECT ... FOR UPDATE sur Postgres ; ignoré sans risque sur SQLite (tests),
 * qui sérialise déjà les écritures sur une connexion unique.
 */
async function nextInvoiceNumber(t) {
    let counter = await InvoiceCounter.findOne({ transaction: t, lock: t.LOCK.UPDATE });
    if (!counter) {
        counter = await InvoiceCounter.create({ dernier_numero: 0 }, { transaction: t });
    }
    const next = counter.dernier_numero + 1;
    await counter.update({ dernier_numero: next }, { transaction: t });
    return `FAC-${String(next).padStart(8, '0')}`;
}

async function assertCanAccessOrder(order, user) {
    if (user.role === 'admin') return;
    if (order.utilisateur_id === user.id) return;
    const vendorItems = await OrderItem.count({ where: { commande_id: order.id, fournisseur_id: user.id } });
    if (vendorItems > 0) return;
    throw new AppError('Non autorisé à accéder à cette facture.', 403);
}

/**
 * Émet (ou renvoie, idempotent) une facture par vendeur présent dans la
 * commande — jamais une facture unique "commande" quand plusieurs vendeurs
 * sont impliqués : chaque facture ne doit porter que les articles et le
 * NIF/RCCM du vendeur qui les a effectivement vendus. Les frais de port
 * (charge logistique de la plateforme, pas d'un vendeur) n'entrent dans
 * aucune facture vendeur.
 */
async function getOrCreateForOrder(orderId, { acheteur_nif } = {}, user) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new AppError('Commande non trouvée.', 404);
    await assertCanAccessOrder(order, user);

    const items = await OrderItem.findAll({ where: { commande_id: orderId } });
    if (items.length === 0) throw new AppError('Commande sans article — impossible de facturer.', 400);

    // Un vendeur qui appelle cette route ne doit générer/voir que SA propre
    // facture — jamais celles des autres vendeurs d'une commande
    // multi-vendeurs (montants d'un concurrent). L'acheteur et l'admin,
    // eux, reçoivent bien une facture par vendeur impliqué.
    const allVendorIds = [...new Set(items.map((it) => it.fournisseur_id))];
    const vendorIds = (user.role !== 'admin' && allVendorIds.includes(user.id))
        ? [user.id]
        : allVendorIds;
    const invoices = [];

    for (const vendorId of vendorIds) {
        // Une facture par (commande, boutique) — on relie via la boutique
        // du vendeur, pas via boutique_id sur OrderItem (colonne inexistante).
        const store = await Store.findOne({ where: { proprietaire_id: vendorId } });
        if (!store) continue; // vendeur sans boutique — ne devrait pas arriver, on ignore plutôt que de faire échouer toute la demande

        const alreadyIssued = await Invoice.findOne({ where: { commande_id: orderId, boutique_id: store.id } });
        if (alreadyIssued) {
            invoices.push(alreadyIssued);
            continue;
        }

        const vendorItems = items.filter((it) => it.fournisseur_id === vendorId);
        const montantTtc = round2(vendorItems.reduce((sum, it) => sum + parseFloat(it.prix_unitaire_achat) * it.quantite, 0));
        const montantHt = round2(montantTtc / (1 + TVA_RATE / 100));
        const montantTva = round2(montantTtc - montantHt);

        const t = await sequelize.transaction();
        try {
            const numero = await nextInvoiceNumber(t);
            const invoice = await Invoice.create({
                numero,
                commande_id: order.id,
                boutique_id: store.id,
                utilisateur_id: order.utilisateur_id,
                acheteur_nif: acheteur_nif?.trim() || null,
                montant_ht: montantHt,
                taux_tva: TVA_RATE,
                montant_tva: montantTva,
                montant_ttc: montantTtc,
            }, { transaction: t });
            await t.commit();
            invoices.push(invoice);
        } catch (err) {
            await t.rollback();
            // Contrainte unique (commande_id, boutique_id) violée = une requête
            // concurrente a déjà créé cette facture — la renvoyer plutôt que
            // de faire échouer l'appelant.
            const concurrent = await Invoice.findOne({ where: { commande_id: orderId, boutique_id: store.id } });
            if (concurrent) {
                invoices.push(concurrent);
            } else {
                throw err;
            }
        }
    }

    return invoices;
}

async function getById(id, user) {
    const invoice = await Invoice.findByPk(id, {
        include: [
            { model: Order, as: 'commande' },
            { model: Store, as: 'boutique' },
            { model: User, as: 'acheteur', attributes: ['id', 'nom_complet', 'email', 'telephone'] },
        ],
    });
    if (!invoice) throw new AppError('Facture non trouvée.', 404);
    await assertCanAccessOrder(invoice.commande, user);

    // Désignation détaillée des biens (mention CGI obligatoire) — dérivée
    // des articles du vendeur de cette facture, jamais stockée en double :
    // les OrderItem sont immuables une fois la commande passée, donc ce
    // calcul redonne exactement ce qui a été facturé au moment de l'émission.
    const lignes = await OrderItem.findAll({
        where: { commande_id: invoice.commande_id, fournisseur_id: invoice.boutique.proprietaire_id },
        include: [{ model: Product, as: 'produit', attributes: ['id', 'nom_produit'] }],
    });
    invoice.setDataValue('lignes', lignes.map((l) => ({
        designation: l.produit?.nom_produit || 'Article',
        quantite: l.quantite,
        prix_unitaire_ttc: parseFloat(l.prix_unitaire_achat),
        montant_ttc: round2(parseFloat(l.prix_unitaire_achat) * l.quantite),
    })));

    return invoice;
}

async function listMine(userId) {
    return Invoice.findAll({
        where: { utilisateur_id: userId },
        include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique'] }],
        order: [['created_at', 'DESC']],
    });
}

async function listForVendor(vendorId) {
    const store = await Store.findOne({ where: { proprietaire_id: vendorId } });
    if (!store) return [];
    return Invoice.findAll({
        where: { boutique_id: store.id },
        include: [{ model: User, as: 'acheteur', attributes: ['id', 'nom_complet'] }],
        order: [['created_at', 'DESC']],
    });
}

// Plan Comptable OHADA (SYSCOHADA Révisé 2017) — comptes standards utilisés
// pour le journal des ventes, indépendants de tout logiciel particulier
// (AIRAMA ou autre) : n'importe quel outil conforme SYSCOHADA les reconnaît.
const COMPTE_CLIENTS = '411000';
const COMPTE_VENTES = '701000';
const COMPTE_TVA_FACTUREE = '443000';

const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csvAmount = (n) => (Number(n) || 0).toFixed(2).replace('.', ',');
const csvDate = (d) => new Date(d).toISOString().slice(0, 10);

/**
 * Journal des ventes au format SYSCOHADA Révisé 2017 (analyse
 * concurrentielle #9) — export générique (CSV, plan comptable OHADA
 * standard), pas d'API propriétaire AIRAMA disponible publiquement à ce
 * jour. Un vendeur n'exporte que ses propres factures ; l'admin peut
 * exporter l'ensemble de la plateforme.
 */
async function exportSyscohadaJournal(user, { debut, fin } = {}) {
    if (user.role !== 'admin' && user.role !== 'fournisseur') {
        throw new AppError('Export comptable réservé aux vendeurs et administrateurs.', 403);
    }

    const where = {};
    if (debut || fin) {
        where.date_emission = {};
        if (debut) where.date_emission[Op.gte] = new Date(debut);
        if (fin) where.date_emission[Op.lte] = new Date(`${fin}T23:59:59.999Z`);
    }

    if (user.role !== 'admin') {
        const store = await Store.findOne({ where: { proprietaire_id: user.id } });
        if (!store) return buildCsv([]);
        where.boutique_id = store.id;
    }

    const invoices = await Invoice.findAll({
        where,
        include: [{ model: Store, as: 'boutique', attributes: ['id', 'nom_boutique'] }],
        order: [['numero', 'ASC']],
    });

    return buildCsv(invoices);
}

function buildCsv(invoices) {
    const header = ['Date', 'N° Pièce', 'Compte', 'Libellé', 'Débit', 'Crédit'];
    const rows = [header];

    for (const inv of invoices) {
        const date = csvDate(inv.date_emission);
        const libelleVente = `Vente ${inv.boutique?.nom_boutique || ''} — ${inv.numero}`.trim();
        rows.push([date, inv.numero, COMPTE_CLIENTS, libelleVente, csvAmount(inv.montant_ttc), csvAmount(0)]);
        rows.push([date, inv.numero, COMPTE_VENTES, libelleVente, csvAmount(0), csvAmount(inv.montant_ht)]);
        if (parseFloat(inv.montant_tva) > 0) {
            rows.push([date, inv.numero, COMPTE_TVA_FACTUREE, `TVA ${inv.numero}`, csvAmount(0), csvAmount(inv.montant_tva)]);
        }
    }

    return rows.map((row) => row.map(csvEscape).join(';')).join('\r\n');
}

module.exports = { getOrCreateForOrder, getById, listMine, listForVendor, exportSyscohadaJournal };
