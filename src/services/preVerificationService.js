/**
 * Pre-Verification Service
 * Handles temporary storage of user registration data during verification process
 * Users must complete email verification before account creation
 */

import crypto from 'crypto';

class PreVerificationService {
    constructor() {
        // In-memory storage for pending registration data
        this.pendingRegistrations = new Map();
        
        // Clean up expired registrations every 5 minutes
        setInterval(() => {
            this.cleanupExpiredRegistrations();
        }, 300000); // 5 minutes
    }

    /**
     * Generate a unique verification session ID
     */
    generateSessionId() {
        return crypto.randomUUID();
    }

    /**
     * Store registration data temporarily during verification process
     * @param {Object} registrationData - Complete user registration data
     * @param {string} email - User email for email verification
     * @returns {string} sessionId - Unique session identifier
     */
    storePendingRegistration(registrationData, email) {
        const sessionId = this.generateSessionId();
        const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes from now
        
        const pendingData = {
            sessionId,
            registrationData,
            email,
            verificationStatus: {
                emailVerified: false,
                emailCode: null
            },
            createdAt: Date.now(),
            expiresAt,
            lastActivity: Date.now()
        };

        this.pendingRegistrations.set(sessionId, pendingData);
        
        console.log(`📝 Pending registration stored with session ID: ${sessionId}`);
        console.log(`   Email: ${email}`);
        console.log(`   Expires at: ${new Date(expiresAt).toLocaleString()}`);
        
        return sessionId;
    }

    /**
     * Store verification codes for a pending registration
     * @param {string} sessionId - Session identifier
     * @param {string} emailCode - Email verification code
     */
    storeVerificationCodes(sessionId, emailCode) {
        const pendingData = this.pendingRegistrations.get(sessionId);
        if (!pendingData) {
            throw new Error('Session not found');
        }

        pendingData.verificationStatus.emailCode = emailCode;
        pendingData.lastActivity = Date.now();

        console.log(`📧 Verification code stored for session: ${sessionId}`);
    }

    /**
     * Verify email code for a pending registration
     * @param {string} sessionId - Session identifier
     * @param {string} emailCode - Email verification code
     * @returns {Object} Verification result
     */
    verifyEmailCode(sessionId, emailCode) {
        const pendingData = this.pendingRegistrations.get(sessionId);
        
        if (!pendingData) {
            return {
                success: false,
                error: 'Invalid session or session expired'
            };
        }

        // Check if session has expired
        if (Date.now() > pendingData.expiresAt) {
            this.pendingRegistrations.delete(sessionId);
            return {
                success: false,
                error: 'Session expired. Please start registration again.'
            };
        }

        if (pendingData.verificationStatus.emailCode !== emailCode) {
            return {
                success: false,
                error: 'Invalid email verification code'
            };
        }

        // Mark email as verified
        pendingData.verificationStatus.emailVerified = true;
        pendingData.lastActivity = Date.now();

        console.log(`✅ Email verified for session: ${sessionId}`);
        
        return {
            success: true,
            message: 'Email verified successfully',
            verificationStatus: pendingData.verificationStatus
        };
    }

    /**
     * Check if a pending registration is fully verified
     * @param {string} sessionId - Session identifier
     * @returns {Object} Verification status
     */
    isFullyVerified(sessionId) {
        const pendingData = this.pendingRegistrations.get(sessionId);
        
        if (!pendingData) {
            return {
                exists: false,
                fullyVerified: false,
                error: 'Session not found'
            };
        }

        // Check if session has expired
        if (Date.now() > pendingData.expiresAt) {
            this.pendingRegistrations.delete(sessionId);
            return {
                exists: false,
                fullyVerified: false,
                error: 'Session expired'
            };
        }

        const { emailVerified } = pendingData.verificationStatus;
        const fullyVerified = emailVerified;

        return {
            exists: true,
            fullyVerified,
            verificationStatus: pendingData.verificationStatus,
            email: pendingData.email
        };
    }

    /**
     * Get pending registration data after full verification
     * @param {string} sessionId - Session identifier
     * @returns {Object} Registration data or null
     */
    getVerifiedRegistrationData(sessionId) {
        const pendingData = this.pendingRegistrations.get(sessionId);
        
        if (!pendingData) {
            return null;
        }

        // Check if session has expired
        if (Date.now() > pendingData.expiresAt) {
            this.pendingRegistrations.delete(sessionId);
            return null;
        }

        // Check if fully verified
        const { emailVerified } = pendingData.verificationStatus;
        if (!emailVerified) {
            return null;
        }

        return pendingData.registrationData;
    }

    /**
     * Remove pending registration data (after successful account creation or cancellation)
     * @param {string} sessionId - Session identifier
     */
    removePendingRegistration(sessionId) {
        const result = this.pendingRegistrations.delete(sessionId);
        if (result) {
            console.log(`🗑️ Removed pending registration: ${sessionId}`);
        }
        return result;
    }

    /**
     * Cancel a pending registration
     * @param {string} sessionId - Session identifier
     */
    cancelRegistration(sessionId) {
        return this.removePendingRegistration(sessionId);
    }

    /**
     * Clean up expired pending registrations
     */
    cleanupExpiredRegistrations() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [sessionId, data] of this.pendingRegistrations.entries()) {
            if (now > data.expiresAt) {
                this.pendingRegistrations.delete(sessionId);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired pending registrations`);
        }
    }

    /**
     * Get pending registration status for debugging
     */
    getPendingRegistrationStatus() {
        const registrations = [];
        const now = Date.now();
        
        for (const [sessionId, data] of this.pendingRegistrations.entries()) {
            registrations.push({
                sessionId,
                email: data.email,
                verificationStatus: data.verificationStatus,
                createdAt: data.createdAt,
                expiresAt: data.expiresAt,
                expired: now > data.expiresAt,
                timeRemaining: Math.max(0, data.expiresAt - now),
                lastActivity: data.lastActivity
            });
        }
        
        return {
            totalPendingRegistrations: this.pendingRegistrations.size,
            registrations
        };
    }

    /**
     * Resend verification codes for a session
     * @param {string} sessionId - Session identifier
     * @returns {Object} Session data for resending codes
     */
    getSessionForResend(sessionId) {
        const pendingData = this.pendingRegistrations.get(sessionId);
        
        if (!pendingData) {
            return null;
        }

        // Check if session has expired
        if (Date.now() > pendingData.expiresAt) {
            this.pendingRegistrations.delete(sessionId);
            return null;
        }

        // Update last activity
        pendingData.lastActivity = Date.now();

        return {
            sessionId,
            email: pendingData.email,
            username: pendingData.registrationData.username,
            verificationStatus: pendingData.verificationStatus
        };
    }
}

// Create a singleton instance
const preVerificationService = new PreVerificationService();

export default preVerificationService;
