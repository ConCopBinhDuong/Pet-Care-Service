import jwt from 'jsonwebtoken';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwianRpIjoiZTM0OTk5YmItNWMzYy00ZjJlLTg5MTMtYTg5YjcwZmU0MGY5IiwiaWF0IjoxNzUxMDA4MDAxLCJleHAiOjE3NTEwOTQ0MDF9.MNoMuYQ6SdAXaf4ozuFKthegsYqhRRu6BXUWMvcYX8M";
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

console.log('🔍 Token Analysis:');
console.log('JWT_SECRET:', JWT_SECRET);

try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token is VALID');
    console.log('📄 Decoded payload:', JSON.stringify(decoded, null, 2));
    
    const now = Math.floor(Date.now() / 1000);
    console.log('⏰ Current time:', now);
    console.log('⏰ Token expires:', decoded.exp);
    console.log('⏰ Time until expiry:', decoded.exp - now, 'seconds');
    
    if (decoded.exp > now) {
        console.log('✅ Token is NOT EXPIRED');
    } else {
        console.log('❌ Token is EXPIRED');
    }
} catch (error) {
    console.error('❌ Token verification failed:', error.message);
}
