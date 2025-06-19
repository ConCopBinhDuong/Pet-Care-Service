/**
 * Send OTP with Proper Environment Loading
 * Ensures environment variables are loaded before importing email service
 */

import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Now import the email service
import emailService from './src/services/emailService.js';

console.log('📧 Sending OTP to Personal Gmail (with proper env loading)...\n');

async function sendOTPWithProperEnv() {
    try {
        // Force re-initialization of email service with current environment
        emailService.initializeGmail();
        
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
            console.log('\n📱 Email should arrive within 1-2 minutes');
            console.log('   - Look for "Pet Care Service" in the sender');
            console.log('   - Subject: "Verify Your Email Address - Pet Care Service"');
            console.log('   - The code will be prominently displayed');
        } else {
            console.log('\n❌ Failed to send OTP email:', result.error);
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check Gmail credentials in .env file');
        console.log('2. Verify internet connection');
        console.log('3. Ensure Gmail app password is valid');
        console.log('4. Check if 2FA is enabled on Gmail account');
    }
}

// Run the test
sendOTPWithProperEnv();
