const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/responseUtils');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => ({
            field: error.path || error.param,
            message: error.msg,
        }));
        return validationErrorResponse(res, errorMessages);
    }

    next();
};

module.exports = { validate };
