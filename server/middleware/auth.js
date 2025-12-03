const { verifyAccessToken } = require('../utils/tokenUtils');
const { errorResponse } = require('../utils/responseUtils');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return errorResponse(res, 401, 'Not authorized, no token provided');
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return errorResponse(res, 401, 'Not authorized, invalid token');
        }

        // Get user from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return errorResponse(res, 401, 'User not found');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return errorResponse(res, 401, 'Not authorized, token failed');
    }
};

module.exports = { protect };
