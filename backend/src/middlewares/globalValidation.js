const { body, validationResult } = require("express-validator");
const xss = require("xss");

/**
 * Middleware Global de Validation & Sanitization
 * Appliqué à TOUTES les requêtes pour une protection maximale
 */

// Helper pour formater les erreurs de manière consistante (Standard BCA v2.6)
const sendValidationError = (res, field, message, location = "body") => {
  return res.status(422).json({
    message: "Validation des données échouée",
    errors: [{ field, message, location }],
    timestamp: new Date().toISOString(),
  });
};

/**
 * 1. Middleware de Sanitization Globale
 */
const globalSanitization = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    const sensitiveFields = [
      "mot_de_passe",
      "password",
      "token",
      "secret",
      "two_factor_secret",
    ];
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string" && !sensitiveFields.includes(key)) {
        req.body[key] = xss(req.body[key]);
        req.body[key] = req.body[key].trim();
      }
    }
  }

  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === "string") {
        req.query[key] = xss(req.query[key]).trim();
      }
    }
  }

  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === "string") {
        req.params[key] = xss(req.params[key]).trim();
      }
    }
  }

  next();
};

/**
 * 2. Middleware de Validation Globale (Headers & Size)
 */
const globalValidation = (req, res, next) => {
  // Vérifier Content-Type pour les requêtes de mutation
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];
    const contentLength = parseInt(req.headers["content-length"] || 0);

    // Si on a un corps de message, on DOIT avoir un Content-Type valide
    if (contentLength > 0) {
      if (!contentType) {
        return res.status(400).json({
          message: "Content-Type header requis",
          error: "Content-Type manquant",
        });
      }

      if (
        !contentType.includes("application/json") &&
        !contentType.includes("multipart/form-data") &&
        !contentType.includes("application/x-www-form-urlencoded")
      ) {
        return res.status(415).json({
          message: "Content-Type non supporté",
          error: "Utilisez application/json ou multipart/form-data",
        });
      }
    }
  }

  const contentLength = parseInt(req.headers["content-length"] || 0);
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      message: "Payload trop volumineux",
      error: `Taille maximale: ${maxSize / 1024 / 1024}MB`,
    });
  }

  next();
};

/**
 * 3. Middleware de Gestion des Erreurs de Validation (express-validator)
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      value: error.value,
      message: error.msg,
      location: error.location,
    }));

    return res.status(422).json({
      message: "Validation des données échouée",
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * 4. Middleware de Validation des Paramètres UUID
 */
const validateUUIDParams = (req, res, next) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const key of Object.keys(req.params)) {
    if (
      /(^id$|_id$)/.test(key) &&
      req.params[key] &&
      !uuidRegex.test(req.params[key])
    ) {
      return sendValidationError(
        res,
        key,
        `${key} doit être un UUID valide`,
        "params",
      );
    }
  }

  next();
};

/**
 * 5. Middleware de Validation des Limites de Pagination
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (page < 1) {
    return sendValidationError(
      res,
      "page",
      "page doit être supérieur à 0",
      "query",
    );
  }

  if (limit < 1 || limit > 100) {
    return sendValidationError(
      res,
      "limit",
      "limit doit être entre 1 et 100",
      "query",
    );
  }

  req.pagination = { page, limit, offset: (page - 1) * limit };
  next();
};

/**
 * 6. Middleware de Validation des Montants Monétaires
 */
const validateMonetaryAmounts = (req, res, next) => {
  const monetaryFields = [
    "montant",
    "prix",
    "solde",
    "budget",
    "montant_principal",
  ];

  for (const key of Object.keys(req.body || {})) {
    if (monetaryFields.some((field) => key.toLowerCase().includes(field))) {
      const value = req.body[key];

      if (typeof value === "number") {
        if (value.toString().split(".")[1]?.length > 2) {
          return sendValidationError(
            res,
            key,
            `${key} ne peut avoir plus de 2 décimales`,
          );
        }

        if (value < 0 || value > 9999999999.99) {
          return sendValidationError(
            res,
            key,
            `${key} doit être entre 0 et 9,999,999,999.99`,
          );
        }
      }
    }
  }

  next();
};

/**
 * 7. Middleware de Validation des Dates
 */
