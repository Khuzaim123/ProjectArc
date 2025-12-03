const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        await authService.registerUser({ name, email, password });

        successResponse(res, 201, 'Registration successful. Please check your email for verification OTP.', {
            email,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { user, accessToken, refreshToken } = await authService.loginUser(
            email,
            password
        );

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        successResponse(res, 200, 'Login successful', {
            user,
            accessToken,
        });
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return errorResponse(res, 401, error.message);
        }
        if (error.code === 'EMAIL_NOT_VERIFIED') {
            return errorResponse(res, 403, 'Please verify your email before logging in');
        }
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return errorResponse(res, 401, 'No refresh token provided');
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await authService.refreshAccessToken(refreshToken);

        // Set new refresh token as httpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        successResponse(res, 200, 'Token refreshed successfully', {
            accessToken,
        });
    } catch (error) {
        return errorResponse(res, 401, error.message);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        await authService.logoutUser(refreshToken);

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        successResponse(res, 200, 'Logout successful');
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user._id);

        successResponse(res, 200, 'User retrieved successfully', { user });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        await authService.verifyEmail(email, otp);

        successResponse(res, 200, 'Email verified successfully. You can now login.');
    } catch (error) {
        return errorResponse(res, 400, error.message);
    }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        const result = await authService.resendVerificationOTP(email);

        successResponse(res, 200, result.message);
    } catch (error) {
        return errorResponse(res, 400, error.message);
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const result = await authService.forgotPassword(email);

        successResponse(res, 200, result.message);
    } catch (error) {
        return errorResponse(res, 400, error.message);
    }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const { resetToken } = await authService.verifyResetOTP(email, otp);

        successResponse(res, 200, 'OTP verified successfully', { resetToken });
    } catch (error) {
        return errorResponse(res, 400, error.message);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        const result = await authService.resetPassword(resetToken, newPassword);

        successResponse(res, 200, result.message);
    } catch (error) {
        return errorResponse(res, 400, error.message);
    }
};

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    validate,
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

const verifyEmailValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
    validate,
];

const resendOTPValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate,
];

const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate,
];

const verifyResetOTPValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
    validate,
];

const resetPasswordValidation = [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    validate,
];

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    verifyEmail,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    registerValidation,
    loginValidation,
    verifyEmailValidation,
    resendOTPValidation,
    forgotPasswordValidation,
    verifyResetOTPValidation,
    resetPasswordValidation,
};
