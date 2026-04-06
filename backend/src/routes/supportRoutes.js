const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Tickets SAV
router.post('/tickets', protect, supportController.createTicket);
router.get('/tickets/me', protect, supportController.getMyTickets);
router.put('/tickets/:id/resolve', protect, authorize('admin'), supportController.resolveTicket);

module.exports = router;
