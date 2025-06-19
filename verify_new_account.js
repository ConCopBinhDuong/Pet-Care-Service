/**
 * Verify New Account Test
 * Tests verification with the code 188269 for thanhnhan1662004+newtest@gmail.com
 */

import dotenv from 'dotenv';
dotenv.config();

import verificationService from './src/services/verificationService.js';
import emailService from './src/services/emailService.js';
import db from './src/Database_sqlite.js';

const email = 'thanhnhan1662004+newtest@gmail.com';
const receivedCode = '188269';
const userName = 'New Test Account';

console.log('🔍 Verifying New Account...\n');

async function verifyNewAccount() {
    try {
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Code received: ${receivedCode}`);
        console.log(`👤 User: ${userName}`);

        // Check verification status first
        console.log('\n📊 Current verification status:');
        const status = verificationService.getVerificationStatus();
        console.log(`Total codes: ${status.totalCodes}`);

        if (status.codes.length > 0) {
            console.log('\nActive verification codes:');
            status.codes.forEach(code => {
                console.log(`- ${code.key}: ${code.code} (${code.type}) - ${code.expired ? 'EXPIRED' : 'ACTIVE'}`);
                console.log(`  Time remaining: ${Math.floor(code.timeRemaining / 1000)}s`);
            });
        } else {
            console.log('No active verification codes found');
        }

        // Try to verify the code
        console.log('\n🧪 Testing verification...');
        const result = verificationService.verifyCode(email, receivedCode);
        console.log('Verification result:', result);

        if (result.success) {
            console.log('\n🎉 SUCCESS! Code verified successfully!');
            
            // Update database to mark email as verified
            console.log('📝 Updating database...');
            const updateStmt = db.prepare('UPDATE users SET email_verified = 1 WHERE email = ?');
            const updateResult = updateStmt.run(email);
            console.log(`Database updated: ${updateResult.changes} rows affected`);
            
            // Initialize Gmail and send welcome email
            console.log('\n📧 Sending welcome email...');
            emailService.initializeGmail();
            
            const welcomeResult = await emailService.sendWelcomeEmail(email, userName, 'Pet owner');
            console.log('Welcome email result:', welcomeResult);
            
            if (welcomeResult.success) {
                console.log('\n🎊 COMPLETE SUCCESS! 🎊');
                console.log('✅ Email verified successfully');
                console.log('✅ Database updated');
                console.log('✅ Welcome email sent via Gmail');
                console.log(`📧 Message ID: ${welcomeResult.messageId}`);
                console.log(`📬 Check your inbox: ${email} for welcome email!`);
            }
            
        } else {
            console.log('\n❌ Verification failed:', result.error);
            console.log('\nPossible reasons:');
            console.log('1. Code has expired (1 minute limit)');
            console.log('2. Code was already used');
            console.log('3. Too many attempts');
            console.log('4. Email/code mismatch');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

// Run the verification
verifyNewAccount();
