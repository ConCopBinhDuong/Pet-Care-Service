import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../Database_sqlite.js';
import { 
    validateRegistration, 
    validateLogin, 
    validateVietnamesePhone, 
    validateVerificationCode, 
    validateForgotPasswordRequest, 
    validatePasswordReset,
    validatePreVerificationRegistration,
    validateVerificationSession,
    validateEmailVerificationStep,
    validateCompleteRegistration
} from '../middleware/validationMiddleware.js';
import emailService from '../services/emailService.js';
import verificationService from '../services/verificationService.js';
import preVerificationService from '../services/preVerificationService.js';
import tokenBlacklistService from '../services/tokenBlacklistService.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * VERIFICATION-FIRST REGISTRATION PROCESS
 * Users must verify email before account creation
 */

/**
 * Step 1: Start verification process (no account created yet)
 * Validates registration data and sends verification codes
 */
router.post('/start-verification', validatePreVerificationRegistration, async (req, res) => {
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

        // Check if phone already exists (if provided)
        if (phone) {
            let phoneExists = false;
            
            if (role === 'Pet owner') {
                phoneExists = db.prepare('SELECT id FROM petowner WHERE phone = ?').get(phone);
            } else if (role === 'Service provider') {
                phoneExists = db.prepare('SELECT id FROM serviceprovider WHERE phone = ?').get(phone);
            }
            
            if (phoneExists) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone number already registered'
                });
            }
        }

        // Store registration data temporarily
        const registrationData = {
            username,
            email,
            password,
            gender,
            role,
            phone,
            city,
            address,
            bussiness_name,
            description,
            website
        };

        const sessionId = preVerificationService.storePendingRegistration(registrationData, email);

        // Generate and send verification code
        const emailCode = emailService.generateVerificationCode();

        // Store code in pre-verification service
        preVerificationService.storeVerificationCodes(sessionId, emailCode);

        // Send email verification
        const emailResult = await emailService.sendEmailVerification(email, emailCode, username);

        res.status(200).json({
            success: true,
            message: 'Verification code sent. Please verify your email to complete registration.',
            sessionId: sessionId,
            verificationRequired: {
                email: true
            },
            verificationSent: {
                email: emailResult.success
            },
            expiresIn: '30 minutes'
        });

    } catch (error) {
        console.error('Start verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Step 2: Verify email address
 */
router.post('/verify-registration-email', validateEmailVerificationStep, async (req, res) => {
    const { sessionId, emailCode } = req.body;

    try {
        const result = preVerificationService.verifyEmailCode(sessionId, emailCode);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        // Check overall verification status
        const verificationStatus = preVerificationService.isFullyVerified(sessionId);
        
        res.json({
            success: true,
            message: result.message,
            verificationStatus: verificationStatus.verificationStatus,
            fullyVerified: verificationStatus.fullyVerified,
            nextStep: verificationStatus.fullyVerified ? 'complete-registration' : 'verify-email'
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
 * Step 3: Complete registration (only after full verification)
 * Creates the actual user account
 */
router.post('/complete-registration', validateCompleteRegistration, async (req, res) => {
    const { sessionId } = req.body;

    try {
        // Check if fully verified
        const verificationStatus = preVerificationService.isFullyVerified(sessionId);
        
        if (!verificationStatus.exists) {
            return res.status(400).json({
                success: false,
                error: verificationStatus.error || 'Invalid or expired session'
            });
        }

        if (!verificationStatus.fullyVerified) {
            return res.status(400).json({
                success: false,
                error: 'Verification not complete. Please verify your email.',
                verificationStatus: verificationStatus.verificationStatus
            });
        }

        // Get verified registration data
        const registrationData = preVerificationService.getVerifiedRegistrationData(sessionId);
        
        if (!registrationData) {
            return res.status(400).json({
                success: false,
                error: 'Registration data not found or expired'
            });
        }

        const { username, email, password, gender, role, phone, city, address, bussiness_name, description, website } = registrationData;

        // Double-check email doesn't exist (race condition protection)
        const emailExists = db.prepare('SELECT userid FROM users WHERE email = ?').get(email);
        if (emailExists) {
            preVerificationService.removePendingRegistration(sessionId);
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user account (with verified status)
        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password, gender, role, email_verified)
            VALUES (?, ?, ?, ?, ?, 1)
        `);
        
        const result = insertUser.run(
            username, 
            email, 
            hashedPassword, 
            gender, 
            role
        );
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

        // Generate JWT token with JTI for blacklisting support
        const jti = crypto.randomUUID();
        const token = jwt.sign(
            { 
                userid: userId, 
                email: email, 
                role: role,
                jti: jti
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Clean up pending registration
        preVerificationService.removePendingRegistration(sessionId);

        // Send welcome email
        await emailService.sendWelcomeEmail(email, username, role);

        console.log(`✅ Account created successfully for: ${email} (${role})`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully! You can now log in.',
            user: {
                id: userId,
                name: username,
                email: email,
                role: role,
                emailVerified: true
            },
            token: token
        });

    } catch (error) {
        console.error('Complete registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Cancel pending registration
 */
router.post('/cancel-registration', validateVerificationSession, (req, res) => {
    const { sessionId } = req.body;

    try {
        const result = preVerificationService.cancelRegistration(sessionId);
        
        res.json({
            success: true,
            message: result ? 'Registration cancelled successfully' : 'Session not found or already expired'
        });

    } catch (error) {
        console.error('Cancel registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Get verification status for a session
 */
router.post('/verification-status', validateVerificationSession, (req, res) => {
    const { sessionId } = req.body;

    try {
        const status = preVerificationService.isFullyVerified(sessionId);
        
        if (!status.exists) {
            return res.status(400).json({
                success: false,
                error: status.error || 'Session not found'
            });
        }

        res.json({
            success: true,
            verificationStatus: status.verificationStatus,
            fullyVerified: status.fullyVerified,
            email: status.email
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
 * Resend verification codes
 */
router.post('/resend-verification-codes', validateVerificationSession, async (req, res) => {
    const { sessionId } = req.body;

    try {
        const sessionData = preVerificationService.getSessionForResend(sessionId);
        
        if (!sessionData) {
            return res.status(400).json({
                success: false,
                error: 'Session not found or expired'
            });
        }

        // Generate new code
        const emailCode = emailService.generateVerificationCode();

        // Store new code
        preVerificationService.storeVerificationCodes(sessionId, emailCode);

        // Send code
        const emailResult = await emailService.sendEmailVerification(sessionData.email, emailCode, sessionData.username);

        res.json({
            success: true,
            message: 'Verification code resent',
            verificationSent: {
                email: emailResult.success
            }
        });

    } catch (error) {
        console.error('Resend verification codes error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * LEGACY: Keep old registration endpoint for backward compatibility (deprecated)
 * @deprecated Use start-verification instead
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
            INSERT INTO users (name, email, password, gender, role, email_verified)
            VALUES (?, ?, ?, ?, ?, 0)
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

        // Generate JWT token with JTI for blacklisting support
        const jti = crypto.randomUUID(); // Unique identifier for this token
        const token = jwt.sign(
            { 
                userid: userId, 
                email: email, 
                role: role,
                jti: jti  // JWT ID for blacklisting
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send verification email
        const emailCode = verificationService.storeVerificationCode(email, 'email', userId);
        await emailService.sendEmailVerification(email, emailCode, username);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: userId,
                name: username,
                email: email,
                role: role,
                emailVerified: false
            },
            token: token,
            verificationSent: {
                email: true
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
    const { email, password } = req.body;

    try {
        // Find user by email only (email is unique)
        const user = db.prepare(`
            SELECT userid, name, email, password, role, email_verified 
            FROM users 
            WHERE email = ?
        `).get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if user has completed email verification
        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                error: 'Account verification required',
                message: 'You must verify your email address before logging in. Please complete the registration verification process.',
                verificationStatus: {
                    emailVerified: Boolean(user.email_verified),
                    requiresEmailVerification: !user.email_verified
                }
            });
        }

        // Generate JWT token with JTI for blacklisting support
        const jti = crypto.randomUUID(); // Unique identifier for this token
        const token = jwt.sign(
            { 
                userid: user.userid, 
                email: user.email, 
                role: user.role,
                jti: jti  // JWT ID for blacklisting
            },
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
                emailVerified: Boolean(user.email_verified)
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
 * Get verification status
 */
router.get('/verification-status', authMiddleware, (req, res) => {
    const userId = req.user.userid;

    try {
        const user = db.prepare('SELECT email_verified FROM users WHERE userid = ?').get(userId);
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
                fullyVerified: Boolean(user.email_verified)
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
 * Get current authenticated user info
 * Useful for confirming user identity before logout or for user profile display
 */
router.get('/me', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        
        // Get detailed user information from database
        const getUserStmt = db.prepare(`
            SELECT userid, name, email, role, email_verified 
            FROM users 
            WHERE userid = ?
        `);
        const user = getUserStmt.get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Current user information retrieved successfully',
            user: {
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: Boolean(user.email_verified),
                fullyVerified: Boolean(user.email_verified)
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Logout user
 * Enhanced logout with token blacklisting for immediate invalidation
 */
router.post('/logout', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userEmail = req.user.email;
        const userRole = req.user.role;
        const tokenInfo = req.tokenInfo;

        // Log the logout activity for security purposes
        console.log(`User logout: ${userEmail} (ID: ${userId}, Role: ${userRole}) at ${new Date().toISOString()}`);

        // Blacklist the current token if JTI is available
        if (tokenInfo && tokenInfo.jti) {
            const success = tokenBlacklistService.addToken(
                tokenInfo.jti,
                userId,
                tokenInfo.exp,
                'logout'
            );
            
            if (success) {
                console.log(`Token blacklisted: ${tokenInfo.jti}`);
            } else {
                console.error(`Failed to blacklist token: ${tokenInfo.jti}`);
            }
        }

        // Optional: Clear any user-specific temporary data/sessions if you have any
        // For example, if you store any temporary verification codes for this user
        // verificationService.clearUserCodes(userEmail);

        // Send minimal logout response (no user data for security)
        res.json({
            success: true,
            message: 'Logout successful',
            instructions: {
                clientAction: 'Remove JWT token from local storage, session storage, or cookies',
                security: 'Clear any cached user data on the client side'
            },
            logoutTimestamp: new Date().toISOString(),
            tokenRevoked: !!tokenInfo?.jti  // Indicate if token was revoked server-side
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during logout'
        });
    }
});

/**
 * Admin endpoint: Clean up expired blacklisted tokens
 * Only managers can access this endpoint
 */
router.post('/admin/cleanup-blacklist', authMiddleware, (req, res) => {
    try {
        const userRole = req.user.role;

        // Only managers can perform this action
        if (userRole !== 'Manager') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only managers can perform this action.'
            });
        }

        const cleanedCount = tokenBlacklistService.cleanupExpiredTokens();
        const stats = tokenBlacklistService.getBlacklistStats();

        res.json({
            success: true,
            message: 'Blacklist cleanup completed',
            cleanedCount,
            currentStats: stats
        });

    } catch (error) {
        console.error('Blacklist cleanup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during blacklist cleanup'
        });
    }
});

/**
 * Admin endpoint: Get blacklist statistics
 * Only managers can access this endpoint
 */
router.get('/admin/blacklist-stats', authMiddleware, (req, res) => {
    try {
        const userRole = req.user.role;

        // Only managers can perform this action
        if (userRole !== 'Manager') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only managers can view this information.'
            });
        }

        const stats = tokenBlacklistService.getBlacklistStats();

        res.json({
            success: true,
            message: 'Blacklist statistics retrieved successfully',
            stats
        });

    } catch (error) {
        console.error('Get blacklist stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving statistics'
        });
    }
});

/**
 * Utility endpoint: Check user verification status
 * Allows checking if a user has completed full verification
 */
router.post('/check-verification-status', validateLogin, async (req, res) => {
    const { username } = req.body;

    try {
        // Find user by email or username
        const user = db.prepare(`
            SELECT userid, name, email, role, email_verified, created_at
            FROM users 
            WHERE email = ? OR name = ?
        `).get(username, username);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const isFullyVerified = user.email_verified;

        res.json({
            success: true,
            user: {
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.created_at
            },
            verificationStatus: {
                isFullyVerified,
                emailVerified: Boolean(user.email_verified),
                canLogin: isFullyVerified,
                requiresEmailVerification: !user.email_verified
            }
        });

    } catch (error) {
        console.error('Check verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Admin endpoint: Get incomplete registrations
 * Only managers can access this endpoint
 */
router.get('/admin/incomplete-registrations', authMiddleware, async (req, res) => {
    try {
        const userRole = req.user.role;

        // Only managers can perform this action
        if (userRole !== 'Manager') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only managers can view this information.'
            });
        }

        // Get users who haven't completed email verification
        const incompleteUsers = db.prepare(`
            SELECT userid, name, email, role, email_verified, created_at
            FROM users 
            WHERE email_verified = 0
            ORDER BY created_at DESC
        `).all();

        const stats = {
            totalIncomplete: incompleteUsers.length,
            emailNotVerified: incompleteUsers.filter(u => !u.email_verified).length
        };

        res.json({
            success: true,
            message: 'Incomplete registrations retrieved successfully',
            stats,
            users: incompleteUsers.map(user => ({
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: Boolean(user.email_verified),
                createdAt: user.created_at,
                canLogin: user.email_verified
            }))
        });

    } catch (error) {
        console.error('Get incomplete registrations error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving incomplete registrations'
        });
    }
});

/**
 * Restart verification for existing incomplete registration
 * Allows users with incomplete verification to restart the process
 */
router.post('/restart-verification', validateLogin, async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by email or username
        const user = db.prepare(`
            SELECT userid, name, email, password, phone, role, email_verified 
            FROM users 
            WHERE email = ? OR name = ?
        `).get(username, username);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is already fully verified
        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Account is already fully verified',
                message: 'Your account is already verified. You can log in normally.'
            });
        }

        // Send verification code for email verification
        let emailSent = false;
        const results = {};

        // Send email verification code if needed
        if (!user.email_verified) {
            try {
                await verificationService.sendEmailVerification(user.email);
                emailSent = true;
                results.email = { success: true, message: 'Email verification code sent' };
            } catch (emailError) {
                console.error('Failed to send email verification:', emailError);
                results.email = { success: false, error: 'Failed to send email verification code' };
            }
        }

        res.json({
            success: emailSent,
            message: 'Verification restart initiated',
            verificationStatus: {
                emailVerified: Boolean(user.email_verified),
                requiresEmailVerification: !user.email_verified
            },
            results,
            instructions: {
                email: !user.email_verified ? 'Check your email for verification code and use /verify-email endpoint' : 'Email already verified'
            }
        });

    } catch (error) {
        console.error('Restart verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Admin endpoint: Force complete verification for a user
 * Only managers can access this endpoint
 * Use with caution - this bypasses the verification process
 */
router.post('/admin/force-complete-verification', authMiddleware, async (req, res) => {
    const { userId } = req.body;

    try {
        const userRole = req.user.role;

        // Only managers can perform this action
        if (userRole !== 'Manager') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only managers can perform this action.'
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Check if user exists
        const user = db.prepare('SELECT userid, name, email, email_verified FROM users WHERE userid = ?').get(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user verification status
        const updateStmt = db.prepare(`
            UPDATE users 
            SET email_verified = 1 
            WHERE userid = ?
        `);
        
        updateStmt.run(userId);

        res.json({
            success: true,
            message: 'User verification status updated successfully',
            user: {
                id: user.userid,
                name: user.name,
                email: user.email,
                emailVerified: true,
                canLogin: true
            }
        });

    } catch (error) {
        console.error('Force complete verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while updating verification status'
        });
    }
});

export default router;