const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, grantAccess } = require('../middlewares/authMiddleware');

// Toutes ces routes sont réservées aux administrateurs (ou ceux ayant la permission)
router.use(authMiddleware);
router.use(grantAccess('manage_users'));

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/status', userController.updateStatus);

module.exports = router;
