const express = require('express');
const router = express.Router();
const { authMiddleware, grantAccess } = require('../../middlewares/authMiddleware');
const savController = require('../controller/sav.controller');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour les photos SAV
const savStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/sav');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `sav-${unique}${path.extname(file.originalname)}`);
    }
});

const uploadSavPhotos = multer({
    storage: savStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB par photo
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont acceptées pour les photos SAV'));
        }
    }
});

// ─── Routes client ────────────────────────────────────────────────────────────
// Récupérer les garanties de l'utilisateur connecté
router.get('/guarantees', authMiddleware, savController.getMyGuarantees);

// Demander une intervention (avec photos optionnelles, max 3)
router.post('/interventions', authMiddleware, uploadSavPhotos.array('photos', 3), savController.requestIntervention);

// Récupérer les interventions de l'utilisateur connecté
router.get('/interventions', authMiddleware, savController.getMyInterventions);

// ─── Routes Admin ─────────────────────────────────────────────────────────────
// Lister toutes les interventions (admin seulement)
router.get('/admin/interventions', authMiddleware, grantAccess('manage_users'), savController.getAllInterventions);

// Modifier le statut / technicien d'une intervention (admin)
router.patch('/admin/interventions/:id', authMiddleware, grantAccess('manage_users'), savController.updateInterventionStatus);

module.exports = router;
