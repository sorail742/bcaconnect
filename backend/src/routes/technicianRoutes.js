const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const technicianController = require('../controllers/technicianController');

// All routes require the user to be logged in and have the TECHNICIEN role
router.use(authMiddleware);
router.use(roleMiddleware(['technicien']));

// Get available missions
router.get('/missions/available', technicianController.getAvailableMissions);

// Get my accepted missions
router.get('/missions/my', technicianController.getMyMissions);

// Accept a mission
router.put('/missions/:id/accept', technicianController.acceptMission);

// Complete a mission
router.put('/missions/:id/complete', technicianController.completeMission);

// Get equipment history related to my missions
router.get('/equipments', technicianController.getTechnicianEquipments);

module.exports = router;
