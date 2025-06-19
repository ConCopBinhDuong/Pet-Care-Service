/**
 * Complete Gmail Email Test
 * Tests all three email types: verification, welcome, and password reset
 */

import dotenv from 'dotenv';
dotenv.config();

import emailService from './src/services/emailService.js';

console.log('📧 Complete Gmail Email Integration Test...\n');

async function testAllEmailTypes() {
    try {
        // Initialize Gmail
        emailService.initializeGmail();
        
        console.log('🔧 Testing Gmail connection...');
        const connectionTest = await emailService.testConnection();
        
        if (!connectionTest.success) {
            console.log('❌ Gmail connection failed:', connectionTest.error);
            return;
        }
        
        console.log('✅ Gmail connection verified\n');
        
        const testEmail = 'thanhnhan1662004@gmail.com';
        const userName = 'Thanh';
        
        // Test 1: Email Verification
        console.log('📤 Test 1: Sending Email Verification...');
        const verificationCode = emailService.generateVerificationCode();
        console.log(`   Code: ${verificationCode}`);
        
        const verificationResult = await emailService.sendEmailVerification(testEmail, verificationCode, userName);
        console.log('   Result:', verificationResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (verificationResult.messageId) {
            console.log(`   Message ID: ${verificationResult.messageId}`);
        }
        console.log('');
        
        // Wait a moment between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 2: Welcome Email
        console.log('📤 Test 2: Sending Welcome Email...');
        const welcomeResult = await emailService.sendWelcomeEmail(testEmail, userName, 'Pet owner');
        console.log('   Result:', welcomeResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (welcomeResult.messageId) {
            console.log(`   Message ID: ${welcomeResult.messageId}`);
        }
        console.log('');
        
        // Wait a moment between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 3: Password Reset Email
        console.log('📤 Test 3: Sending Password Reset Email...');
        const resetCode = emailService.generateVerificationCode();
        console.log(`   Reset Code: ${resetCode}`);
        
        const resetResult = await emailService.sendPasswordResetVerification(testEmail, resetCode, userName);
        console.log('   Result:', resetResult.success ? '✅ SUCCESS' : '❌ FAILED');
        if (resetResult.messageId) {
            console.log(`   Message ID: ${resetResult.messageId}`);
        }
        console.log('');
        
        // Summary
        console.log('🎉 Gmail Integration Test Complete!');
        console.log('=====================================');
        console.log(`📧 All emails sent to: ${testEmail}`);
        console.log(`📤 From: ${process.env.GMAIL_EMAIL}`);
        console.log('');
        console.log('📱 Check your Gmail inbox for:');
        console.log('1. 📧 Email Verification Code');
        console.log('2. 🎉 Welcome Email');
        console.log('3. 🔐 Password Reset Email');
        console.log('');
        console.log('🔑 Your codes:');
        console.log(`   Verification: ${verificationCode}`);
        console.log(`   Password Reset: ${resetCode}`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check Gmail credentials in .env file');
        console.log('2. Verify internet connection');
        console.log('3. Ensure Gmail app password is valid');
    }
}

// Run the complete test
testAllEmailTypes();
