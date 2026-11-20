const cron = require('node-cron');
const { Litige, LitigeEvenement, User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

const ESCALATION_DAYS = 7;

/**
 * Parcourt les litiges ouverts depuis trop longtemps sans résolution et les escalade.
 */
const runDisputeEscalation = async (io = null) => {
    try {
        console.log("⚖️  Début du job d'escalade des litiges...");

        const escalationThreshold = new Date(new Date().getTime() - (ESCALATION_DAYS * 24 * 60 * 60 * 1000));

        // On cherche les litiges en_cours qui n'ont pas bougé depuis ESCALATION_DAYS
        const staleDisputes = await Litige.findAll({
            where: {
                statut: 'en_cours',
                updated_at: { [Op.lt]: escalationThreshold }
            }
        });

        if (staleDisputes.length === 0) {
            console.log("✅ Aucun litige à escalader aujourd'hui.");
            return;
        }

        const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });

        for (const litige of staleDisputes) {
            const t = await sequelize.transaction();
            try {
                litige.statut = 'en_mediation';
                await litige.save({ transaction: t });

                // Ajouter un événement
                await LitigeEvenement.create({
                    litige_id: litige.id,
                    type: 'escalade',
                    message: `Escalade automatique après ${ESCALATION_DAYS} jours d'inactivité. Intervention admin requise.`,
                    auteur_id: null, // Système
                }, { transaction: t });

                await t.commit();

                // Notifications
                if (io) {
                    const msg = `Votre litige #${litige.id.slice(0, 8)} a été automatiquement escaladé vers l'administration pour résolution.`;
                    
                    const notifDemandeur = await Notification.create({ utilisateur_id: litige.demandeur_id, titre: 'Litige Escaladé', message: msg, type: 'dispute' });
                    io.to(litige.demandeur_id).emit('notification_received', notifDemandeur);

                    const notifDefenseur = await Notification.create({ utilisateur_id: litige.defenseur_id, titre: 'Litige Escaladé', message: msg, type: 'dispute' });
                    io.to(litige.defenseur_id).emit('notification_received', notifDefenseur);

                    for (const admin of admins) {
                        const notifAdmin = await Notification.create({ utilisateur_id: admin.id, titre: 'Litige à arbitrer (Auto)', message: `Le litige #${litige.id.slice(0, 8)} nécessite une intervention.`, type: 'dispute' });
                        io.to(admin.id).emit('notification_received', notifAdmin);
                    }
                }

            } catch (err) {
                await t.rollback();
                console.error(`❌ Erreur lors de l'escalade du litige ${litige.id}:`, err);
            }
        }

        console.log(`✅ Fin du job. ${staleDisputes.length} litiges escaladés.`);
    } catch (error) {
        console.error("❌ Erreur globale lors du job d'escalade des litiges :", error);
    }
};

const startDisputeEscalation = (io) => {
    // Exécution tous les jours à 10h00
    cron.schedule('0 10 * * *', () => {
        runDisputeEscalation(io);
    });
    console.log("⏰ Cron job 'Dispute Escalation' programmé (Quotidien 10:00)");
};

module.exports = { startDisputeEscalation, runDisputeEscalation };
