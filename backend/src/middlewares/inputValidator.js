/**
 * Helpers de validation pour les routes critiques.
 * Usage: router.post('/route', validateRegister, controller.action)
 */

const validateRegister = (req, res, next) => {
    const { nom_complet, email, telephone, mot_de_passe, role } = req.body;
    const errors = [];

    if (!nom_complet || nom_complet.trim().length < 2) errors.push('Nom complet invalide.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email invalide.');
    if (!telephone || telephone.length < 8) errors.push('Téléphone invalide.');
    if (!mot_de_passe || mot_de_passe.length < 6) errors.push('Mot de passe trop court (min 6 caractères).');
    if (!role || !['client', 'fournisseur', 'transporteur'].includes(role)) errors.push('Rôle invalide.');

    if (errors.length > 0) {
        return res.status(422).json({ message: 'Données invalides', errors });
    }
    next();
};

const validateCreditRequest = (req, res, next) => {
    const { montant, duree_mois } = req.body;
    const errors = [];

    if (!montant || isNaN(montant) || montant < 10000) errors.push('Montant minimum : 10 000 GNF.');
    if (!duree_mois || isNaN(duree_mois) || duree_mois < 1 || duree_mois > 60) errors.push('Durée entre 1 et 60 mois.');

    if (errors.length > 0) {
        return res.status(422).json({ message: 'Données invalides', errors });
    }
    next();
};

const validateOrderCreate = (req, res, next) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(422).json({ message: 'La commande doit contenir au moins un article.' });
    }
    next();
};

module.exports = { validateRegister, validateCreditRequest, validateOrderCreate };
