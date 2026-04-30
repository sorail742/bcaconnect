const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const auditMiddleware = require('./middlewares/auditMiddleware');
const { globalValidationMiddleware, validatePagination } = require('./middlewares/globalValidation');
const { sequelize } = require('./models');

const app = express();
const path = require('path');

// ─── Servir les fichiers statiques (Uploads) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Sécurité : CORS (Standard BCA v2.6) ────────────────────────────────────
const allowedOrigins = [
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
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
    contentSecurityPolicy: false // Désactivé pour faciliter le dev avec images Unsplash/AWS
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
app.get('/health', (req, res) => {
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

apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/categories', require('./routes/categoryRoutes'));
apiRouter.use('/stores', require('./routes/storeRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/products', require('./routes/productRoutes'));
apiRouter.use('/orders', require('./routes/orderRoutes'));
apiRouter.use('/payments', require('./routes/paymentRoutes'));
apiRouter.use('/wallet', require('./routes/walletRoutes'));
apiRouter.use('/delivery', require('./routes/deliveryRoutes'));
apiRouter.use('/ai', require('./routes/aiRoutes'));
apiRouter.use('/ads', require('./routes/adRoutes'));
apiRouter.use('/disputes', require('./routes/disputeRoutes'));
apiRouter.use('/credits', require('./routes/creditRoutes'));
apiRouter.use('/stats', require('./routes/statRoutes'));
apiRouter.use('/support', require('./routes/supportRoutes'));
apiRouter.use('/upload', require('./routes/uploadRoutes'));
apiRouter.use('/notifications', require('./routes/notificationRoutes'));
apiRouter.use('/messages', require('./routes/messageRoutes'));
apiRouter.use('/reviews', require('./routes/reviewRoutes'));

// Montage du routeur sur le préfixe /api
app.use('/api', apiRouter);

// ─── Gestion des erreurs standardisée ────────────────────────────────────────

// 404
app.use((req, res) => {
    console.log(`⚠️ Route introuvable : ${req.method} ${req.url}`);
    res.status(404).json({ 
        message: 'Route introuvable (Standard BCA v2.6)',
        path: req.url 
    });
});

// Erreurs 500
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`🔴 ERREUR SERVEUR [${req.method} ${req.url}]:`, err.message);
    if (status === 500) console.error(err.stack);

    res.status(status).json({
        message: status === 500 ? 'Une erreur interne est survenue (Standard BCA v2.6)' : err.message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        code: err.code || 'SERVER_ERROR'
    });
});

module.exports = app;
// Force restart
