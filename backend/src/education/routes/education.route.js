const express = require('express');
const router = express.Router();
const educationController = require('../controller/education.controller');
const { authMiddleware, optionalAuth, grantAccess } = require('../../middlewares/authMiddleware');

router.get('/', optionalAuth, educationController.getAllResources);
router.get('/admin', authMiddleware, grantAccess('manage_education'), educationController.getAllAdmin);
router.get('/progress/me', authMiddleware, educationController.getMyProgress);
router.post('/', authMiddleware, grantAccess('manage_education'), educationController.create);
router.put('/:id', authMiddleware, grantAccess('manage_education'), educationController.update);
router.delete('/:id', authMiddleware, grantAccess('manage_education'), educationController.delete);

// Formation interactive — quiz & progression (cahier des charges 3.14)
router.post('/:id/view', authMiddleware, educationController.markViewed);
router.get('/:id/quiz', authMiddleware, educationController.getQuizForLearner);
router.post('/:id/quiz/submit', authMiddleware, educationController.submitQuiz);
router.get('/:id/quiz/admin', authMiddleware, grantAccess('manage_education'), educationController.getQuizForAdmin);
router.put('/:id/quiz', authMiddleware, grantAccess('manage_education'), educationController.upsertQuiz);

module.exports = router;
