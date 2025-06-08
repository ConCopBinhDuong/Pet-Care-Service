/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
};

/**
 * Global error handler
 */
export const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    
    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    } else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    } else if (error.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Not found';
    }
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
