#!/usr/bin/env node

/**
 * Simple Password Reset Test
 * Tests the complete workflow with manual verification code input
 */

const BASE_URL = 'http://localhost:8383/api';
const testEmail = `manual${Math.floor(Math.random() * 1000000)}@example.com`;
const testUsername = `manualuser_${Math.floor(Math.random() * 1000000)}`;
const testPhone = `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
const originalPassword = 'OriginalPass123!';
const newPassword = 'NewPassword456!';

console.log('🔐 Manual Password Reset Test');
console.log(`📧 Test Email: ${testEmail}`);
console.log(`👤 Test Username: ${testUsername}`);

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

async function runTest() {
    try {
        // Step 1: Register test user
        console.log('\n📝 Step 1: Registering test user...');
        const registerResult = await apiCall('/auth/register', 'POST', {
            username: testUsername,
            email: testEmail,
            password: originalPassword,
            gender: 'Other',
            role: 'Pet owner',
            phone: testPhone,
            city: 'Ho Chi Minh City',
            address: '123 Test Street'
        });

        if (registerResult.data && registerResult.data.success) {
            console.log('✅ User registered successfully');
        } else {
            console.log('❌ Registration failed:', registerResult.data);
            return;
        }

        // Step 2: Request password reset
        console.log('\n🔐 Step 2: Requesting password reset...');
        const forgotResult = await apiCall('/auth/forgot-password', 'POST', {
            email: testEmail
        });

        if (forgotResult.data && forgotResult.data.success) {
            console.log('✅ Password reset requested successfully');
            console.log(`💬 Message: ${forgotResult.data.message}`);
            console.log('\n📝 Check the console output above for the 6-digit verification code');
            console.log('🔢 Look for a message like: "Verification code stored for password_reset: ..."');
        } else {
            console.log('❌ Forgot password request failed:', forgotResult.data);
            return;
        }

        // Step 3: Test login with original password (should still work)
        console.log('\n🔑 Step 3: Testing login with original password...');
        const originalLoginResult = await apiCall('/auth/login', 'POST', {
            email: testEmail,
            password: originalPassword
        });

        if (originalLoginResult.data && originalLoginResult.data.success) {
            console.log('✅ Login with original password still works (as expected)');
        } else {
            console.log('⚠️ Could not login with original password:', originalLoginResult.data);
        }

        console.log('\n🏁 Test completed! Next steps:');
        console.log('1. Find the 6-digit verification code from the console output above');
        console.log('2. Use this curl command to reset the password:');
        console.log(`   curl -X POST ${BASE_URL}/auth/reset-password \\`);
        console.log(`     -H "Content-Type: application/json" \\`);
        console.log(`     -d '{"email":"${testEmail}","code":"YOUR_CODE_HERE","newPassword":"${newPassword}"}'`);
        console.log('3. Then test login with the new password:');
        console.log(`   curl -X POST ${BASE_URL}/auth/login \\`);
        console.log(`     -H "Content-Type: application/json" \\`);
        console.log(`     -d '{"email":"${testEmail}","password":"${newPassword}"}'`);

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

runTest().then(() => {
    console.log('\n🎯 Manual testing setup complete!');
});
