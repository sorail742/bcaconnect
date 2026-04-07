const winston = require('winston');
const path = require('path');
const { AuditLog } = require('../models');

/**
 * Système de Logging Sécurisé (Standard BCA v2.5).
 * Combine les logs SQL (AuditLog) et les fichiers de sécurité distants (Winston).
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // 1. Logs de Sécurité & d'Audit (Winston File)
        new winston.transports.File({ 
            filename: 'logs/security.log', 
            level: 'warn',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 30
        }),
        // 2. Logs d'Erreur (Winston File)
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
    ],
});

// Ajout de la console en développement
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

/**
 * Extension pour loguer les événements d'audit en base de données.
 */
logger.audit = async (data) => {
    try {
        // Log SQL (AuditLog)
        await AuditLog.create({
            utilisateur_id: data.userId,
            action: data.action,
            description: data.description,
            table_affectee: data.table,
            id_enregistrement: data.recordId,
            adresse_ip: data.ip,
            niveau_alerte: data.level || 'info'
        });

        // Mirroring vers Winston pour persistance sécurisée SI alerte critique
        if (data.level === 'warn' || data.level === 'error') {
            logger.warn(`AUDIT_${data.action}`, { ...data, timestamp: new Date() });
        }
    } catch (error) {
        logger.error('Audit Log DB Error', { error: error.message });
    }
};

module.exports = logger;
