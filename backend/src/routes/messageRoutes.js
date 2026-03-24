const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId/messages', messageController.getMessages);
router.post('/send', messageController.sendMessage);

module.exports = router;
