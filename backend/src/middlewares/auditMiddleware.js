const AuditLog = require('../models/AuditLog');

/**
 * Middleware pour enregistrer les actions sensibles en base de données
 */
const auditMiddleware = async (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const action = `${req.method} ${req.originalUrl}`;
                    const table_affectee = req.originalUrl.split('/')[2] || 'unknown';

                    // Masquer les données sensibles (mot de passe) dans les logs
                    const safeBody = { ...req.body };
                    if (safeBody.mot_de_passe) safeBody.mot_de_passe = '[MASQUÉ]';
                    if (safeBody.password) safeBody.password = '[MASQUÉ]';

                    await AuditLog.create({
                        utilisateur_id: req.user?.id || null,
                        action,
                        description: `Corps: ${JSON.stringify(safeBody)}`,
                        table_affectee,
                        adresse_ip: req.ip,
                        agent_utilisateur: req.get('User-Agent'),
                        niveau_alerte: res.statusCode >= 400 ? 'warning' : 'info',
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
