/**
 * Manual Email Verification Test
 * Tests verification with the actual code received
 */

import verificationService from './src/services/verificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const email = 'thanhnhan1662004@gmail.com';
const receivedCode = '788561';

console.log('🔍 Manual Email Verification Test...\n');

// Test the verification directly
console.log(`📧 Email: ${email}`);
console.log(`🔑 Code received: ${receivedCode}`);

// Check if there's a verification code for this email
console.log('\n🧪 Testing verification...');

const result = verificationService.verifyCode(email, receivedCode);
console.log('Verification result:', result);

// Also check the verification status
const status = verificationService.getVerificationStatus();
console.log('\n📊 Current verification status:');
console.log(`Total codes: ${status.totalCodes}`);

if (status.codes.length > 0) {
    console.log('\nActive verification codes:');
    status.codes.forEach(code => {
        console.log(`- ${code.key}: ${code.code} (${code.type}) - ${code.expired ? 'EXPIRED' : 'ACTIVE'}`);
    });
} else {
    console.log('No active verification codes found');
}

console.log('\n💡 Note: If verification fails, it might mean the code has expired or was already used.');
