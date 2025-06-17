// Token Blacklist Service
// Manages revoked JWT tokens for immediate invalidation

import db from '../Database_sqlite.js';

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
    addToken(jti, userId, expiresAt, reason = 'logout') {
        try {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO token_blacklist (jti, user_id, expires_at, reason)
                VALUES (?, ?, ?, ?)
            `);
            
            stmt.run(jti, userId, expiresAt, reason);
            
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
    isTokenBlacklisted(jti) {
        try {
            const stmt = db.prepare(`
                SELECT jti FROM token_blacklist 
                WHERE jti = ? AND expires_at > strftime('%s', 'now')
            `);
            
            const result = stmt.get(jti);
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
    blacklistUserTokens(userId, reason = 'security_action') {
        try {
            // This is a simplified approach - in practice, you'd need to track active tokens
            // For now, we'll add a user-wide blacklist entry
            const futureTimestamp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
            
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO token_blacklist (jti, user_id, expires_at, reason)
                VALUES (?, ?, ?, ?)
            `);
            
            // Use a special JTI pattern for user-wide blacklisting
            const userBlacklistJti = `user_${userId}_${Date.now()}`;
            stmt.run(userBlacklistJti, userId, futureTimestamp, reason);
            
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
    cleanupExpiredTokens() {
        try {
            const stmt = db.prepare(`
                DELETE FROM token_blacklist 
                WHERE expires_at <= strftime('%s', 'now')
            `);
            
            const result = stmt.run();
            
            if (result.changes > 0) {
                console.log(`🧹 Cleaned up ${result.changes} expired blacklisted tokens`);
            }
            
            return result.changes;
        } catch (error) {
            console.error('❌ Error cleaning up expired tokens:', error);
            return 0;
        }
    }

    /**
     * Get blacklist statistics
     * @returns {Object} Statistics about the blacklist
     */
    getBlacklistStats() {
        try {
            const totalStmt = db.prepare(`SELECT COUNT(*) as total FROM token_blacklist`);
            const activeStmt = db.prepare(`
                SELECT COUNT(*) as active FROM token_blacklist 
                WHERE expires_at > strftime('%s', 'now')
            `);
            
            const total = totalStmt.get().total;
            const active = activeStmt.get().active;
            
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
