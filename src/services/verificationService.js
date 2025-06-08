/**
 * In-Memory Verification Service
 * Stores temporary verification codes with 1-minute expiration
 * No database storage required
 */

class VerificationService {
    constructor() {
        // In-memory storage for verification codes
        this.verificationCodes = new Map();
        
        // Clean up expired codes every 30 seconds
        setInterval(() => {
            this.cleanupExpiredCodes();
        }, 30000);
    }

    /**
     * Generate a 6-digit verification code
     */
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Store verification code with 1-minute expiration
     * @param {string} key - Unique identifier (email or phone)
     * @param {string} type - 'email' or 'phone'
     * @param {number} userId - User ID (optional)
     */
    storeVerificationCode(key, type, userId = null) {
        const code = this.generateCode();
        const expiresAt = Date.now() + (60 * 1000); // 1 minute from now
        
        this.verificationCodes.set(key, {
            code,
            type,
            userId,
            expiresAt,
            attempts: 0,
            createdAt: Date.now()
        });

        console.log(`📝 Verification code stored for ${type}: ${key}`);
        console.log(`   Code: ${code} (expires in 1 minute)`);
        
        return code;
    }

    /**
     * Verify a code against stored verification data
     * @param {string} key - Email or phone number
     * @param {string} inputCode - Code provided by user
     * @returns {Object} Verification result
     */
    verifyCode(key, inputCode) {
        const verificationData = this.verificationCodes.get(key);
        
        if (!verificationData) {
            return {
                success: false,
                error: 'No verification code found for this email/phone'
            };
        }

        // Check if code has expired
        if (Date.now() > verificationData.expiresAt) {
            this.verificationCodes.delete(key);
            return {
                success: false,
                error: 'Verification code has expired. Please request a new one.'
            };
        }

        // Increment attempt counter
        verificationData.attempts++;

        // Check for too many attempts (max 3)
        if (verificationData.attempts > 3) {
            this.verificationCodes.delete(key);
            return {
                success: false,
                error: 'Too many failed attempts. Please request a new verification code.'
            };
        }

        // Verify the code
        if (verificationData.code === inputCode) {
            // Code is correct - remove it and return success
            this.verificationCodes.delete(key);
            return {
                success: true,
                type: verificationData.type,
                userId: verificationData.userId
            };
        } else {
            // Wrong code
            return {
                success: false,
                error: `Invalid verification code. ${3 - verificationData.attempts} attempts remaining.`
            };
        }
    }

    /**
     * Check if a verification code exists and is valid for a key
     * @param {string} key - Email or phone number
     * @returns {boolean}
     */
    hasValidCode(key) {
        const verificationData = this.verificationCodes.get(key);
        if (!verificationData) {
            return false;
        }
        
        // Check if expired
        if (Date.now() > verificationData.expiresAt) {
            this.verificationCodes.delete(key);
            return false;
        }
        
        return true;
    }

    /**
     * Remove verification code for a key
     * @param {string} key - Email or phone number
     */
    removeCode(key) {
        return this.verificationCodes.delete(key);
    }

    /**
     * Clean up expired verification codes
     */
    cleanupExpiredCodes() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, data] of this.verificationCodes.entries()) {
            if (now > data.expiresAt) {
                this.verificationCodes.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired verification codes`);
        }
    }

    /**
     * Get verification status for debugging
     */
    getVerificationStatus() {
        const codes = [];
        const now = Date.now();
        
        for (const [key, data] of this.verificationCodes.entries()) {
            codes.push({
                key,
                type: data.type,
                code: data.code,
                userId: data.userId,
                attempts: data.attempts,
                expiresAt: data.expiresAt,
                expired: now > data.expiresAt,
                timeRemaining: Math.max(0, data.expiresAt - now)
            });
        }
        
        return {
            totalCodes: this.verificationCodes.size,
            codes
        };
    }
}

// Create a singleton instance
const verificationService = new VerificationService();

export default verificationService;