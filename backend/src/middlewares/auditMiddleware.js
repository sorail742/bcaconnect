const AuditLog = require('../models/AuditLog');

/**
 * Middleware pour enregistrer les actions sensibles en base de données
 */
const auditMiddleware = async (req, res, next) => {
    // On n'enregistre que les actions de modification
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {

        // On attend la fin de la réponse pour savoir si l'action a réussi
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const action = `${req.method} ${req.originalUrl}`;
                    const description = `Corps: ${JSON.stringify(req.body)}`;
                    const table_affectee = req.originalUrl.split('/')[2] || 'unknown';

                    await AuditLog.create({
                        action,
                        description,
                        table_affectee,
                        adresse_ip: req.ip,
                        agent_utilisateur: req.get('User-Agent'),
                        niveau_alerte: res.statusCode >= 400 ? 'warning' : 'info',
                        // Note: L'ID utilisateur sera associé via une relation si le user est connecté
                        // On pourrait étendre le modèle AuditLog pour inclure user_id
                    });
                } catch (error) {
                    console.error('Erreur lors de la création du log d\'audit:', error);
                }
            }
        });
    }
    next();
};

module.exports = auditMiddleware;
