/**
 * Simple Gmail Test
 * Quick test to verify Gmail configuration
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('🧪 Quick Gmail Test...\n');

async function quickGmailTest() {
    try {
        console.log('Gmail Email:', process.env.GMAIL_EMAIL);
        console.log('Gmail Password configured:', !!process.env.GMAIL_APP_PASSWORD);
        
        if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
            console.log('❌ Gmail credentials not found');
            return;
        }
        
        console.log('\n📧 Creating Gmail transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
        
        console.log('✅ Transporter created');
        
        console.log('\n🔗 Testing connection...');
        await transporter.verify();
        console.log('✅ Gmail connection verified!');
        
        console.log('\n📬 Sending test email...');
        const result = await transporter.sendMail({
            from: `"Pet Care Service Test" <${process.env.GMAIL_EMAIL}>`,
            to: process.env.GMAIL_EMAIL,
            subject: 'Gmail Integration Test - Success!',
            html: `
                <h2>🎉 Gmail Integration Working!</h2>
                <p>Your Pet Care Service can now send real emails via Gmail SMTP.</p>
                <p><strong>Test completed at:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>From:</strong> ${process.env.GMAIL_EMAIL}</p>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log(`📬 Check your inbox: ${process.env.GMAIL_EMAIL}`);
        
    } catch (error) {
        console.error('❌ Gmail test failed:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔍 Authentication issue:');
            console.log('- Check your app password is correct');
            console.log('- Ensure 2FA is enabled on Gmail');
            console.log('- App password should be 16 characters without spaces');
        }
    }
}

quickGmailTest();
