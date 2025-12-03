const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash an OTP for secure storage
 * @param {string} otp - Plain OTP to hash
 * @returns {string} Hashed OTP
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify an OTP against its hash
 * @param {string} plainOTP - Plain OTP entered by user
 * @param {string} hashedOTP - Stored hashed OTP
 * @returns {boolean} True if OTP matches
 */
const verifyOTP = (plainOTP, hashedOTP) => {
    const hashOfPlain = hashOTP(plainOTP);
    return hashOfPlain === hashedOTP;
};

/**
 * Check if OTP has expired
 * @param {Date} expiryDate - OTP expiry date
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

/**
 * Get OTP expiry time (10 minutes from now)
 * @returns {Date} Expiry date
 */
const getOTPExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
    isOTPExpired,
    getOTPExpiry,
};
