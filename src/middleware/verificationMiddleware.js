import db from '../Database_sqlite.js';

/**
 * Middleware to require email verification
 * Checks if user's email is verified before allowing access
 */
export const requireEmailVerification = (req, res, next) => {
    try {
        // Get user info from the token (set by authMiddleware)
        const userId = req.user.userid;
        
        // Check user's verification status in database
        const stmt = db.prepare('SELECT email_verified FROM users WHERE userid = ?');
        const user = stmt.get(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                error: 'Email verification required. Please verify your email address to continue.',
                requiresVerification: 'email'
            });
        }
        
        next();
    } catch (error) {
        console.error('Email verification middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Middleware to require full verification (both email and phone)
 * Checks if both email and phone are verified before allowing access
 */
export const requireFullVerification = (req, res, next) => {
    try {
        // Get user info from the token (set by authMiddleware)
        const userId = req.user.userid;
        
        // Check user's verification status in database
        const stmt = db.prepare('SELECT email_verified, phone_verified FROM users WHERE userid = ?');
        const user = stmt.get(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                error: 'Email verification required. Please verify your email address to continue.',
                requiresVerification: 'email'
            });
        }
        
        if (!user.phone_verified) {
            return res.status(403).json({
                success: false,
                error: 'Phone verification required. Please verify your phone number to continue.',
                requiresVerification: 'phone'
            });
        }
        
        next();
    } catch (error) {
        console.error('Full verification middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Middleware to check if user has any pending verifications
 * Returns verification status without blocking access
 */
export const checkVerificationStatus = (req, res, next) => {
    try {
        const userId = req.user.userid;
        
        const stmt = db.prepare('SELECT email_verified, phone_verified FROM users WHERE userid = ?');
        const user = stmt.get(userId);
        
        if (user) {
            req.verificationStatus = {
                emailVerified: Boolean(user.email_verified),
                phoneVerified: Boolean(user.phone_verified),
                fullyVerified: Boolean(user.email_verified && user.phone_verified)
            };
        }
        
        next();
    } catch (error) {
        console.error('Verification status check error:', error);
        next(); // Continue without verification status
    }
};