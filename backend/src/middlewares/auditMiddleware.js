const AuditLog = require('../audit-log/models/auditLog.model');

// Normalise les IPv4 mappées en IPv6 (ex: "::ffff:127.0.0.1" → "127.0.0.1") pour
// un affichage cohérent — sans ça, la même machine apparaît sous deux formats
// différents selon l'interface réseau utilisée par la connexion entrante.
const normalizeIp = (ip) => (ip && ip.startsWith('::ffff:') ? ip.slice(7) : ip);

/**
 * Middleware pour enregistrer les actions sensibles en base de données
 */
const auditMiddleware = async (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        res.on('finish', async () => {
            // Journaliser aussi les échecs (login raté, accès refusé...) — c'est
            // souvent le signal de sécurité le plus utile pour l'admin, et il était
            // auparavant silencieusement ignoré (le garde-fou ne laissait passer
            // que les statuts 2xx).
            try {
                const action = `${req.method} ${req.originalUrl}`;
                const table_affectee = req.originalUrl.split('/')[2] || 'unknown';

                // Masquer les données sensibles (mot de passe) dans les logs
                const safeBody = { ...req.body };
                if (safeBody.mot_de_passe) safeBody.mot_de_passe = '[MASQUÉ]';
                if (safeBody.password) safeBody.password = '[MASQUÉ]';

                let niveau_alerte = 'info';
                if (res.statusCode >= 500) niveau_alerte = 'error';
                else if (res.statusCode >= 400) niveau_alerte = 'warning';

                await AuditLog.create({
                    utilisateur_id: req.user?.id || null,
                    action,
                    description: `Statut HTTP ${res.statusCode} — Corps: ${JSON.stringify(safeBody)}`,
                    table_affectee,
                    adresse_ip: normalizeIp(req.ip),
                    agent_utilisateur: req.get('User-Agent'),
                    niveau_alerte,
                });
            } catch (error) {
                console.error('Erreur lors de la création du log d\'audit:', error);
            }
        });
    }
    next();
};

module.exports = auditMiddleware;
