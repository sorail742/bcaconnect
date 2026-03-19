const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

// Toutes ces routes sont réservées aux administrateurs
router.use(authMiddleware);
router.use(authorize(['admin']));

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/status', userController.updateStatus);

module.exports = router;
