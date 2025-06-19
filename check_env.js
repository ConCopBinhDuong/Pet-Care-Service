/**
 * Environment Check
 * Verify Gmail environment variables are loaded
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Environment Variables Check...\n');

console.log('Gmail Email:', process.env.GMAIL_EMAIL ? '✅ Set' : '❌ Not set');
console.log('Gmail Password:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set');

if (process.env.GMAIL_EMAIL) {
    console.log('Email value:', process.env.GMAIL_EMAIL);
}

if (process.env.GMAIL_APP_PASSWORD) {
    console.log('Password length:', process.env.GMAIL_APP_PASSWORD.length);
    console.log('Password preview:', process.env.GMAIL_APP_PASSWORD.substring(0, 4) + '...');
}

console.log('\nAll environment variables:');
Object.keys(process.env).filter(key => key.includes('GMAIL') || key.includes('EMAIL')).forEach(key => {
    console.log(`${key}: ${process.env[key] ? '✅' : '❌'}`);
});
