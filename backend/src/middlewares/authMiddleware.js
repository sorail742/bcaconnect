const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Aucun jeton fourni." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Jeton invalide ou expiré." });
    }
};

// Middleware pour vérifier les rôles : accepte string ou tableau
const authorize = (...roles) => {
    // Aplatir si un tableau est passé directement
    const allowedRoles = roles.flat();
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié." });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Accès interdit pour le rôle : ${req.user.role}`
            });
        }
        next();
    };
};

// protect = alias de authMiddleware (compatibilité avec les nouvelles routes)
const protect = authMiddleware;

// optionalAuth : tente de décoder le token sans bloquer si absent
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (_) {
            // Token invalide ignoré
        }
    }
    next();
};

module.exports = { authMiddleware, protect, authorize, optionalAuth };
