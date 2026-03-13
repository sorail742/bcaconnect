const { AuditLog } = require('./models');

const logger = {
    audit: async (data) => {
        try {
            await AuditLog.create({
                utilisateur_id: data.userId,
                action: data.action,
                description: data.description,
                table_affectee: data.table,
                id_enregistrement: data.recordId,
                adresse_ip: data.ip,
                niveau_alerte: data.level || 'info'
            });
        } catch (error) {
            console.error('Audit Log Error:', error);
        }
    }
};

module.exports = logger;
