// Standard API response helpers

const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message,
    };

    if (errors !== null) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
    });
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
};
