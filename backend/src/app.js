const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const path = require('path');
const cookieParser = require('cookie-parser');

const auditMiddleware = require('./middlewares/auditMiddleware');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddleware');
const responseTimeMiddleware = require('./middlewares/responseTime');
const logger = require('./utils/logger');

const app = express();

// ─── Monitoring (Sentry) ─────────────────────────────────────────────────────
// Note: Sentry.init est appelé dans instrument.js chargé au sommet de index.js

// Route de test Sentry — DÉVELOPPEMENT UNIQUEMENT
if (process.env.NODE_ENV === 'development') {
    app.get("/debug-sentry", function debugSentryHandler(req, res) {
        throw new Error("Sentry debug error — dev only");
    });
}

// ─── Sécurité & Performance ─────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // ✅ Fix: 'unsafe-inline' retiré — utilisez des nonces ou des hashes pour les scripts inline
            // Si Vite génère des scripts inline, gérez-les via vite-plugin-csp ou en externalisant les scripts
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", process.env.IMG_SRC_URL || "*"],
            connectSrc: ["'self'", "https:", process.env.API_URL || "*", process.env.WS_URL || "*"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

const CORS_ORIGINS = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Requis pour accepter les HitpOnly Cookies venant du Frontend
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(process.env.JWT_SECRET || 'bca-cookie-secret-alpha')); // Signature cryptographique locale des cookies

app.use(responseTimeMiddleware);
app.use(sanitizeMiddleware);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
});
app.use('/api/', globalLimiter);

// ─── Audit ───────────────────────────────────────────────────────────────────
app.use(auditMiddleware);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.6',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/credits', require('./routes/creditRoutes'));
app.use('/api/stats', require('./routes/statRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Gestion des erreurs ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

// The Sentry error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    logger.error(`[Express Error] ${req.method} ${req.url}`, {
        message: err.message,
        status,
        stack: err.stack,
        userId: req.user?.id
    });

    res.status(status).json({
        message: status === 500 ? 'Une erreur interne est survenue (Standard BCA v2.6)' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

module.exports = app;
