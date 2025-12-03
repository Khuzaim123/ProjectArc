const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenUtils');
const { generateOTP, hashOTP, getOTPExpiry } = require('../utils/otpUtils');
const { sendEmail, verificationOTPEmail } = require('./emailService');

// Register new user
const registerUser = async (userData) => {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Create user with OTP
    const user = await User.create({
        name,
        email,
        password,
        emailVerificationOTP: hashedOTP,
        emailVerificationOTPExpiry: getOTPExpiry(),
    });

    // Send verification email
    try {
        await sendEmail({
            to: email,
            subject: 'Verify Your Email - ProjectArc',
            html: verificationOTPEmail(name, otp),
        });
    } catch (error) {
        // If email fails, delete the user and throw error
        await User.deleteOne({ _id: user._id });
        throw new Error('Failed to send verification email. Please try again.');
    }

    return user;
};

// Login user
const loginUser = async (email, password) => {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
        const error = new Error('Email not verified');
        error.code = 'EMAIL_NOT_VERIFIED';
        throw error;
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt,
    });

    // Remove password from user object
    user.password = undefined;

    return { user, accessToken, refreshToken };
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
        throw new Error('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        userId: decoded.userId,
    });

    if (!storedToken) {
        throw new Error('Refresh token not found');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new Error('Refresh token expired');
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
        decoded.userId
    );

    // Delete old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Store new refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
};

// Logout user
const logoutUser = async (refreshToken) => {
    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
    }
};

// Get user by ID
const getUserById = async (userId) => {
    const user = await User.findById(userId).populate('workspaces');
    return user;
};

// Verify email with OTP
const verifyEmail = async (email, otp) => {
    const { verifyOTP, isOTPExpired } = require('../utils/otpUtils');

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationOTPExpiry');

    if (!user) {
        throw new Error('User not found');
    }

    if (user.isEmailVerified) {
        throw new Error('Email already verified');
    }

    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpiry) {
        throw new Error('No verification OTP found. Please request a new one.');
    }

    // Check if OTP is expired
    if (isOTPExpired(user.emailVerificationOTPExpiry)) {
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (!verifyOTP(otp, user.emailVerificationOTP)) {
        throw new Error('Invalid OTP');
    }

    // Mark email as verified and clear OTP fields
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    return user;
};

// Resend verification OTP
const resendVerificationOTP = async (email) => {
    const user = await User.findOne({ email }).select('+emailVerificationOTPExpiry');

    if (!user) {
        throw new Error('User not found');
    }

    if (user.isEmailVerified) {
        throw new Error('Email already verified');
    }

    // Check cooldown (1 minute)
    if (user.emailVerificationOTPExpiry && new Date() < new Date(user.emailVerificationOTPExpiry.getTime() - 9 * 60 * 1000)) {
        throw new Error('Please wait before requesting a new OTP');
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Update user with new OTP
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationOTPExpiry = getOTPExpiry();
    await user.save();

    // Send email
    await sendEmail({
        to: email,
        subject: 'Verify Your Email - ProjectArc',
        html: verificationOTPEmail(user.name, otp),
    });

    return { message: 'Verification OTP sent successfully' };
};

// Forgot password - send reset OTP
const forgotPassword = async (email) => {
    const { resetPasswordOTPEmail } = require('./emailService');

    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account exists with this email, you will receive a password reset OTP.' };
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // Save OTP to user
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpiry = getOTPExpiry();
    await user.save();

    // Send email
    await sendEmail({
        to: email,
        subject: 'Password Reset OTP - ProjectArc',
        html: resetPasswordOTPEmail(user.name, otp),
    });

    return { message: 'If an account exists with this email, you will receive a password reset OTP.' };
};

// Verify reset OTP
const verifyResetOTP = async (email, otp) => {
    const { verifyOTP, isOTPExpired } = require('../utils/otpUtils');
    const jwt = require('jsonwebtoken');

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpiry');

    if (!user) {
        throw new Error('Invalid request');
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
        throw new Error('No password reset request found');
    }

    // Check if OTP is expired
    if (isOTPExpired(user.resetPasswordOTPExpiry)) {
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    if (!verifyOTP(otp, user.resetPasswordOTP)) {
        throw new Error('Invalid OTP');
    }

    // Generate a temporary token for password reset (valid for 15 minutes)
    const resetToken = jwt.sign(
        { userId: user._id, purpose: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    return { resetToken };
};

// Reset password with token
const resetPassword = async (resetToken, newPassword) => {
    const jwt = require('jsonwebtoken');

    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        if (decoded.purpose !== 'password-reset') {
            throw new Error('Invalid reset token');
        }

        const user = await User.findById(decoded.userId).select('+resetPasswordOTP +resetPasswordOTPExpiry');

        if (!user) {
            throw new Error('User not found');
        }

        // Update password and clear reset OTP
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpiry = undefined;
        await user.save();

        return { message: 'Password reset successful' };
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw new Error('Invalid or expired reset token');
        }
        throw error;
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getUserById,
    verifyEmail,
    resendVerificationOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
};
