const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Multer pour les pièces jointes des messages
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/messages');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const ALLOWED_MIME = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp4'
];

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Type de fichier non supporté'));
    }
});

router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversations', messageController.getConversations);
router.post('/conversations/start', messageController.startConversation);
router.get('/:conversationId/messages', messageController.getMessages);
router.post('/send', upload.single('file'), messageController.sendMessage);
router.patch('/:conversationId/read', messageController.markAsRead);

module.exports = router;
