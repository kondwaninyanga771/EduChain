const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Protect all student routes
router.use(authenticate);
router.use(authorize('STUDENT'));

// Dashboard route
router.get('/dashboard', studentController.getStudentDashboardData);

// Courses routes
router.get('/courses/available', studentController.getAvailableCourses);
router.get('/courses/enrolled', studentController.getEnrolledCourses);
router.post('/courses/enroll', studentController.enrollInCourse);

// Assessments route
router.get('/assessments', studentController.getStudentAssessments);
router.get('/assessments/:id', studentController.getStudentAssessmentDetails);

// Submissions route
router.get('/submissions', studentController.getStudentSubmissions);

// Results route
router.get('/results', studentController.getStudentResults);

// Profile routes
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.put('/profile/password', studentController.updatePassword);

// Verification route
router.get('/verify', studentController.verifyTransaction);

module.exports = router;
