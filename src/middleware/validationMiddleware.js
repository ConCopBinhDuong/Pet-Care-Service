/**
 * Validation middleware for request data
 */

/**
 * Validate Vietnamese phone numbers
 * Supports formats: +84xxxxxxxxx, 84xxxxxxxxx, 0xxxxxxxxx
 */
export const validateVietnamesePhone = (phone) => {
    if (!phone) return true; // Phone is optional in some cases
    
    // Remove spaces and special characters except + and numbers
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Vietnamese phone number patterns
    const patterns = [
        /^\+84[3-9]\d{8}$/,    // +84 followed by 9 digits starting with 3-9
        /^84[3-9]\d{8}$/,      // 84 followed by 9 digits starting with 3-9
        /^0[3-9]\d{8}$/        // 0 followed by 9 digits starting with 3-9
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, contains letters and numbers
 */
export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return false;
    }
    
    // Must contain at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasLetter && hasNumber;
};

/**
 * Registration validation middleware
 */
export const validateRegistration = (req, res, next) => {
    const { username, email, password, gender, role, phone, bussiness_name } = req.body;
    const errors = [];

    // Required fields
    if (!username || username.trim().length < 2) {
        errors.push('Username is required and must be at least 2 characters');
    }

    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Invalid email format');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (!validatePassword(password)) {
        errors.push('Password must be at least 8 characters and contain letters and numbers');
    }

    if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
        errors.push('Gender must be Male, Female, or Other');
    }

    if (!role || !['Pet owner', 'Service provider', 'Manager'].includes(role)) {
        errors.push('Role must be Pet owner, Service provider, or Manager');
    }

    // Role-specific validation
    if (role === 'Service provider') {
        if (!bussiness_name || bussiness_name.trim().length < 2) {
            errors.push('Business name is required for service providers');
        }
    }

    // Phone validation (if provided)
    if (phone && !validateVietnamesePhone(phone)) {
        errors.push('Invalid Vietnamese phone number format. Use +84xxxxxxxxx, 84xxxxxxxxx, or 0xxxxxxxxx');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Login validation middleware
 */
export const validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || username.trim().length === 0) {
        errors.push('Username or email is required');
    }

    if (!password || password.trim().length === 0) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Verification code validation middleware
 */
export const validateVerificationCode = (req, res, next) => {
    const { code } = req.body;
    
    if (!code || !/^\d{6}$/.test(code)) {
        return res.status(400).json({
            success: false,
            error: 'Verification code must be 6 digits'
        });
    }

    next();
};

/**
 * Profile update validation middleware
 */
export const validateProfileUpdate = (req, res, next) => {
    const { name, phone } = req.body;
    const errors = [];

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
        errors.push('Name must be at least 2 characters');
    }

    // Validate phone if provided
    if (phone !== undefined && phone !== null && !validateVietnamesePhone(phone)) {
        errors.push('Invalid Vietnamese phone number format');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Validate activity creation data
 */
export const validateActivityCreation = (req, res, next) => {
    const { pet_id, activity_type, duration, calories_burned, notes } = req.body;
    const errors = [];

    if (!pet_id) {
        errors.push('Pet ID is required');
    } else if (typeof pet_id !== 'number' || pet_id <= 0) {
        errors.push('Pet ID must be a positive number');
    }

    if (!activity_type) {
        errors.push('Activity type is required');
    } else if (typeof activity_type !== 'string' || activity_type.trim().length === 0) {
        errors.push('Activity type must be a non-empty string');
    }

    if (duration !== undefined) {
        if (typeof duration !== 'number' || duration < 0) {
            errors.push('Duration must be a non-negative number');
        }
    }

    if (calories_burned !== undefined) {
        if (typeof calories_burned !== 'number' || calories_burned < 0) {
            errors.push('Calories burned must be a non-negative number');
        }
    }

    if (notes !== undefined && typeof notes !== 'string') {
        errors.push('Notes must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Validate activity update data
 */
export const validateActivityUpdate = (req, res, next) => {
    const { activity_type, duration, calories_burned, notes } = req.body;
    const errors = [];

    if (activity_type !== undefined) {
        if (typeof activity_type !== 'string' || activity_type.trim().length === 0) {
            errors.push('Activity type must be a non-empty string');
        }
    }

    if (duration !== undefined) {
        if (typeof duration !== 'number' || duration < 0) {
            errors.push('Duration must be a non-negative number');
        }
    }

    if (calories_burned !== undefined) {
        if (typeof calories_burned !== 'number' || calories_burned < 0) {
            errors.push('Calories burned must be a non-negative number');
        }
    }

    if (notes !== undefined && typeof notes !== 'string') {
        errors.push('Notes must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};