const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, attemptController.getAllAttempts);
router.get('/my-attempts', authenticate, attemptController.getMyAttempts);
router.post('/start', authenticate, authorizeRoles('student'), attemptController.startAttempt);
router.post('/:attemptId/answers', authenticate, attemptController.saveAnswer);
router.post('/:attemptId/submit', authenticate, attemptController.submitAttempt);
router.get('/:attemptId', authenticate, attemptController.getAttempt);
router.post('/:attemptId/grade', authenticate, authorizeRoles('admin', 'instructor'), attemptController.gradeAnswer);

module.exports = router;
