const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { validateRequest } = require('../../middlewares/dtoValidator');
const vendorScorecardController = require('../controller/vendorScorecard.controller');

// Public — comme le badge de vérification, préqualification visible par tout
// acheteur avant de commander (analyse concurrentielle #6).
router.get('/:vendorId', [param('vendorId').isUUID(), validateRequest], vendorScorecardController.getScorecard);

module.exports = router;
