/**
 * Gmail Integration Test
 * Tests the real Gmail email sending functionality
 */

import emailService from './src/services/emailService.js';

console.log('🧪 Testing Gmail Integration...\n');

async function testGmailIntegration() {
    try {
        console.log('1. Testing email service connection...');
        const connectionTest = await emailService.testConnection();
        console.log('   Result:', connectionTest);
        
        if (!connectionTest.success) {
            console.log('\n❌ Connection test failed. Check your Gmail configuration in .env file');
            console.log('   Make sure you have:');
            console.log('   - GMAIL_EMAIL=your.email@gmail.com');
            console.log('   - GMAIL_APP_PASSWORD=your_16_digit_app_password');
            return;
        }
        
        console.log('\n2. Testing email verification sending...');
        
        // Get test email from user or use default
        const testEmail = process.argv[2] || 'test@example.com';
        const testCode = '123456';
        const testUser = 'Test User';
        
        console.log(`   Sending test verification email to: ${testEmail}`);
        
        const emailResult = await emailService.sendEmailVerification(testEmail, testCode, testUser);
        console.log('   Email verification result:', emailResult);
        
        if (emailResult.success) {
            console.log('\n✅ SUCCESS! Email verification sent successfully');
            if (process.env.GMAIL_EMAIL) {
                console.log(`   📧 Check the inbox of: ${testEmail}`);
                console.log('   📱 Look for verification code: 123456');
            }
        } else {
            console.log('\n❌ Email sending failed:', emailResult.error);
        }
        
        console.log('\n3. Testing welcome email sending...');
        const welcomeResult = await emailService.sendWelcomeEmail(testEmail, testUser, 'Pet owner');
        console.log('   Welcome email result:', welcomeResult);
        
        console.log('\n4. Testing password reset email...');
        const resetResult = await emailService.sendPasswordResetVerification(testEmail, '654321', testUser);
        console.log('   Password reset result:', resetResult);
        
        console.log('\n🎉 Gmail integration test completed!');
        
        if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
            console.log('\n📧 Real emails were sent using Gmail SMTP');
            console.log(`   From: ${process.env.GMAIL_EMAIL}`);
            console.log(`   To: ${testEmail}`);
            console.log('   ✅ Check your email inbox for 3 test emails');
        } else {
            console.log('\n📝 Development mode - emails were logged to console');
            console.log('   To enable real Gmail sending:');
            console.log('   1. Uncomment GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env');
            console.log('   2. Set your Gmail credentials');
            console.log('   3. Run this test again');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed with error:', error);
        console.log('\nTroubleshooting:');
        console.log('1. Check your .env file configuration');
        console.log('2. Verify Gmail App Password is correct');
        console.log('3. Ensure 2-Step Verification is enabled on Gmail');
        console.log('4. Check your internet connection');
    }
}

// Run the test
testGmailIntegration();
