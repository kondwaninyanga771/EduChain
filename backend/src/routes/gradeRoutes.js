const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only Lecturers can grade
router.post('/', authenticate, authorize('LECTURER'), gradeController.gradeSubmission);

module.exports = router;
