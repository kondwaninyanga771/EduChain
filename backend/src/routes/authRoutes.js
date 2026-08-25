const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, resetPasswordValidation } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
// NOTE: CSRF middleware would typically wrap the app or specific router, 
// but for stateless APIs like login/register where you might not have a CSRF token yet,
// we apply it conditionally or handle it in app.js. 
// Standard practice is a separate GET endpoint to fetch the CSRF token.

router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Registration is now restricted to admins via /api/admin/users
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// Protected routes (require valid JWT access token)
router.get('/session-check', authenticate, (req, res) => res.json({ status: 'SUCCESS', valid: true }));
router.post('/logout-all', authenticate, authController.logoutAll);

module.exports = router;
