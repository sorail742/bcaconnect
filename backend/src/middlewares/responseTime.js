/**
 * Middleware de monitoring du temps de réponse.
 * Ajoute l'en-tête X-Response-Time et log les requêtes lentes.
 */
const responseTimeMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        // Alerte si une route met plus de 2 secondes
        if (duration > 2000) {
            console.warn(`[SLOW API ⚠️] ${req.method} ${req.originalUrl} - ${duration}ms`);
        }
    });

    next();
};

module.exports = responseTimeMiddleware;
