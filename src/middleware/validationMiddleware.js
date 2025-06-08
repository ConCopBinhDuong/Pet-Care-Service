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

/**
 * Validate booking creation data
 */
export const validateBookingCreation = (req, res, next) => {
    const { serviceid, slot, servedate, payment_method, petIds } = req.body;
    const errors = [];

    // Required fields validation
    if (!serviceid) {
        errors.push('Service ID is required');
    } else if (typeof serviceid !== 'number' || serviceid <= 0) {
        errors.push('Service ID must be a positive number');
    }

    if (!slot) {
        errors.push('Time slot is required');
    } else if (typeof slot !== 'string' || slot.trim().length === 0) {
        errors.push('Time slot must be a non-empty string');
    }

    if (!servedate) {
        errors.push('Service date is required');
    } else {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(servedate)) {
            errors.push('Service date must be in YYYY-MM-DD format');
        } else {
            const date = new Date(servedate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (date < today) {
                errors.push('Service date cannot be in the past');
            }
        }
    }

    if (!payment_method) {
        errors.push('Payment method is required');
    } else if (!['cash', 'credit_card', 'bank_transfer', 'e_wallet'].includes(payment_method)) {
        errors.push('Payment method must be one of: cash, credit_card, bank_transfer, e_wallet');
    }

    if (!petIds || !Array.isArray(petIds) || petIds.length === 0) {
        errors.push('At least one pet ID is required');
    } else {
        petIds.forEach((petId, index) => {
            if (typeof petId !== 'number' || petId <= 0) {
                errors.push(`Pet ID at index ${index} must be a positive number`);
            }
        });
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
 * Validate booking update data
 */
export const validateBookingUpdate = (req, res, next) => {
    const { servedate, payment_method, status } = req.body;
    const errors = [];

    // Optional fields validation - only validate if provided
    if (servedate !== undefined) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(servedate)) {
            errors.push('Service date must be in YYYY-MM-DD format');
        } else {
            const date = new Date(servedate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (date < today) {
                errors.push('Service date cannot be in the past');
            }
        }
    }

    if (payment_method !== undefined) {
        if (!['cash', 'credit_card', 'bank_transfer', 'e_wallet'].includes(payment_method)) {
            errors.push('Payment method must be one of: cash, credit_card, bank_transfer, e_wallet');
        }
    }

    if (status !== undefined) {
        if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
            errors.push('Status must be one of: pending, confirmed, in_progress, completed, cancelled');
        }
    }

    // Check if at least one field is provided for update
    if (servedate === undefined && payment_method === undefined && status === undefined) {
        errors.push('At least one field (servedate, payment_method, or status) must be provided for update');
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
 * Validate diet creation data
 */
export const validateDietCreation = (req, res, next) => {
    const { name, amount, description } = req.body;
    const errors = [];

    // Required fields validation
    if (!name) {
        errors.push('Diet name is required');
    } else if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Diet name must be a non-empty string');
    } else if (name.trim().length > 100) {
        errors.push('Diet name must be 100 characters or less');
    }

    // Optional fields validation
    if (amount !== undefined && amount !== null) {
        if (typeof amount !== 'string' || amount.trim().length === 0) {
            errors.push('Amount must be a non-empty string if provided');
        } else if (amount.trim().length > 50) {
            errors.push('Amount must be 50 characters or less');
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string if provided');
        } else if (description.trim().length > 500) {
            errors.push('Description must be 500 characters or less');
        }
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
 * Validate diet update data
 */
export const validateDietUpdate = (req, res, next) => {
    const { name, amount, description } = req.body;
    const errors = [];

    // Optional fields validation - only validate if provided
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Diet name must be a non-empty string');
        } else if (name.trim().length > 100) {
            errors.push('Diet name must be 100 characters or less');
        }
    }

    if (amount !== undefined && amount !== null) {
        if (typeof amount !== 'string' || amount.trim().length === 0) {
            errors.push('Amount must be a non-empty string if provided');
        } else if (amount.trim().length > 50) {
            errors.push('Amount must be 50 characters or less');
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string if provided');
        } else if (description.trim().length > 500) {
            errors.push('Description must be 500 characters or less');
        }
    }

    // Check if at least one field is provided for update
    if (name === undefined && amount === undefined && description === undefined) {
        errors.push('At least one field (name, amount, or description) must be provided for update');
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
 * Validate pet creation data
 */
export const validatePetCreation = (req, res, next) => {
    const { name, breed, description, age, dob, picture } = req.body;
    const errors = [];

    // Required fields validation
    if (!name) {
        errors.push('Pet name is required');
    } else if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Pet name must be a non-empty string');
    } else if (name.trim().length > 50) {
        errors.push('Pet name must be 50 characters or less');
    }

    if (!breed) {
        errors.push('Pet breed is required');
    } else if (typeof breed !== 'string' || breed.trim().length === 0) {
        errors.push('Pet breed must be a non-empty string');
    } else if (breed.trim().length > 50) {
        errors.push('Pet breed must be 50 characters or less');
    }

    if (!picture) {
        errors.push('Pet picture is required');
    } else if (typeof picture !== 'string' || picture.trim().length === 0) {
        errors.push('Pet picture must be provided');
    }

    // Optional fields validation
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string if provided');
        } else if (description.trim().length > 500) {
            errors.push('Description must be 500 characters or less');
        }
    }

    if (age !== undefined && age !== null) {
        if (typeof age !== 'number' || age < 0 || age > 30) {
            errors.push('Age must be a number between 0 and 30 if provided');
        }
    }

    if (dob !== undefined && dob !== null) {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dob)) {
            errors.push('Date of birth must be in YYYY-MM-DD format if provided');
        } else {
            const birthDate = new Date(dob);
            const today = new Date();
            
            if (birthDate > today) {
                errors.push('Date of birth cannot be in the future');
            }
            
            // Check if date is reasonable (not more than 30 years ago)
            const thirtyYearsAgo = new Date();
            thirtyYearsAgo.setFullYear(today.getFullYear() - 30);
            
            if (birthDate < thirtyYearsAgo) {
                errors.push('Date of birth cannot be more than 30 years ago');
            }
        }
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
 * Validate pet update data
 */
