const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Only Lecturers can manage assessments
router.post('/', authenticate, authorize('LECTURER', 'ADMIN'), upload.single('file'), assessmentController.createAssessment);
router.put('/:id', authenticate, authorize('LECTURER', 'ADMIN'), assessmentController.updateAssessment);
router.delete('/:id', authenticate, authorize('LECTURER', 'ADMIN'), assessmentController.deleteAssessment);

// Students can view assessments
router.get('/course/:courseId', authenticate, assessmentController.getAssessmentsByCourse);

module.exports = router;
