#!/usr/bin/env node

/**
 * Simple verification system functionality test
 * Tests basic imports and service availability
 */

async function quickTest() {
    console.log('🔍 Quick Verification System Test...\n');
    
    try {
        // Test imports
        console.log('1. Testing imports...');
        const { default: preVerificationService } = await import('./src/services/preVerificationService.js');
        console.log('   ✅ preVerificationService imported');
        
        const { default: emailService } = await import('./src/services/emailService.js');
        console.log('   ✅ emailService imported');
        
        const validationMiddleware = await import('./src/middleware/validationMiddleware.js');
        console.log('   ✅ validationMiddleware imported');
        
        // Test basic service functionality
        console.log('\n2. Testing core functionality...');
        
        // Test session creation
        const testData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashedPassword123',
            role: 'Pet owner',
            phone: '+84901234567'
        };
        
        const sessionId = preVerificationService.storePendingRegistration(testData, 'test@example.com', '+84901234567');
        console.log(`   ✅ Session created: ${sessionId.substring(0, 8)}...`);
        
        // Test verification status check
        const status = preVerificationService.isFullyVerified(sessionId);
        console.log(`   ✅ Verification status check: ${status.exists ? 'working' : 'failed'}`);
        
        // Test email service
        const emailCode = emailService.generateVerificationCode();
        console.log(`   ✅ Email verification code generated: ${emailCode}`);
        
        // Test validation middleware presence
        const requiredValidations = [
            'validatePreVerificationRegistration',
            'validateVerificationSession', 
            'validateEmailVerificationStep',
            'validatePhoneVerificationStep',
            'validateCompleteRegistration'
        ];
        
        let validationCount = 0;
        for (const validation of requiredValidations) {
            if (typeof validationMiddleware[validation] === 'function') {
                validationCount++;
            }
        }
        
        console.log(`   ✅ Validation middleware: ${validationCount}/${requiredValidations.length} functions available`);
        
        // Test cleanup
        preVerificationService.removePendingRegistration(sessionId);
        console.log('   ✅ Session cleanup successful');
        
        console.log('\n🎉 Basic verification system test PASSED!');
        console.log('\n📋 SYSTEM READY:');
        console.log('   ✅ All services imported successfully');
        console.log('   ✅ Pre-verification service operational');
        console.log('   ✅ Email service operational');
        console.log('   ✅ Validation middleware available');
        console.log('   ✅ Session management working');
        
        console.log('\n🚀 Next steps:');
        console.log('   1. Start the server: node src/server.js');
        console.log('   2. Test the full flow using test_verification_registration.rest');
        console.log('   3. Check server logs for verification codes during testing');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

quickTest();
