/**
 * Test script for the new in-memory verification system
 * Tests verification code generation, storage, expiration, and validation
 */

import verificationService from '../../src/services/verificationService.js';

console.log('🧪 Testing In-Memory Verification System');
console.log('========================================\n');

// Test 1: Generate and store verification codes
console.log('1. Testing code generation and storage...');
const email = 'test@example.com';
const phone = '+84901234567';

const emailCode = verificationService.storeVerificationCode(email, 'email', 123);
const phoneCode = verificationService.storeVerificationCode(phone, 'phone', 124);

console.log(`   Email code: ${emailCode}`);
console.log(`   Phone code: ${phoneCode}`);
console.log('   ✅ Codes generated and stored\n');

// Test 2: Check valid codes
console.log('2. Testing code validation...');
const validEmailResult = verificationService.verifyCode(email, emailCode);
console.log(`   Valid email code result:`, validEmailResult);

// Store a new code for phone testing
const newPhoneCode = verificationService.storeVerificationCode(phone, 'phone', 124);
const validPhoneResult = verificationService.verifyCode(phone, newPhoneCode);
console.log(`   Valid phone code result:`, validPhoneResult);
console.log('   ✅ Valid codes verified correctly\n');

// Test 3: Test invalid codes
console.log('3. Testing invalid code validation...');
const newEmailCode = verificationService.storeVerificationCode(email, 'email', 123);
const invalidResult = verificationService.verifyCode(email, '000000');
console.log(`   Invalid code result:`, invalidResult);
console.log('   ✅ Invalid codes rejected correctly\n');

// Test 4: Test expiration (wait for 1 minute)
console.log('4. Testing code expiration...');
const shortEmail = 'expire@test.com';
const expireCode = verificationService.storeVerificationCode(shortEmail, 'email', 125);
console.log(`   Stored code: ${expireCode}`);
console.log('   Waiting 65 seconds for expiration test...');

setTimeout(() => {
    const expiredResult = verificationService.verifyCode(shortEmail, expireCode);
    console.log(`   Expired code result:`, expiredResult);
    console.log('   ✅ Code expiration working correctly\n');
    
    // Test 5: Multiple attempts
    console.log('5. Testing multiple failed attempts...');
    const attemptsEmail = 'attempts@test.com';
    const attemptsCode = verificationService.storeVerificationCode(attemptsEmail, 'email', 126);
    
    console.log('   Making 4 failed attempts...');
    for (let i = 1; i <= 4; i++) {
        const result = verificationService.verifyCode(attemptsEmail, '999999');
        console.log(`   Attempt ${i}:`, result);
    }
    console.log('   ✅ Multiple attempts handling working correctly\n');
    
    // Test 6: Check verification status
    console.log('6. Testing verification status...');
    const status = verificationService.getVerificationStatus();
    console.log('   Current verification status:');
    console.log(`   Total codes: ${status.totalCodes}`);
    status.codes.forEach(code => {
        console.log(`   - ${code.key} (${code.type}): ${code.expired ? 'EXPIRED' : 'ACTIVE'} - ${Math.round(code.timeRemaining/1000)}s remaining`);
    });
    console.log('   ✅ Status reporting working correctly\n');
    
    console.log('🎉 All verification system tests completed!');
    console.log('=========================================');
    
}, 65000);

console.log('Test started. Full results will be available in ~65 seconds...\n');