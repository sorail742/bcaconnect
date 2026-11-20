const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');
const deletionLogRepository = require('../repository/deletionLog.repository');
const {
    Product, Category, Notification, Publicite,
} = require('../../models');

// Entités pour lesquelles une restauration automatique en un clic est possible :
// une seule table, sans arborescence de dépendances complexe à reconstruire.
// L'utilisateur (suppression en cascade) en est volontairement exclu — la preuve
// reste consultable dans l'historique, mais la restauration nécessite une
// intervention manuelle du support technique.
//
// Webinar, EducationalResource (retirés) : tables migrées vers NestJS/Prisma
// (backend-nest/src/webinar, backend-nest/src/education) — la restauration
// automatique en un clic n'est plus disponible depuis ce chemin Sequelize.
// L'historique de suppression (snapshot complet) reste consultable ; une
// restauration reste possible manuellement via Prisma si nécessaire.
const RESTORABLE_MODELS = { Product, Category, Notification, Publicite };

const filterToModelFields = (Model, data) => {
    const allowed = Object.keys(Model.rawAttributes);
    const out = {};
    for (const key of allowed) {
        if (data[key] !== undefined) out[key] = data[key];
    }
    return out;
};

const pickLibelle = (snapshot) =>
    snapshot?.nom_produit
    || snapshot?.nom_complet
    || snapshot?.nom_boutique
    || snapshot?.nom_categorie
    || snapshot?.titre
    || snapshot?.message
    || snapshot?.email
    || snapshot?.id
    || null;

const deletionLogService = {
    /**
     * Dépose un instantané complet d'un enregistrement dans l'historique infini
     * des suppressions AVANT que celui-ci soit réellement détruit ailleurs.
     * Ne fait jamais échouer l'appelant : une panne d'audit ne doit pas bloquer
     * l'action métier, mais elle est journalisée côté serveur pour investigation.
     *
     * @param {string} table - Nom logique du modèle supprimé (ex: 'Product')
     * @param {object} record - Instance Sequelize (ou objet brut) à archiver
     * @param {object} [options]
     * @param {import('express').Request} [options.req] - Requête en cours (auteur, IP, confirmation saisie)
     * @param {object} [options.extra] - Données additionnelles à fusionner dans l'instantané (ex: enfants directs)
     * @param {import('sequelize').Transaction} [options.transaction] - Transaction en cours : si elle est annulée,
     *   la ligne d'historique doit disparaître avec elle (rien n'a réellement été supprimé).
     */
    async recordDeletion(table, record, { req, extra, transaction } = {}) {
        if (!record) return null;
        try {
            const snapshot = typeof record.toJSON === 'function' ? record.toJSON() : { ...record };
            const merged = extra ? { ...snapshot, ...extra } : snapshot;

            return await deletionLogRepository.create({
                table_affectee: table,
                id_enregistrement: record.id != null ? String(record.id) : null,
                libelle: pickLibelle(snapshot),
                snapshot: merged,
                supprime_par: req?.user?.id || null,
                supprime_par_nom: req?.user
                    ? `${req.user.nom_complet || req.user.email || req.user.id} (${req.user.role})`
                    : null,
                confirmation_saisie: req?.body?.confirmation_nom || null,
                adresse_ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
                agent_utilisateur: req?.headers?.['user-agent'] || null,
            }, transaction);
        } catch (error) {
            console.error(`[deletionLogService] Échec de journalisation pour ${table}:`, error.message);
            return null;
        }
    },

    async getAll({ page = 1, limit = 30, table_affectee = '', search = '' }) {
        const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 30);
        const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

        const where = {};
        if (table_affectee) where.table_affectee = table_affectee;
        if (search) {
            where[Op.or] = [
                { libelle: { [Op.iLike]: `%${search}%` } },
                { id_enregistrement: { [Op.iLike]: `%${search}%` } },
                { supprime_par_nom: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await deletionLogRepository.findAndCountAllFiltered({ where, limit: lim, offset });

        return {
            total: count,
            pages: Math.ceil(count / lim),
            currentPage: parseInt(page, 10) || 1,
            restorableTables: Object.keys(RESTORABLE_MODELS),
            logs: rows,
        };
    },

    async getById(id) {
        const log = await deletionLogRepository.findById(id);
        if (!log) throw new AppError('Entrée d\'historique introuvable.', 404);
        return log;
    },

    async restore(id, userId) {
        const log = await deletionLogRepository.findById(id);
        if (!log) throw new AppError('Entrée d\'historique introuvable.', 404);
        if (log.restaure) throw new AppError('Cet élément a déjà été restauré.', 400);

        const Model = RESTORABLE_MODELS[log.table_affectee];
        if (!Model) {
            throw new AppError(
                `La restauration automatique n'est pas disponible pour "${log.table_affectee}". La preuve reste néanmoins conservée dans l'historique — contactez le support technique pour une restauration manuelle.`,
                400,
            );
        }

        try {
            const data = filterToModelFields(Model, log.snapshot);
            const restored = await deletionLogRepository.createRestoredRecord(Model, data);
            await deletionLogRepository.markRestored(log, userId);
            return restored;
        } catch (error) {
            throw new AppError(
                `Restauration impossible : ${error.message} (conflit probable avec une donnée existante — identifiant ou champ unique déjà repris).`,
                409,
            );
        }
    },
};

module.exports = deletionLogService;
