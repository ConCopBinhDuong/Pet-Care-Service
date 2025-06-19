/**
 * Send Welcome Email Test
 * Tests sending welcome email via Gmail after successful verification
 */

import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Now import the email service
import emailService from './src/services/emailService.js';

console.log('🎉 Testing Welcome Email via Gmail...\n');

async function sendWelcomeEmailTest() {
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
        const userRole = 'Pet owner';
        
        console.log(`\n📤 Sending welcome email...`);
        console.log(`   To: ${personalEmail}`);
        console.log(`   From: ${process.env.GMAIL_EMAIL}`);
        console.log(`   User: ${userName} (${userRole})`);
        
        const result = await emailService.sendWelcomeEmail(personalEmail, userName, userRole);
        
        if (result.success) {
            console.log('\n🎉 SUCCESS! Welcome email sent successfully!');
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`📬 Check your inbox: ${personalEmail}`);
            console.log('\n📱 Welcome email should arrive within 1-2 minutes');
            console.log('   - Look for "Welcome to Pet Care Service! 🐾" in the subject');
            console.log('   - Professional HTML email with account details');
            console.log('   - Pet owner specific content and features');
        } else {
            console.log('\n❌ Failed to send welcome email:', result.error);
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
sendWelcomeEmailTest();
