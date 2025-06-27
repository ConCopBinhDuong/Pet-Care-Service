// Simple test to debug JWT token authentication
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Import our auth middleware (convert to CommonJS require)
const authMiddleware = async (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Handle Bearer token format
    if (token.startsWith('Bearer ')) {
        token = token.substring(7);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = {
            userid: decoded.userid,
            email: decoded.email,
            role: decoded.role
        };
        
        req.tokenInfo = {
            jti: decoded.jti,
            exp: decoded.exp,
            rawToken: token
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: "Invalid token!",
            error: err.message,
            tokenProvided: !!token,
            tokenLength: token ? token.length : 0
        });
    }
};

// Test endpoint
app.get('/test-auth', authMiddleware, (req, res) => {
    res.json({
        message: 'Authentication successful!',
        user: req.user,
        tokenInfo: req.tokenInfo
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        jwtSecret: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`JWT_SECRET loaded: ${!!process.env.JWT_SECRET}`);
    console.log(`JWT_SECRET length: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0}`);
});
