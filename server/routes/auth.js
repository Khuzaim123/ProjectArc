const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post(
    '/register',
    authLimiter,
    authController.registerValidation,
    authController.register
);

router.post(
    '/login',
    authLimiter,
    authController.loginValidation,
    authController.login
);

router.post('/refresh', authController.refreshToken);

router.post(
    '/verify-email',
    authLimiter,
    authController.verifyEmailValidation,
    authController.verifyEmail
);

router.post(
    '/resend-otp',
    authLimiter,
    authController.resendOTPValidation,
    authController.resendOTP
);

router.post(
    '/forgot-password',
    authLimiter,
    authController.forgotPasswordValidation,
    authController.forgotPassword
);

router.post(
    '/verify-reset-otp',
    authLimiter,
    authController.verifyResetOTPValidation,
    authController.verifyResetOTP
);

router.post(
    '/reset-password',
    authLimiter,
    authController.resetPasswordValidation,
    authController.resetPassword
);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
