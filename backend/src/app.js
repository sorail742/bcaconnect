const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const auditMiddleware = require('./middlewares/auditMiddleware');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddleware');
const responseTimeMiddleware = require('./middlewares/responseTime');

const path = require('path');
const app = express();

// ─── Sécurité & Performance ─────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuré précisément (domaines autorisés)
const CORS_ORIGINS = process.env.NODE_ENV === 'production'
    ? ['https://bcaconnect-backend.onrender.com', 'https://bcaconnect.onrender.com', 'https://bcaconnect.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression gzip (réduit la taille des réponses de ~70%)
app.use(compression());

// Logging des requêtes HTTP (format court en dev, combiné en prod)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing JSON avec limite de taille (protection contre les payloads géants)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Monitoring du temps de réponse
app.use(responseTimeMiddleware);

// Sanitisation des inputs malveillants (XSS, NoSQL Injection)
app.use(sanitizeMiddleware);

// ─── Rate Limiting par zone ──────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, // Plus strict pour le login/register
    message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Audit des actions sensibles ─────────────────────────────────────────────
app.use(auditMiddleware);

// ─── Route de santé ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.5',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur l'API BCA Connect 🚀 v2.5" });
});

// ─── Routes API ───────────────────────────────────────────────────────────────
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

// Service des fichiers statiques avec CORS
app.use('/uploads', cors(), express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// ─── Gestion des 404 ─────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// ─── Gestion globale des erreurs ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`[ERROR] ${err.message}`);
    res.status(status).json({
        message: err.message || 'Une erreur interne est survenue',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            original: err.original,
        }),
    });
});

module.exports = app;
