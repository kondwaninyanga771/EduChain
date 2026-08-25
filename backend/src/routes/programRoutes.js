const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only Admins can manage programs
router.use(authenticate, authorize('ADMIN'));

router.get('/', programController.getAllPrograms);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

module.exports = router;
