import { body, validationResult } from 'express-validator';

// Validation for user registration
export const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
    
  body('role')
    .isIn(['Pet owner', 'Service provider', 'Manager'])
    .withMessage('Role must be Pet owner, Service provider, or Manager'),
    
  // Conditional validation for pet owner
  body('phone')
    .if(body('role').equals('Pet owner'))
    .matches(/^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8]|9[0-9])[0-9]{7}$/)
    .withMessage('Please provide a valid Vietnamese phone number (e.g., +84901234567, 0901234567)'),
    
  body('city')
    .if(body('role').equals('Pet owner'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('City is required for pet owners'),
    
  body('address')
    .if(body('role').equals('Pet owner'))
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address is required for pet owners'),
    
  // Conditional validation for service provider
  body('bussiness_name')
    .if(body('role').equals('Service provider'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('Business name is required for service providers'),
    
  body('phone')
    .if(body('role').equals('Service provider'))
    .matches(/^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8]|9[0-9])[0-9]{7}$/)
    .withMessage('Please provide a valid Vietnamese phone number (e.g., +84901234567, 0901234567)'),
    
  body('address')
    .if(body('role').equals('Service provider'))
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address is required for service providers'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  }
];

// Validation for user login
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage(' email is required'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
        
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array() 
        });
        }
        next();
    }
];
