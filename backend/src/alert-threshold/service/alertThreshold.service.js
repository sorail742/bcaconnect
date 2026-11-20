const { AlertThreshold, Product, Notification } = require('../../models');

const COOLDOWN_HEURES = 24;

// listMine/createOrUpdate/toggle/remove ont basculé vers NestJS/Prisma
// (backend-nest/src/alert-threshold) — seule evaluateAll reste ici, appelée
// par backend/src/cron/alertThresholdCron.js (accès direct à cette même
// table côté Sequelize, voir schema.prisma#seuils_alerte pour le détail du
// partage).
const alertThresholdService = {
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
