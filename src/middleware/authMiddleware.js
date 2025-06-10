import jwt from 'jsonwebtoken'
import tokenBlacklistService from '../services/tokenBlacklistService.js'

// JWT Secret (same as auth.js for consistency)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

function authMiddleware(req, res, next) {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Handle Bearer token format
    if (token.startsWith('Bearer ')) {
        token = token.substring(7);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token!" });
        }

        // Check if token is blacklisted (if JTI is present)
        if (decoded.jti && tokenBlacklistService.isTokenBlacklisted(decoded.jti)) {
            return res.status(401).json({ 
                message: "Token has been revoked",
                error: "TOKEN_REVOKED"
            });
        }

        req.user = {
            userid: decoded.userid,
            email: decoded.email,
            role: decoded.role
        };
        
        // Store token info for potential blacklisting
        req.tokenInfo = {
            jti: decoded.jti,
            exp: decoded.exp,
            rawToken: token
        };
        
        next();
    });
}

export default authMiddleware
