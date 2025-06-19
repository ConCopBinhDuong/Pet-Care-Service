/**
 * Send OTP to Personal Gmail Test
 * Sends a verification code to thanhnhan1662004@gmail.com
 */

import emailService from './src/services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 Sending OTP to Personal Gmail...\n');

async function sendOTPToPersonalEmail() {
    try {
        console.log('🔧 Testing Gmail connection...');
        const connectionTest = await emailService.testConnection();
        
        if (!connectionTest.success) {
            console.log('❌ Gmail connection failed:', connectionTest.error);
            return;
        }
        
        console.log('✅ Gmail connection verified');
        
        // Generate a verification code
        const otpCode = emailService.generateVerificationCode();
        const personalEmail = 'thanhnhan1662004@gmail.com';
        const userName = 'Thanh';
        
        console.log(`\n📤 Sending OTP verification email...`);
        console.log(`   To: ${personalEmail}`);
        console.log(`   From: ${process.env.GMAIL_EMAIL}`);
        console.log(`   Code: ${otpCode}`);
        
        const result = await emailService.sendEmailVerification(personalEmail, otpCode, userName);
        
        if (result.success) {
            console.log('\n🎉 SUCCESS! OTP email sent successfully!');
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`🔑 Your verification code: ${otpCode}`);
            console.log(`📬 Check your inbox: ${personalEmail}`);
            console.log('\n📱 The email contains:');
            console.log('   - A 6-digit verification code');
            console.log('   - Professional HTML template');
            console.log('   - Pet Care Service branding');
            console.log('   - 1-minute expiry notice');
        } else {
            console.log('\n❌ Failed to send OTP email:', result.error);
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Ensure server dependencies are installed: npm install');
        console.log('2. Check Gmail credentials in .env file');
        console.log('3. Verify internet connection');
        console.log('4. Check Gmail app password is valid');
    }
}

// Run the test
sendOTPToPersonalEmail();
