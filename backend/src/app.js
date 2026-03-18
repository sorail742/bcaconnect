const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur l'API BCA Connect 🚀" });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Une erreur interne est survenue",
        error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack, original: err.original } : {}
    });
});

module.exports = app;
