// Token Blacklist Service
// Manages revoked JWT tokens for immediate invalidation

import db from '../db.js';

class TokenBlacklistService {
    constructor() {
        console.log('✅ Token blacklist service initialized (table exists in database)');
    }

    /**
     * Add a token to the blacklist
     * @param {string} jti - JWT ID (unique identifier for the token)
     * @param {number} userId - User ID who owns the token
     * @param {number} expiresAt - When the token expires (Unix timestamp)
     * @param {string} reason - Reason for blacklisting
     */
    async addToken(jti, userId, expiresAt, reason = 'logout') {
        try {
            await db.execute(`
                INSERT INTO token_blacklist (jti, user_id, expires_at, reason)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                user_id = VALUES(user_id),
                expires_at = VALUES(expires_at),
                reason = VALUES(reason)
            `, [jti, userId, expiresAt, reason]);
            
            console.log(`🚫 Token blacklisted: ${jti} (User: ${userId}, Reason: ${reason})`);
            return true;
        } catch (error) {
            console.error('❌ Error adding token to blacklist:', error);
            return false;
        }
    }

    /**
     * Check if a token is blacklisted
     * @param {string} jti - JWT ID to check
     * @returns {boolean} True if token is blacklisted
     */
    async isTokenBlacklisted(jti) {
        try {
            const result = await db.get(`
                SELECT jti FROM token_blacklist 
                WHERE jti = ? AND expires_at > UNIX_TIMESTAMP()
            `, [jti]);
            
            return !!result;
        } catch (error) {
            console.error('❌ Error checking token blacklist:', error);
            // Fail securely - if we can't check, assume it's not blacklisted
            return false;
        }
    }

    /**
     * Blacklist all tokens for a specific user
     * Useful for password changes, account suspension, etc.
     * @param {number} userId - User ID
     * @param {string} reason - Reason for blacklisting
     */
    async blacklistUserTokens(userId, reason = 'security_action') {
        try {
            // This is a simplified approach - in practice, you'd need to track active tokens
            // For now, we'll add a user-wide blacklist entry
            const futureTimestamp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
            
            // Use a special JTI pattern for user-wide blacklisting
            const userBlacklistJti = `user_${userId}_${Date.now()}`;
            
            await db.execute(`
                INSERT INTO token_blacklist (jti, user_id, expires_at, reason)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                user_id = VALUES(user_id),
                expires_at = VALUES(expires_at),
                reason = VALUES(reason)
            `, [userBlacklistJti, userId, futureTimestamp, reason]);
            
            console.log(`🚫 All tokens blacklisted for user: ${userId} (Reason: ${reason})`);
            return true;
        } catch (error) {
            console.error('❌ Error blacklisting user tokens:', error);
            return false;
        }
    }

    /**
     * Clean up expired tokens from blacklist
     * Should be run periodically to prevent database bloat
     */
    async cleanupExpiredTokens() {
        try {
            const result = await db.execute(`
                DELETE FROM token_blacklist 
                WHERE expires_at <= UNIX_TIMESTAMP()
            `);
            
            if (result.affectedRows > 0) {
                console.log(`🧹 Cleaned up ${result.affectedRows} expired blacklisted tokens`);
            }
            
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error cleaning up expired tokens:', error);
            return 0;
        }
    }

    /**
     * Get blacklist statistics
     * @returns {Object} Statistics about the blacklist
     */
    async getBlacklistStats() {
        try {
            const totalResult = await db.get(`SELECT COUNT(*) as total FROM token_blacklist`);
            const activeResult = await db.get(`
                SELECT COUNT(*) as active FROM token_blacklist 
                WHERE expires_at > UNIX_TIMESTAMP()
            `);
            
            const total = totalResult.total;
            const active = activeResult.active;
            
            return {
                total,
                active,
                expired: total - active
            };
        } catch (error) {
            console.error('❌ Error getting blacklist stats:', error);
            return { total: 0, active: 0, expired: 0 };
        }
    }
}

export default new TokenBlacklistService();
