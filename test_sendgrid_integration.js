/**
 * SendGrid Integration Test
 * Tests the real SendGrid email sending functionality
 */

import emailService from './src/services/emailService.js';

console.log('🧪 Testing SendGrid Integration...\n');

async function testSendGridIntegration() {
    try {
        console.log('1. Testing SendGrid service connection...');
        const connectionTest = await emailService.testConnection();
        console.log('   Result:', connectionTest);
        
        if (!connectionTest.success) {
            console.log('\n❌ Connection test failed. Check your SendGrid configuration in .env file');
            console.log('   Make sure you have:');
            console.log('   - SENDGRID_API_KEY=your_sendgrid_api_key');
            console.log('   - SENDGRID_FROM_EMAIL=your_verified_sender@example.com');
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
            if (process.env.SENDGRID_API_KEY) {
                console.log(`   📧 Check the inbox of: ${testEmail}`);
                console.log('   📱 Look for verification code: 123456');
                console.log(`   📤 Sent from: ${process.env.SENDGRID_FROM_EMAIL || 'noreply@petcare.com'}`);
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
        
        console.log('\n🎉 SendGrid integration test completed!');
        
        if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
            console.log('\n📧 Real emails were sent using SendGrid API');
            console.log(`   From: ${process.env.SENDGRID_FROM_EMAIL}`);
            console.log(`   To: ${testEmail}`);
            console.log('   ✅ Check your email inbox for 3 test emails');
            console.log('   📈 Check SendGrid dashboard for delivery statistics');
        } else {
            console.log('\n📝 Development mode - emails were logged to console');
            console.log('   To enable real SendGrid sending:');
            console.log('   1. Sign up for SendGrid account at https://sendgrid.com');
            console.log('   2. Get your API key from SendGrid dashboard');
            console.log('   3. Verify a sender email address');
            console.log('   4. Uncomment SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in .env');
            console.log('   5. Set your SendGrid credentials');
            console.log('   6. Run this test again');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed with error:', error);
        console.log('\nTroubleshooting:');
        console.log('1. Check your .env file configuration');
        console.log('2. Verify SendGrid API key is correct');
        console.log('3. Ensure sender email is verified in SendGrid');
        console.log('4. Check SendGrid account status and quotas');
        console.log('5. Check your internet connection');
    }
}

// Run the test
testSendGridIntegration();
