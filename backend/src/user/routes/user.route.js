const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const { authMiddleware, grantAccess } = require('../../middlewares/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/avatars');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format d\'image non supporté'));
        }
    }
});

// Toutes ces routes nécessitent l'authentification
router.use(authMiddleware);

// Recherche publique pour la messagerie (Ouvert à tous les membres)
router.get('/public_search', userController.getPublicUsers);

// Upload d'avatar par l'utilisateur connecté
router.post('/avatar', uploadAvatar.single('file'), userController.updateAvatar);

router.use(grantAccess('manage_users'));

router.get('/', userController.getAll);
router.get('/admin/locations', userController.getUserLocations);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/status', userController.updateStatus);

module.exports = router;
