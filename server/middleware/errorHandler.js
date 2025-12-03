const { errorResponse } = require('../utils/responseUtils');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return errorResponse(res, 400, 'Validation Error', errors);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return errorResponse(res, 400, `${field} already exists`);
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return errorResponse(res, 400, 'Invalid ID format');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return errorResponse(res, statusCode, message);
};

// 404 handler
const notFound = (req, res, next) => {
    errorResponse(res, 404, `Route not found - ${req.originalUrl}`);
};

module.exports = {
    errorHandler,
    notFound,
};
