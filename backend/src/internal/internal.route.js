const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const AppError = require('../utils/AppError');
const deletionLogService = require('../deletion-log/service/deletionLog.service');
const { Store, Notification } = require('../models');

/**
 * Routes internes, jamais exposées à un client (navigateur/app mobile) —
 * uniquement appelées par le service NestJS pour les capacités qu'il ne
 * possède pas pendant la migration progressive : Socket.IO (attaché au
 * serveur HTTP Express) et le journal de suppression (deletion-log, encore
 * possédé par Sequelize). Voir backend-nest/src/webinar pour l'appelant.
 *
 * Authentifiées par HMAC-SHA256 du corps de requête (même principe que le
 * webhook wallet — backend/src/common/wallet/controller/wallet.controller.js)
 * plutôt qu'un secret en clair transmis tel quel.
 */
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;
if (!INTERNAL_SECRET) {
    throw new Error('INTERNAL_SECRET est requis (pont interne Express <-> NestJS).');
}

function verifyInternalSignature(req, res, next) {
    const signature = req.headers['x-internal-signature'];
    if (!signature) {
        return next(new AppError('Signature interne manquante.', 401));
    }
    const expected = crypto.createHmac('sha256', INTERNAL_SECRET).update(JSON.stringify(req.body)).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return next(new AppError('Signature interne invalide.', 403));
    }
    next();
}

router.use(express.json());
router.use(verifyInternalSignature);

// `room` optionnel — cible un utilisateur précis (io.to(room), room =
// toujours l'utilisateur_id destinataire ici) plutôt qu'un broadcast global
// (comportement d'origine, conservé quand room est absent).
router.post('/emit', (req, res) => {
    const { event, payload, room } = req.body;
    const io = req.app.get('socketio');
    if (io && event) {
        if (room) io.to(room).emit(event, payload);
        else io.emit(event, payload);
    }
    res.json({ ok: true });
});

// Crée une Notification (table encore possédée par Sequelize) puis l'émet en
// temps réel à son destinataire — réplique le couple
// `Notification.create(...)` + `io.to(utilisateur_id).emit('notification_received', notif)`
// qu'on retrouvait dupliqué dans chaque module Express notifiant un
// utilisateur (product-question, alert-threshold, ...). Pattern réutilisable
// pour tout futur module NestJS ayant besoin de notifier.
router.post('/create-notification', async (req, res) => {
    const { utilisateur_id, titre, message, type, metadata } = req.body;
    if (!utilisateur_id || !titre || !message) {
        return res.status(400).json({ message: 'utilisateur_id, titre et message sont requis.' });
    }
    const notif = await Notification.create({ utilisateur_id, titre, message, type, metadata });
    const io = req.app.get('socketio');
    if (io) io.to(utilisateur_id).emit('notification_received', notif);
    res.json({ ok: true });
});

router.post('/record-deletion', async (req, res) => {
    const { table, record, user, ip, userAgent, confirmationNom } = req.body;
    await deletionLogService.recordDeletion(table, record, {
        req: {
            user: user || null,
            ip: ip || null,
            headers: { 'user-agent': userAgent || null },
            body: { confirmation_nom: confirmationNom || null },
        },
    });
    res.json({ ok: true });
});

// Effet de bord de certification.service.ts#review() (module Certification,
// NestJS/Prisma) : boutiques.is_verified/niveau_verification restent
// possédées par Sequelize (table pas encore migrée) — jamais d'écriture
// Prisma directe dessus. Réplique exactement
// certificationRepository.markStoreVerified/setVerificationLevel.
router.post('/verify-store', async (req, res) => {
    const { fournisseurId, isVerified, niveauVerification } = req.body;
    if (!fournisseurId) {
        return res.status(400).json({ message: 'fournisseurId requis.' });
    }
    const data = {};
    if (isVerified) data.is_verified = true;
    if (niveauVerification) data.niveau_verification = niveauVerification;
    if (Object.keys(data).length > 0) {
        await Store.update(data, { where: { proprietaire_id: fournisseurId } });
    }
    res.json({ ok: true });
});

module.exports = router;
