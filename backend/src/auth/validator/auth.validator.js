const { body } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');

const validateRegister = [
  body("nom_complet")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom doit faire entre 2 et 100 caractères.")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage(
      "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes.",
    ),
  body("email")
    .isEmail()
    .withMessage("Format d'email invalide.")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email trop long (max 255 caractères)."),
  body("telephone")
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Le numéro de téléphone est invalide (min 8 chiffres).")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Le numéro de téléphone contient des caractères invalides."),
  body("role")
    .isIn([
      "client",
      "fournisseur",
      "transporteur",
      "technicien",
    ])
    .withMessage(
      "Rôle invalide. Choisissez client, fournisseur, transporteur ou technicien.",
    ),
  body("mot_de_passe")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit faire au moins 8 caractères.")
    .matches(/\d/)
    .withMessage("Le mot de passe doit contenir au moins un chiffre.")
    .matches(/[A-Z]/)
    .withMessage("Le mot de passe doit contenir au moins une majuscule.")
    .matches(/[a-z]/)
    .withMessage("Le mot de passe doit contenir au moins une minuscule."),
  body("nom_boutique")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom de la boutique doit faire entre 2 et 100 caractères."),
  body("description_boutique")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("La description ne doit pas dépasser 500 caractères."),
  body("adresse_boutique")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("L'adresse ne doit pas dépasser 255 caractères."),
  body("categorie_activite")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("La catégorie ne doit pas dépasser 100 caractères."),
  body("registre_commerce")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Le registre de commerce ne doit pas dépasser 50 caractères."),
  body("type_vehicule")
    .optional()
    .isIn(["moto", "voiture", "camion", "velo", "autre"])
    .withMessage("Type de véhicule invalide."),
  body("numero_permis")
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Le numéro de permis est invalide."),
  body("zone_couverture")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("La zone de couverture est invalide."),
  body("adresse")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("L'adresse ne doit pas dépasser 255 caractères."),
  // Technicien‑spécifique champs optionnels ou requis selon le rôle

  body("numero_agrement")
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage("Numéro d'agrément trop long.")
    .trim(),
  body("specialites")
    .if(body("role").equals("technicien"))
    .notEmpty()
    .withMessage("Spécialité requise pour les techniciens.")
    .isIn(require("../../constants/technicianSpecialties").TECHNICIAN_SPECIALTIES)
    .withMessage("Spécialité invalide. Veuillez choisir dans la liste proposée.")
    .trim(),
  body("zone_intervention")
    .if(body("role").equals("technicien"))
    .notEmpty()
    .withMessage("Zone d'intervention requise pour les techniciens.")
    .isLength({ max: 255 })
    .withMessage("Zone d'intervention trop longue.")
    .trim(),
  validateRequest,
];

const validateLogin = [
  body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
  body("mot_de_passe")
    .notEmpty()
    .withMessage("Mot de passe requis.")
    .isLength({ min: 8 })
    .withMessage("Mot de passe invalide."),
  validateRequest,
];

const validateGoogleLogin = [
  body("credential")
    .notEmpty()
    .withMessage("Jeton Google requis.")
    .isLength({ min: 10 })
    .withMessage("Jeton Google invalide."),
  validateRequest,
];

const validateRefreshToken = [
  body("userId")
    .notEmpty()
    .withMessage("ID utilisateur requis.")
    .isUUID()
    .withMessage("ID utilisateur invalide (doit être UUID)."),
  validateRequest,
];

const validateVerify2FA = [
  body("userId")
    .notEmpty()
    .withMessage("ID utilisateur requis.")
    .isUUID()
    .withMessage("ID utilisateur invalide."),
  body("code")
    .notEmpty()
    .withMessage("Code 2FA requis.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Code 2FA doit faire 6 chiffres.")
    .isNumeric()
    .withMessage("Code 2FA doit être numérique."),
  validateRequest,
];

const validateConfirm2FA = [
  body("code")
    .notEmpty()
    .withMessage("Code 2FA requis.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Code 2FA doit faire 6 chiffres.")
    .isNumeric()
    .withMessage("Code 2FA doit être numérique."),
  validateRequest,
];

const validateUpdateProfile = [
  body("nom_complet")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom doit faire entre 2 et 100 caractères."),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Format d'email invalide.")
    .normalizeEmail(),
  body("telephone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Le numéro de téléphone est invalide.")
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage("Le numéro de téléphone contient des caractères invalides."),
  body("mot_de_passe")
    .optional({ checkFalsy: true })
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit faire au moins 8 caractères.")
    .matches(/\d/)
    .withMessage("Le mot de passe doit contenir au moins un chiffre."),
  body("avatar_url")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("URL de l'avatar invalide."),
  validateRequest,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateGoogleLogin,
  validateRefreshToken,
  validateVerify2FA,
  validateConfirm2FA,
  validateUpdateProfile,
};
