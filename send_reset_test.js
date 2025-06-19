/**
 * Send Password Reset Email Test
 * Tests sending password reset email via Gmail
 */

import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Now import the email service
import emailService from './src/services/emailService.js';

console.log('🔐 Testing Password Reset Email via Gmail...\n');

async function sendPasswordResetTest() {
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
        
        const personalEmail = 'thanhnhan1662004@gmail.com';
        const userName = 'Thanh';
        const resetCode = emailService.generateVerificationCode();
        
        console.log(`\n📤 Sending password reset email...`);
        console.log(`   To: ${personalEmail}`);
        console.log(`   From: ${process.env.GMAIL_EMAIL}`);
        console.log(`   User: ${userName}`);
        console.log(`   Reset Code: ${resetCode}`);
        
        const result = await emailService.sendPasswordResetVerification(personalEmail, resetCode, userName);
        
        if (result.success) {
            console.log('\n🎉 SUCCESS! Password reset email sent successfully!');
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`🔑 Reset code: ${resetCode}`);
            console.log(`📬 Check your inbox: ${personalEmail}`);
            console.log('\n📱 Password reset email should arrive within 1-2 minutes');
            console.log('   - Look for "Password Reset Request - Pet Care Service" in the subject');
            console.log('   - Security warnings and instructions');
            console.log('   - Large, prominent reset code display');
        } else {
            console.log('\n❌ Failed to send password reset email:', result.error);
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check Gmail credentials in .env file');
        console.log('2. Verify internet connection');
        console.log('3. Ensure Gmail app password is valid');
    }
}

// Run the test
sendPasswordResetTest();
