import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all requests
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 20 requests per windowMs for auth routes
    message: {
        success: false,
        error: 'Too many authentication attempts from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Very strict rate limiter for verification code sending
 */
export const verificationLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 verification requests per minute
    message: {
        success: false,
        error: 'Too many verification attempts from this IP, please wait before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});