const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { authMiddleware, optionalAuth, grantAccess } = require('../middlewares/authMiddleware');

router.get('/', optionalAuth, educationController.getAllResources);
router.get('/admin', authMiddleware, grantAccess('manage_education'), educationController.getAllAdmin);
router.post('/', authMiddleware, grantAccess('manage_education'), educationController.create);
router.put('/:id', authMiddleware, grantAccess('manage_education'), educationController.update);
router.delete('/:id', authMiddleware, grantAccess('manage_education'), educationController.delete);

module.exports = router;
