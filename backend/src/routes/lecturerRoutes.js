const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Dashboard data
router.get('/dashboard', authenticate, lecturerController.getLecturerDashboardData);

// Courses list
router.get('/courses', authenticate, lecturerController.getLecturerCourses);

// Assessments list
router.get('/assessments', authenticate, lecturerController.getLecturerAssessments);

// Submissions / Grade Center list
router.get('/submissions', authenticate, lecturerController.getLecturerSubmissions);
router.get('/submissions/:id', authenticate, lecturerController.getSubmissionDetails);
router.post('/submissions/:id/grade', authenticate, lecturerController.gradeSubmission);

// Published Results
router.get('/results', authenticate, lecturerController.getLecturerPublishedResults);

// Blockchain Records
router.get('/records', authenticate, lecturerController.getLecturerRecords);

// Profile routes (reusing generic logic from studentController)
router.get('/profile', authenticate, studentController.getProfile);
router.put('/profile', authenticate, studentController.updateProfile);
router.put('/profile/password', authenticate, studentController.updatePassword);

module.exports = router;
