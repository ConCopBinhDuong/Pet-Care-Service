// Debug script to test token authentication
import jwt from 'jsonwebtoken';

// JWT Secret (same as in the application)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

console.log('Testing token authentication...');
console.log('JWT_SECRET:', JWT_SECRET);

// Test token creation (similar to login process)
const testPayload = {
    userid: 1,
    email: 'test@example.com',
    role: 'Pet owner',
    jti: 'test-jti-123'
};

const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
console.log('\nGenerated test token:', testToken);

// Test token verification (similar to auth middleware)
try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('\nToken verification successful:');
    console.log('Decoded payload:', decoded);
} catch (error) {
    console.error('\nToken verification failed:', error.message);
}

// Test with Bearer prefix
const bearerToken = `Bearer ${testToken}`;
console.log('\nBearer token format:', bearerToken);

// Extract token from Bearer format
const extractedToken = bearerToken.startsWith('Bearer ') ? bearerToken.substring(7) : bearerToken;
console.log('Extracted token:', extractedToken);

try {
    const decoded = jwt.verify(extractedToken, JWT_SECRET);
    console.log('\nExtracted token verification successful:');
    console.log('Decoded payload:', decoded);
} catch (error) {
    console.error('\nExtracted token verification failed:', error.message);
}
