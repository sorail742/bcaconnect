const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const auditMiddleware = require('./middlewares/auditMiddleware');
const { globalValidationMiddleware, validatePagination } = require('./middlewares/globalValidation');
const { sequelize } = require('./models');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');

const app = express();
const path = require('path');

// En production (Render, derrière un proxy), sans ceci req.ip renvoie l'IP interne
// du proxy pour CHAQUE requête — ce qui invaliderait tout suivi d'IP utilisateur
// (journal d'activité, rate limiting) en environnement réel.
app.set('trust proxy', 1);

// ─── Servir les fichiers statiques (Uploads) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Sécurité : CORS (Standard BCA v2.6) ────────────────────────────────────
const allowedOrigins = [
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'CSRF-Token'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ─── Middlewares de base ─────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://*.s3.amazonaws.com", "https://*.googleusercontent.com"],
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            "connect-src": ["'self'", "https://*.sentry.io", "https://accounts.google.com", "wss://*.upstash.io"],
            "frame-src": ["'self'", "https://accounts.google.com"]
        }
    }
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Audit ───────────────────────────────────────────────────────────────────
app.use(auditMiddleware);

// ─── 🔐 VALIDATION GLOBALE (P0 - Sécurité) ──────────────────────────────────
// Appliqué à TOUTES les requêtes pour une protection maximale
app.use('/api', globalValidationMiddleware);

// ─── Diagnostic & Health (Avant les limites de débit) ───────────────────────
app.get('/api/ping', (req, res) => res.json({ message: 'pong', version: '2.6' }));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.6',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        db_connected: !!sequelize,
        validation: 'enabled'
    });
});

// ─── Sécurité : Rate Limiting ────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Augmenté pour éviter les faux-positifs en dev
    message: { message: 'Trop de requêtes.' },
});
app.use('/api', globalLimiter);

// ─── Registre des Routes API V1 ──────────────────────────────────────────────
const apiRouter = express.Router();

// Appliquer la validation de pagination sur les routes GET
apiRouter.use(validatePagination);

apiRouter.use('/auth', require('./auth/routes/auth.route'));
apiRouter.use('/categories', require('./category/routes/category.route'));
apiRouter.use('/stores', require('./store/routes/store.route'));
apiRouter.use('/users', require('./user/routes/user.route'));
apiRouter.use('/products', require('./product/routes/product.route'));
apiRouter.use('/orders', require('./order/routes/order.route'));
apiRouter.use('/payments', require('./payment/routes/payment.route'));
apiRouter.use('/wallet', require('./common/wallet/routes/wallet.route'));
apiRouter.use('/delivery', require('./delivery/routes/delivery.route'));
apiRouter.use('/ai', require('./ai/routes/ai.route'));
apiRouter.use('/ads', require('./ad/routes/ad.route'));
apiRouter.use('/disputes', require('./dispute/routes/dispute.route'));
apiRouter.use('/credits', require('./credit/routes/credit.route'));
apiRouter.use('/stats', require('./dashboard/routes/dashboard.route'));
apiRouter.use('/support', require('./support/routes/support.route'));
apiRouter.use('/upload', require('./upload/routes/upload.route'));
apiRouter.use('/notifications', require('./notification/routes/notification.route'));
apiRouter.use('/messages', require('./message/routes/message.route'));
apiRouter.use('/reviews', require('./review/routes/review.route'));
apiRouter.use('/sav', require('./sav/routes/sav.route'));
apiRouter.use('/education', require('./education/routes/education.route'));
apiRouter.use('/iot', require('./iot/routes/iot.route'));
apiRouter.use('/technician', require('./technician/routes/technician.route'));
apiRouter.use('/group-purchases', require('./group-purchase/routes/groupPurchase.route'));
apiRouter.use('/reports', require('./report/routes/report.route'));
apiRouter.use('/webinars', require('./webinar/routes/webinar.route'));
apiRouter.use('/certifications', require('./certification/routes/certification.route'));
apiRouter.use('/deletion-history', require('./deletion-log/routes/deletionLog.route'));
apiRouter.use('/audit-logs', require('./audit-log/routes/auditLog.route'));
apiRouter.use('/rfq', require('./rfq/routes/rfq.route'));
apiRouter.use('/product-questions', require('./product-question/routes/productQuestion.route'));
apiRouter.use('/coupons', require('./coupon/routes/coupon.route'));
apiRouter.use('/product-variants', require('./product-variant/routes/productVariant.route'));
apiRouter.use('/partner-stock', require('./partner-stock/routes/partnerStock.route'));
apiRouter.use('/price-index', require('./price-index/routes/priceIndex.route'));

// Montage du routeur sur le préfixe /api
app.use('/api', apiRouter);

// ─── Gestion des erreurs standardisée ────────────────────────────────────────

// 404
app.use((req, res, next) => {
    next(new AppError(`Route introuvable : ${req.method} ${req.url} (Standard BCA v2.6)`, 404));
});

// Middleware global de gestion d'erreurs
app.use(globalErrorHandler);

module.exports = app;
// Force restart
