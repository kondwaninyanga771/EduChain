const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Students submit assignments
router.post('/', authenticate, authorize('STUDENT'), upload.single('file'), submissionController.submitAssignment);

// Lecturers view submissions
router.get('/assessment/:assessmentId', authenticate, authorize('LECTURER', 'ADMIN'), submissionController.getSubmissionsByAssessment);

module.exports = router;
