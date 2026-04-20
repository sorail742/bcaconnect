const jwtService = require('../services/jwtService');
const refreshTokenService = require('../services/refreshTokenService');
const { hasPermission } = require('../config/permissions');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Aucun jeton fourni." });
    }

    try {
        // Vérifier l'algorithme (protection contre alg:none)
        jwtService.validateAlgorithm(token);
        
        // Vérifier et décoder le token avec RS256
        const decoded = jwtService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.warn(`⚠️ Tentative d'accès avec token invalide: ${error.message}`);
        res.status(401).json({ message: "Jeton invalide ou expiré." });
    }
};

/**
 * Middleware de vérification des permissions (RBAC)
 * @param {string} permission - La permission requise
 */
const grantAccess = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié." });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                message: `Action refusée pour le rôle ${req.user.role} (Manque la permission : ${permission})`
            });
        }
        next();
    };
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
            jwtService.validateAlgorithm(token);
            req.user = jwtService.verifyToken(token);
        } catch (_) {
            // Token invalide ignoré
        }
    }
    next()
};

module.exports = { authMiddleware, protect, authorize, optionalAuth, grantAccess };
