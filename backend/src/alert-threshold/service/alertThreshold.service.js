const { AlertThreshold, Product, Notification } = require('../../models');
const AppError = require('../../utils/AppError');

const isUuid = (v) => typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);

const TYPES = ['prix_produit', 'stock_produit'];
const OPERATEURS = ['inferieur_egal', 'superieur_egal'];
const COOLDOWN_HEURES = 24;

const alertThresholdService = {
    async listMine(userId) {
        return AlertThreshold.findAll({
            where: { utilisateur_id: userId },
            include: [{ model: Product, as: 'produit', attributes: ['id', 'nom_produit', 'prix_unitaire', 'stock_quantite'] }],
            order: [['created_at', 'DESC']],
        });
    },

    // Crée le seuil, ou met à jour celui déjà existant pour ce couple
    // (utilisateur, produit, type) — évite les doublons silencieux.
    async createOrUpdate(userId, data) {
        if (!TYPES.includes(data.type)) throw new AppError('Type de seuil invalide.', 400);
        if (!isUuid(data.produit_id)) throw new AppError('ID produit invalide.', 400);

        const product = await Product.findByPk(data.produit_id);
        if (!product) throw new AppError('Produit non trouvé.', 404);

        const operateur = OPERATEURS.includes(data.operateur) ? data.operateur : 'inferieur_egal';
        const valeur_seuil = parseFloat(data.valeur_seuil);
        if (!Number.isFinite(valeur_seuil) || valeur_seuil < 0) {
            throw new AppError('Valeur de seuil invalide.', 400);
        }

        const existing = await AlertThreshold.findOne({
            where: { utilisateur_id: userId, produit_id: data.produit_id, type: data.type },
        });

        if (existing) {
            await existing.update({ operateur, valeur_seuil, actif: true });
            return existing;
        }

        return AlertThreshold.create({
            utilisateur_id: userId,
            produit_id: data.produit_id,
            type: data.type,
            operateur,
            valeur_seuil,
        });
    },

    async toggle(id, userId, actif) {
        const seuil = await AlertThreshold.findOne({ where: { id, utilisateur_id: userId } });
        if (!seuil) throw new AppError('Seuil non trouvé.', 404);
        await seuil.update({ actif: !!actif });
        return seuil;
    },

    async remove(id, userId) {
        const seuil = await AlertThreshold.findOne({ where: { id, utilisateur_id: userId } });
        if (!seuil) throw new AppError('Seuil non trouvé.', 404);
        await seuil.destroy();
        return { message: 'Seuil supprimé.' };
    },

    /**
     * Évalue tous les seuils actifs contre l'état courant du produit et
     * notifie l'utilisateur pour ceux déclenchés — utilisé par
     * alertThresholdCron. Un cooldown de 24h par seuil évite le spam tant
     * que la condition reste vraie (ex: stock qui reste bas plusieurs jours).
     */
    async evaluateAll(io = null) {
        const seuils = await AlertThreshold.findAll({
            where: { actif: true },
            include: [{ model: Product, as: 'produit' }],
        });

        const now = new Date();
        let declenches = 0;

        for (const seuil of seuils) {
            const produit = seuil.produit;
            if (!produit) continue;

            if (seuil.dernier_declenchement) {
                const heuresDepuis = (now - new Date(seuil.dernier_declenchement)) / 36e5;
                if (heuresDepuis < COOLDOWN_HEURES) continue;
            }

            const valeurActuelle = seuil.type === 'prix_produit'
                ? parseFloat(produit.prix_unitaire)
                : produit.stock_quantite;

            const estDeclenche = seuil.operateur === 'inferieur_egal'
                ? valeurActuelle <= parseFloat(seuil.valeur_seuil)
                : valeurActuelle >= parseFloat(seuil.valeur_seuil);

            if (!estDeclenche) continue;

            const libelle = seuil.type === 'prix_produit' ? 'Prix' : 'Stock';
            const notif = await Notification.create({
                utilisateur_id: seuil.utilisateur_id,
                titre: `Alerte ${libelle.toLowerCase()} : ${produit.nom_produit}`,
                message: `<span class="font-bold">${produit.nom_produit}</span> — ${libelle} actuel : <span class="font-black">${valeurActuelle}</span> (seuil : ${seuil.valeur_seuil}).`,
                type: 'system',
                metadata: {
                    seuil_id: seuil.id,
                    produit_id: produit.id,
                    type_seuil: seuil.type,
                    valeur_actuelle: valeurActuelle,
                },
            });
            if (io) io.to(seuil.utilisateur_id).emit('notification_received', notif);

            await seuil.update({ dernier_declenchement: now });
            declenches++;
        }

        return { evalues: seuils.length, declenches };
    },
};

module.exports = alertThresholdService;
