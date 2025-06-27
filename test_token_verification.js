const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwianRpIjoiZTM0OTk5YmItNWMzYy00ZjJlLTg5MTMtYTg5YjcwZmU0MGY5IiwiaWF0IjoxNzUxMDA4MDAxLCJleHAiOjE3NTEwOTQ0MDF9.MNoMuYQ6SdAXaf4ozuFKthegsYqhRRu6BXUWMvcYX8M';
const jwtSecret = process.env.JWT_SECRET;

console.log('=== JWT Token Verification Test ===');
console.log('JWT_SECRET defined:', !!jwtSecret);
console.log('JWT_SECRET length:', jwtSecret ? jwtSecret.length : 0);

if (jwtSecret) {
  try {
    const verified = jwt.verify(token, jwtSecret);
    console.log('✅ Token verification successful!');
    console.log('Verified payload:', JSON.stringify(verified, null, 2));
    
    // Test token blacklist
    const TokenBlacklistService = require('./src/services/tokenBlacklistService');
    console.log('\n=== Token Blacklist Check ===');
    const jti = verified.jti;
    console.log('Token JTI:', jti);
    
    TokenBlacklistService.isBlacklisted(jti).then(isBlacklisted => {
      console.log('Token is blacklisted:', isBlacklisted);
      
      if (!isBlacklisted) {
        console.log('✅ Token is valid and not blacklisted');
      } else {
        console.log('❌ Token is blacklisted');
      }
    }).catch(error => {
      console.log('Error checking blacklist:', error.message);
    });
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('Error name:', error.name);
  }
} else {
  console.log('❌ JWT_SECRET not found in environment');
}