export const validatePetUpdate = (req, res, next) => {
    const { name, breed, description, age, dob, picture } = req.body;
    const errors = [];

    // Optional fields validation - only validate if provided
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Pet name must be a non-empty string');
        } else if (name.trim().length > 50) {
            errors.push('Pet name must be 50 characters or less');
        }
    }

    if (breed !== undefined) {
        if (typeof breed !== 'string' || breed.trim().length === 0) {
            errors.push('Pet breed must be a non-empty string');
        } else if (breed.trim().length > 50) {
            errors.push('Pet breed must be 50 characters or less');
        }
    }

    if (picture !== undefined) {
        if (typeof picture !== 'string' || picture.trim().length === 0) {
            errors.push('Pet picture must be provided');
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string if provided');
        } else if (description.trim().length > 500) {
            errors.push('Description must be 500 characters or less');
        }
    }

    if (age !== undefined && age !== null) {
        if (typeof age !== 'number' || age < 0 || age > 30) {
            errors.push('Age must be a number between 0 and 30 if provided');
        }
    }

    if (dob !== undefined && dob !== null) {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dob)) {
            errors.push('Date of birth must be in YYYY-MM-DD format if provided');
        } else {
            const birthDate = new Date(dob);
            const today = new Date();
            
            if (birthDate > today) {
                errors.push('Date of birth cannot be in the future');
            }
            
            // Check if date is reasonable (not more than 30 years ago)
            const thirtyYearsAgo = new Date();
            thirtyYearsAgo.setFullYear(today.getFullYear() - 30);
            
            if (birthDate < thirtyYearsAgo) {
                errors.push('Date of birth cannot be more than 30 years ago');
            }
        }
    }

    // Check if at least one field is provided for update
    const fieldsProvided = [name, breed, description, age, dob, picture].some(field => field !== undefined);
    if (!fieldsProvided) {
        errors.push('At least one field (name, breed, description, age, dob, or picture) must be provided for update');
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
 * Validate forgot password request (email only)
 */
export const validateForgotPasswordRequest = (req, res, next) => {
    const { email } = req.body;
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Invalid email format');
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
 * Validate password reset data (code and new password)
 */
export const validatePasswordReset = (req, res, next) => {
    const { email, code, newPassword } = req.body;
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Invalid email format');
    }

    if (!code || !/^\d{6}$/.test(code)) {
        errors.push('Verification code must be 6 digits');
    }

    if (!newPassword) {
        errors.push('New password is required');
    } else if (!validatePassword(newPassword)) {
        errors.push('New password must be at least 8 characters and contain letters and numbers');
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
 * Validate schedule creation data
 */
export const validateScheduleCreation = (req, res, next) => {
    const { startdate, repeat_option, hour, minute, dietid, activityid } = req.body;
    const errors = [];

    // Validate that either dietid or activityid is provided, but not both
    if ((!dietid && !activityid) || (dietid && activityid)) {
        errors.push('Must provide either diet ID or activity ID, but not both');
    }

    // Validate dietid if provided
    if (dietid !== undefined) {
        if (typeof dietid !== 'number' || dietid <= 0) {
            errors.push('Diet ID must be a positive number');
        }
    }

    // Validate activityid if provided
    if (activityid !== undefined) {
        if (typeof activityid !== 'number' || activityid <= 0) {
            errors.push('Activity ID must be a positive number');
        }
    }

    // Validate startdate (optional field)
    if (startdate !== undefined && startdate !== null) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startdate)) {
            errors.push('Start date must be in YYYY-MM-DD format if provided');
        } else {
            const scheduleDate = new Date(startdate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Allow dates in the past for existing schedules
            if (isNaN(scheduleDate.getTime())) {
                errors.push('Invalid start date format');
            }
        }
    }

    // Validate repeat_option (optional with default)
    if (repeat_option !== undefined) {
        const validRepeatOptions = [
            'never', 'hourly', 'daily', 'weekly', 'biweekly', 
            'monthly', 'every 3 months', 'every 6 months', 'yearly'
        ];
        if (!validRepeatOptions.includes(repeat_option)) {
            errors.push('Repeat option must be one of: ' + validRepeatOptions.join(', '));
        }
    }

    // Validate hour (optional field)
    if (hour !== undefined && hour !== null) {
        if (typeof hour !== 'number' || hour < 0 || hour > 23) {
            errors.push('Hour must be a number between 0 and 23');
        }
    }

    // Validate minute (optional field)
    if (minute !== undefined && minute !== null) {
        if (typeof minute !== 'number' || minute < 0 || minute > 59) {
            errors.push('Minute must be a number between 0 and 59');
        }
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
 * Validate schedule update data
 */
export const validateScheduleUpdate = (req, res, next) => {
    const { startdate, repeat_option, hour, minute } = req.body;
    const errors = [];

    // Optional fields validation - only validate if provided
    if (startdate !== undefined && startdate !== null) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startdate)) {
            errors.push('Start date must be in YYYY-MM-DD format if provided');
        } else {
            const scheduleDate = new Date(startdate);
            
            if (isNaN(scheduleDate.getTime())) {
                errors.push('Invalid start date format');
            }
        }
    }

    if (repeat_option !== undefined) {
        const validRepeatOptions = [
            'never', 'hourly', 'daily', 'weekly', 'biweekly', 
            'monthly', 'every 3 months', 'every 6 months', 'yearly'
        ];
        if (!validRepeatOptions.includes(repeat_option)) {
            errors.push('Repeat option must be one of: ' + validRepeatOptions.join(', '));
        }
    }

    if (hour !== undefined && hour !== null) {
        if (typeof hour !== 'number' || hour < 0 || hour > 23) {
            errors.push('Hour must be a number between 0 and 23');
        }
    }

    if (minute !== undefined && minute !== null) {
        if (typeof minute !== 'number' || minute < 0 || minute > 59) {
            errors.push('Minute must be a number between 0 and 59');
        }
    }

    // Check if at least one field is provided for update
    if (startdate === undefined && repeat_option === undefined && hour === undefined && minute === undefined) {
        errors.push('At least one field (startdate, repeat_option, hour, or minute) must be provided for update');
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