const cron = require('node-cron');
const { Op } = require('sequelize');
const { Echeancier, Credit, User } = require('../models');
const { getIO } = require('../app'); // Assuming socket.io is accessible, wait I should use the standard way
// Let's just mock the email/notification sending for now or use console.log

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
                        as: 'Utilisateur', // or default association name
                        attributes: ['id', 'email', 'nom_complet', 'telephone']
                    }]
                }]
            });

            for (const echeance of echeances) {
                const datePrevue = new Date(echeance.date_echeance);
                datePrevue.setHours(0, 0, 0, 0);
                
                const timeDiff = datePrevue.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                const user = echeance.Credit?.User || echeance.Credit?.Utilisateur;
                if (!user) continue;

                // Logique d'alerte
                if (daysDiff === 3) {
                    sendNotification(user, `Rappel : Votre échéance de ${echeance.montant_du} GNF arrive à échéance dans 3 jours (${datePrevue.toLocaleDateString()}).`);
                } else if (daysDiff === 1) {
                    sendNotification(user, `Alerte : Votre échéance de ${echeance.montant_du} GNF est due demain !`);
                } else if (daysDiff === 0) {
                    sendNotification(user, `Urgent : Votre échéance de ${echeance.montant_du} GNF est due AUJOURD'HUI. Cliquez ici pour payer.`);
                } else if (daysDiff < 0 && echeance.statut !== 'en_retard') {
                    // Mettre à jour le statut
                    echeance.statut = 'en_retard';
                    await echeance.save();
                    sendNotification(user, `Retard : Votre échéance de ${echeance.montant_du} GNF est en retard de ${Math.abs(daysDiff)} jours. Veuillez régulariser votre situation.`);
                } else if (daysDiff < 0 && echeance.statut === 'en_retard') {
                    // Relance tous les 5 jours de retard
                    if (Math.abs(daysDiff) % 5 === 0) {
                        sendNotification(user, `Dernier Rappel : Votre échéance est en retard de ${Math.abs(daysDiff)} jours. Pénalités applicables.`);
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

const sendNotification = (user, message) => {
    // Simulation d'envoi d'Email / SMS / Push
    console.log(`[NOTIF -> ${user.nom_complet} / ${user.telephone || user.email}] : ${message}`);
    
    // Si on avait accès direct à Socket.io de l'app :
    // getIO().to(`user_${user.id}`).emit('credit_reminder', { message });
};

module.exports = { startCreditReminders };
