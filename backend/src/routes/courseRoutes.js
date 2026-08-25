const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorize('ADMIN'), courseController.createCourse);
router.get('/', authenticate, courseController.getCourses);

router.post('/:id/enroll', authenticate, authorize('ADMIN', 'LECTURER'), courseController.enrollStudent);
router.post('/:id/assign', authenticate, authorize('ADMIN'), courseController.assignLecturer);

module.exports = router;
