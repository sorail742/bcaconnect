const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../../middlewares/authMiddleware');
const uploadController = require('../controller/upload.controller');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (pour les vidéos)
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|avif|svg|gif|mp4|webm|avi|mov|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        console.error(`🔴 UPLOAD REFUSÉ: Mimetype: ${file.mimetype}, Extension: ${path.extname(file.originalname)}`);
        cb(new Error("Format de fichier non supporté. Types autorisés: images, vidéos, pdf"));
    }
});

router.post('/', protect, upload.single('file'), uploadController.uploadFile);

module.exports = router;
