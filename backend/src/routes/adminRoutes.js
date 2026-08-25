const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Mount routes, requiring both authentication and ADMIN authorization
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardData);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Course Management
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Program Management
router.get('/programs', adminController.getPrograms);

// Enrollment Management
router.get('/enrollments/pending', adminController.getPendingEnrollments);
router.put('/enrollments/:studentId/:courseId', adminController.updateEnrollmentStatus);

// System Logs
router.get('/logs', adminController.getSystemLogs);

// Transactions
router.get('/transactions', adminController.getTransactions);

// Analytics
router.get('/analytics', adminController.getAnalyticsData);

// Settings
router.put('/settings/password', adminController.updatePassword);

module.exports = router;
