const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Tickets SAV
router.post('/tickets', protect, supportController.createTicket);
router.get('/tickets/me', protect, supportController.getMyTickets);
router.put('/tickets/:id/resolve', protect, authorize('admin'), supportController.resolveTicket);

// Avis & Feedback
router.post('/reviews', protect, supportController.createReview);

module.exports = router;
