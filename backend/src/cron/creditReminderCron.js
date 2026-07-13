const cron = require('node-cron');
const { Op } = require('sequelize');
const { Echeancier, Credit, User, Notification } = require('../models');
const { sendSms } = require('../services/smsService');

/**
 * Tâche Cron : Rappels automatiques pour les échéances de crédit
 * S'exécute tous les jours à 08:00 (0 8 * * *)
 */
const startCreditReminders = () => {
    // Exécution toutes les minutes pour la démo, ou tous les jours normalement.
    // On va mettre "0 8 * * *" pour tous les jours à 8h.
    cron.schedule('0 8 * * *', async () => {
        console.log('[CRON] Lancement de la vérification des échéances de crédit...');
        
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const in3Days = new Date(today);
            in3Days.setDate(in3Days.getDate() + 3);

            const in1Day = new Date(today);
            in1Day.setDate(in1Day.getDate() + 1);

            // Rechercher les échéances en attente ou en retard
            const echeances = await Echeancier.findAll({
                where: {
                    statut: { [Op.in]: ['du', 'en_retard'] }
                },
                include: [{
                    model: Credit,
                    include: [{
                        model: User,
                        as: 'utilisateur',
                        attributes: ['id', 'email', 'nom_complet', 'telephone']
                    }]
                }]
            });

            for (const echeance of echeances) {
                const datePrevue = new Date(echeance.date_echeance);
                datePrevue.setHours(0, 0, 0, 0);
                
                const timeDiff = datePrevue.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                const user = echeance.Credit?.utilisateur;
                if (!user) continue;

                // Logique d'alerte
                if (daysDiff === 3) {
                    await sendNotification(user, `Rappel : Votre échéance de ${echeance.montant_du} GNF arrive à échéance dans 3 jours (${datePrevue.toLocaleDateString()}).`);
                } else if (daysDiff === 1) {
                    await sendNotification(user, `Alerte : Votre échéance de ${echeance.montant_du} GNF est due demain !`);
                } else if (daysDiff === 0) {
                    await sendNotification(user, `Urgent : Votre échéance de ${echeance.montant_du} GNF est due AUJOURD'HUI. Cliquez ici pour payer.`);
                } else if (daysDiff < 0 && echeance.statut !== 'en_retard') {
                    echeance.statut = 'en_retard';
                    await echeance.save();
                    await sendNotification(user, `Retard : Votre échéance de ${echeance.montant_du} GNF est en retard de ${Math.abs(daysDiff)} jours. Veuillez régulariser votre situation.`);
                } else if (daysDiff < 0 && echeance.statut === 'en_retard') {
                    if (Math.abs(daysDiff) % 5 === 0) {
                        await sendNotification(user, `Dernier Rappel : Votre échéance est en retard de ${Math.abs(daysDiff)} jours. Pénalités applicables.`);
                    }
                }
            }
            console.log('[CRON] Vérification des échéances terminée.');

        } catch (error) {
            console.error('[CRON] Erreur lors de la vérification des échéances :', error);
        }
    });
    console.log('[CRON] Tâche de rappel des échéances planifiée (Tous les jours à 08:00).');
};

const sendNotification = async (user, message, titre = 'Rappel crédit BCA') => {
    console.log(`[NOTIF -> ${user.nom_complet} / ${user.telephone || user.email}] : ${message}`);
    try {
        await Notification.create({
            utilisateur_id: user.id,
            titre,
            message,
            type: 'credit',
        });
    } catch (err) {
        console.warn('[CRON] Échec création notification crédit:', err.message);
    }

    const smsText = `${titre}: ${message}`.slice(0, 160);
    await sendSms(user.telephone, smsText);
};

module.exports = { startCreditReminders };
