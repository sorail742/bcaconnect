const NodeCache = require('node-cache');

// TTL par défaut : 5 minutes (300 secondes)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Middleware factory de mise en cache.
 * @param {number} duration - Durée de vie du cache en secondes
 */
const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Ne pas cacher les requêtes authentifiées personnelles (my, me)
        if (req.path.includes('/me') || req.path.includes('/my')) {
            return next();
        }

        const key = `route_${req.originalUrl}`;
        const cached = cache.get(key);

        if (cached) {
            return res.json(cached);
        }

        // Intercepter res.json pour mettre en cache la réponse
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            if (res.statusCode === 200) {
                cache.set(key, data, duration);
            }
            return originalJson(data);
        };

        next();
    };
};

/**
 * Invalider une clé ou un préfixe de cache
 * @param {string} prefix
 */
const invalidateCache = (prefix) => {
    const keys = cache.keys().filter(k => k.includes(prefix));
    cache.del(keys);
};

module.exports = { cache, cacheMiddleware, invalidateCache };
