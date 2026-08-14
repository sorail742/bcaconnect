const express = require('express');
const router = express.Router();
const alertThresholdController = require('../controller/alertThreshold.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateCreate, validateToggle, validateIdParam } = require('../validator/alertThreshold.validator');

router.get('/mine', protect, alertThresholdController.listMine);
router.post('/', protect, validateCreate, alertThresholdController.createOrUpdate);
router.patch('/:id/toggle', protect, validateToggle, alertThresholdController.toggle);
router.delete('/:id', protect, validateIdParam, alertThresholdController.remove);

module.exports = router;
