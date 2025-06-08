import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../Database_sqlite.js';
import { validateRegistration, validateLogin, validateVietnamesePhone, validateVerificationCode, validateForgotPasswordRequest, validatePasswordReset } from '../middleware/validationMiddleware.js';
import emailService from '../services/emailService.js';
import verificationService from '../services/verificationService.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * Register a new user
 */
router.post('/register', validateRegistration, async (req, res) => {
    const { username, email, password, gender, role, phone, city, address, bussiness_name, description, website } = req.body;

    try {
        // Check if email already exists
        const emailExists = db.prepare('SELECT userid FROM users WHERE email = ?').get(email);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Check phone validation for Vietnamese numbers (if phone provided)
        if (phone && !validateVietnamesePhone(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Vietnamese phone number format'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password, gender, role, email_verified, phone_verified)
            VALUES (?, ?, ?, ?, ?, 0, 0)
        `);
        
        const result = insertUser.run(username, email, hashedPassword, gender, role);
        const userId = result.lastInsertRowid;

        // Insert role-specific data
        if (role === 'Pet owner') {
            const insertPetOwner = db.prepare(`
                INSERT INTO petowner (id, phone, city, address)
                VALUES (?, ?, ?, ?)
            `);
            insertPetOwner.run(userId, phone || null, city || null, address || null);
        } else if (role === 'Service provider') {
            const insertServiceProvider = db.prepare(`
                INSERT INTO serviceprovider (id, bussiness_name, phone, description, address, website)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            insertServiceProvider.run(userId, bussiness_name || null, phone || null, description || null, address || null, website || null);
        } else if (role === 'Manager') {
            const insertManager = db.prepare(`
                INSERT INTO manager (id)
                VALUES (?)
            `);
            insertManager.run(userId);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userid: userId, email: email, role: role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send verification email
        const emailCode = verificationService.storeVerificationCode(email, 'email', userId);
        await emailService.sendEmailVerification(email, emailCode, username);

        // Send verification SMS if phone provided
        let phoneCodeSent = false;
        if (phone) {
            const phoneCode = verificationService.storeVerificationCode(phone, 'phone', userId);
            const phoneResult = await emailService.sendPhoneVerification(phone, phoneCode);
            phoneCodeSent = phoneResult.success;
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: userId,
                name: username,
                email: email,
                role: role,
                emailVerified: false,
                phoneVerified: false
            },
            token: token,
            verificationSent: {
                email: true,
                phone: phoneCodeSent
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Login user
 */
router.post('/login', validateLogin, async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by email or username
        const user = db.prepare(`
            SELECT userid, name, email, password, role, email_verified, phone_verified 
            FROM users 
            WHERE email = ? OR name = ?
        `).get(username, username);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userid: user.userid, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: Boolean(user.email_verified),
                phoneVerified: Boolean(user.phone_verified)
            },
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Verify email with code
 */
router.post('/verify-email', authMiddleware, validateVerificationCode, async (req, res) => {
    const { code } = req.body;
    const userId = req.user.userid;

    try {
        // Get user's email
        const user = db.prepare('SELECT email, email_verified FROM users WHERE userid = ?').get(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Email already verified'
            });
        }

        // Verify the code
        const verificationResult = verificationService.verifyCode(user.email, code);
        
        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                error: verificationResult.error
            });
        }

        // Update user's email verification status
        const updateStmt = db.prepare('UPDATE users SET email_verified = 1 WHERE userid = ?');
        updateStmt.run(userId);

        res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Verify phone with code
 */
router.post('/verify-phone', authMiddleware, validateVerificationCode, async (req, res) => {
    const { code } = req.body;
    const userId = req.user.userid;

    try {
        // Get user's phone number based on role
        let phoneQuery;
        const userRole = req.user.role;
        
        if (userRole === 'Pet owner') {
            phoneQuery = db.prepare(`
                SELECT p.phone, u.phone_verified 
                FROM users u 
                JOIN petowner p ON u.userid = p.id 
                WHERE u.userid = ?
            `);
        } else if (userRole === 'Service provider') {
            phoneQuery = db.prepare(`
                SELECT s.phone, u.phone_verified 
                FROM users u 
                JOIN serviceprovider s ON u.userid = s.id 
                WHERE u.userid = ?
            `);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Phone verification not available for this user role'
            });
        }

        const userData = phoneQuery.get(userId);
        if (!userData || !userData.phone) {
            return res.status(400).json({
                success: false,
                error: 'No phone number found for this user'
            });
        }

        if (userData.phone_verified) {
            return res.status(400).json({
                success: false,
                error: 'Phone number already verified'
            });
        }

        // Verify the code
        const verificationResult = verificationService.verifyCode(userData.phone, code);
        
        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                error: verificationResult.error
            });
        }

        // Update user's phone verification status
        const updateStmt = db.prepare('UPDATE users SET phone_verified = 1 WHERE userid = ?');
        updateStmt.run(userId);

        res.json({
            success: true,
            message: 'Phone number verified successfully'
        });

    } catch (error) {
        console.error('Phone verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Resend email verification code
 */
router.post('/resend-email-verification', authMiddleware, async (req, res) => {
    const userId = req.user.userid;

    try {
        // Get user data
        const user = db.prepare('SELECT name, email, email_verified FROM users WHERE userid = ?').get(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Email already verified'
            });
        }

        // Check if there's already a valid code (to prevent spam)
        if (verificationService.hasValidCode(user.email)) {
            return res.status(429).json({
                success: false,
                error: 'A verification code was already sent. Please wait for it to expire before requesting a new one.'
            });
        }

        // Generate and send new verification code
        const emailCode = verificationService.storeVerificationCode(user.email, 'email', userId);
        await emailService.sendEmailVerification(user.email, emailCode, user.name);

        res.json({
            success: true,
            message: 'Email verification code sent'
        });

    } catch (error) {
        console.error('Resend email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Resend phone verification code
 */
router.post('/resend-phone-verification', authMiddleware, async (req, res) => {
    const userId = req.user.userid;

    try {
        // Get user's phone number based on role
        let phoneQuery;
        const userRole = req.user.role;
        
        if (userRole === 'Pet owner') {
            phoneQuery = db.prepare(`
                SELECT p.phone, u.phone_verified 
                FROM users u 
                JOIN petowner p ON u.userid = p.id 
                WHERE u.userid = ?
            `);
        } else if (userRole === 'Service provider') {
            phoneQuery = db.prepare(`
                SELECT s.phone, u.phone_verified 
                FROM users u 
                JOIN serviceprovider s ON u.userid = s.id 
                WHERE u.userid = ?
            `);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Phone verification not available for this user role'
            });
        }

        const userData = phoneQuery.get(userId);
        if (!userData || !userData.phone) {
            return res.status(400).json({
                success: false,
                error: 'No phone number found for this user'
            });
        }

        if (userData.phone_verified) {
            return res.status(400).json({
                success: false,
                error: 'Phone number already verified'
            });
        }

        // Check if there's already a valid code
        if (verificationService.hasValidCode(userData.phone)) {
            return res.status(429).json({
                success: false,
                error: 'A verification code was already sent. Please wait for it to expire before requesting a new one.'
            });
        }

        // Generate and send new verification code
        const phoneCode = verificationService.storeVerificationCode(userData.phone, 'phone', userId);
        await emailService.sendPhoneVerification(userData.phone, phoneCode);

        res.json({
            success: true,
            message: 'Phone verification code sent'
        });

    } catch (error) {
        console.error('Resend phone verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Get verification status
 */
router.get('/verification-status', authMiddleware, (req, res) => {
    const userId = req.user.userid;

    try {
        const user = db.prepare('SELECT email_verified, phone_verified FROM users WHERE userid = ?').get(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            verificationStatus: {
                emailVerified: Boolean(user.email_verified),
                phoneVerified: Boolean(user.phone_verified),
                fullyVerified: Boolean(user.email_verified && user.phone_verified)
            }
        });

    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Request password reset (forgot password)
 * Sends verification code to email if user exists
 */
router.post('/forgot-password', validateForgotPasswordRequest, async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists with this email
        const user = db.prepare('SELECT userid, name, email FROM users WHERE email = ?').get(email);
        
        if (!user) {
            // For security, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If an account with this email exists, a password reset code has been sent.'
            });
        }

        // Generate and store verification code for password reset
        const verificationCode = verificationService.storeVerificationCode(email, 'password_reset', user.userid);
        
        // Send password reset email
        const emailResult = await emailService.sendPasswordResetVerification(email, verificationCode, user.name);
        
        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send password reset email'
            });
        }

        res.json({
            success: true,
            message: 'If an account with this email exists, a password reset code has been sent.',
            codeExpiration: '1 minute'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Verify password reset code and set new password
 */
router.post('/reset-password', validatePasswordReset, async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        // Verify the password reset code
        const verificationResult = verificationService.verifyCode(email, code);
        
        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                error: verificationResult.error
            });
        }

        // Check if the verification was for password reset
        if (verificationResult.type !== 'password_reset') {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification code type'
            });
        }

        // Get user details
        const user = db.prepare('SELECT userid, name, email FROM users WHERE email = ?').get(email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify the user ID matches the one from verification
        if (user.userid !== verificationResult.userId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification data'
            });
        }

        // Hash the new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password
        const updateResult = db.prepare('UPDATE users SET password = ? WHERE userid = ?').run(hashedPassword, user.userid);
        
        if (updateResult.changes === 0) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update password'
            });
        }

        console.log(`Password reset successful for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.',
            userId: user.userid
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Resend password reset verification code
 */
router.post('/resend-password-reset', validateForgotPasswordRequest, async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists with this email
        const user = db.prepare('SELECT userid, name, email FROM users WHERE email = ?').get(email);
        
        if (!user) {
            // For security, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If an account with this email exists, a new password reset code has been sent.'
            });
        }

        // Remove any existing password reset code for this email
        verificationService.removeCode(email);

        // Generate and store new verification code for password reset
        const verificationCode = verificationService.storeVerificationCode(email, 'password_reset', user.userid);
        
        // Send password reset email
        const emailResult = await emailService.sendPasswordResetVerification(email, verificationCode, user.name);
        
        if (!emailResult.success) {
            console.error('Failed to resend password reset email:', emailResult.error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send password reset email'
            });
        }

        res.json({
            success: true,
            message: 'If an account with this email exists, a new password reset code has been sent.',
            codeExpiration: '1 minute'
        });

    } catch (error) {
        console.error('Resend password reset error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Logout user (client-side token invalidation)
 */
router.post('/logout', authMiddleware, (req, res) => {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token from storage
    res.json({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
    });
});

export default router;