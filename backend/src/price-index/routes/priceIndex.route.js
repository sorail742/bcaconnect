const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');
const priceIndexController = require('../controller/priceIndex.controller');

const validateMonths = [
    query('months').optional().isInt({ min: 1, max: 24 }).withMessage('months doit être entre 1 et 24.').toInt(),
];

// Public — transparence marché (analyse concurrentielle #8), aucune donnée sensible exposée
// (uniquement des moyennes de prix agrégées, pas de commande ni d'utilisateur individuel).
router.get('/category/:categorieId', [param('categorieId').isUUID(), ...validateMonths, validateRequest], priceIndexController.getByCategory);
router.get('/product/:produitId', [param('produitId').isUUID(), ...validateMonths, validateRequest], priceIndexController.getByProduct);

module.exports = router;