const validateDates = (req, res, next) => {
  const dateFields = [
    "date",
    "date_debut",
    "date_fin",
    "date_creation",
    "date_modification",
  ];

  for (const key of Object.keys(req.body || {})) {
    if (dateFields.some((field) => key.toLowerCase().includes(field))) {
      const value = req.body[key];

      if (value && typeof value === "string") {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
          return sendValidationError(
            res,
            key,
            `${key} doit être au format ISO 8601`,
          );
        }

        const now = new Date();
        const maxPastDate = new Date(now.getFullYear() - 100, 0, 1);
        const maxFutureDate = new Date(now.getFullYear() + 100, 11, 31);

        if (date < maxPastDate || date > maxFutureDate) {
          return sendValidationError(
            res,
            key,
            `${key} doit être une date raisonnable`,
          );
        }
      }
    }
  }

  next();
};

/**
 * 8. Middleware de Validation des Énumérations
 */
const validateEnums = (req, res, next) => {
  const enums = {
    role: [
      "client",
      "fournisseur",
      "transporteur",
      "admin",
      "banque",
      "technicien",
    ],
    statut: [
      // Statuts utilisateur génériques
      "actif",
      "inactif",
      "bloque",
      "supprime",
      "suspendu",
      // Statuts commandes & articles (flux Vendeur)
      "en_attente",
      "confirme",
      "prepare",
      "expedie",
      "livre",
      "annule",
      "retourne",
      // Statuts livraison (flux Transporteur)
      "pret",
      "ramasse",
      "en_route",
      // Statuts litiges & support
      "ouvert",
      "resolu",
      "rejete",
      "en_cours",
      "en_mediation",
      "ferme",
      // Statuts paiement
      "complete",
      "echoue",
      "terminé",
    ],
    statut_commande: [
      "en_attente",
      "confirmee",
      "expediee",
      "livree",
      "annulee",
    ],
    statut_paiement: ["en_attente", "complete", "echouee", "remboursee"],
    methode_paiement: [
      "mobile_money",
      "carte_bancaire",
      "portefeuille",
      "crypto",
      "virement",
    ],
    type_litige: ["qualite", "livraison", "paiement", "autre"],
    type_vehicule: ["moto", "voiture", "camion", "velo", "autre"],
  };

  for (const key of Object.keys(req.body || {})) {
    if (enums[key] && req.body[key]) {
      if (!enums[key].includes(req.body[key])) {
        return sendValidationError(
          res,
          key,
          `Valeur invalide pour ${key}. Attendu: ${enums[key].join(", ")}`,
        );
      }
    }
  }

  next();
};

/**
 * 9. Middleware de Validation des Tableaux
 */
const validateArrays = (req, res, next) => {
  const arrayFields = ["items", "images", "fichiers", "tags", "categories"];

  for (const key of Object.keys(req.body || {})) {
    if (arrayFields.some((field) => key.toLowerCase().includes(field))) {
      const value = req.body[key];

      if (value !== undefined && !Array.isArray(value)) {
        return sendValidationError(res, key, `${key} doit être un tableau`);
      }

      if (Array.isArray(value) && value.length > 1000) {
        return sendValidationError(
          res,
          key,
          `${key} trop volumineux (max 1000)`,
        );
      }
    }
  }

  next();
};

/**
 * 10. Middleware de Validation des Objets Imbriqués
 */
const validateNestedObjects = (req, res, next) => {
  const validateObject = (obj, path = "") => {
    if (typeof obj !== "object" || obj === null) return true;

    for (const key in obj) {
      const fullPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const depth = fullPath.split(".").length;
        if (depth > 5) return false;
        if (!validateObject(value, fullPath)) return false;
      }
    }
    return true;
  };

  if (!validateObject(req.body)) {
    return sendValidationError(
      res,
      "body",
      "Profondeur d'objet excessive (max 5)",
    );
  }

  next();
};

/**
 * Middleware Composite: Applique toutes les validations
 */
const globalValidationMiddleware = [
  globalSanitization,
  globalValidation,
  validateUUIDParams,
  validateMonetaryAmounts,
  validateDates,
  validateEnums,
  validateArrays,
  validateNestedObjects,
  handleValidationErrors,
];

module.exports = {
  globalSanitization,
  globalValidation,
  handleValidationErrors,
  validateUUIDParams,
  validatePagination,
  validateMonetaryAmounts,
  validateDates,
  validateEnums,
  validateArrays,
  validateNestedObjects,
  globalValidationMiddleware,
};
