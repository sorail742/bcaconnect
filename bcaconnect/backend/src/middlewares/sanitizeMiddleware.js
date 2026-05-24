/**
 * Middleware de sanitisation des inputs.
 * Nettoie les champs body/query pour prévenir les injections XSS et NoSQL.
 */
const sanitizeInput = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const dangerous = ['$where', '$gt', '$lt', '$regex', '$ne'];

    for (const key in obj) {
        if (dangerous.includes(key)) {
            delete obj[key];
        } else if (typeof obj[key] === 'string') {
            // Neutraliser les balises HTML dangereuses
            obj[key] = obj[key]
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        } else if (typeof obj[key] === 'object') {
            sanitizeInput(obj[key]);
        }
    }
    return obj;
};

const sanitizeMiddleware = (req, res, next) => {
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);
    next();
};

module.exports = sanitizeMiddleware;
