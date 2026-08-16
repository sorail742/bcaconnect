const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const AppError = require('../utils/AppError');
const deletionLogService = require('../deletion-log/service/deletionLog.service');

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

router.post('/emit', (req, res) => {
    const { event, payload } = req.body;
    const io = req.app.get('socketio');
    if (io && event) io.emit(event, payload);
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

module.exports = router;
