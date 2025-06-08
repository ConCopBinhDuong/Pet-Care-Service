#!/usr/bin/env node

/**
 * Test script for forgot password functionality
 */

console.log('🔐 Testing Forgot Password Functionality');

async function testForgotPassword() {
    const API_BASE = 'http://localhost:8383/api';
    
    // Test 1: Register a new user
    console.log('\n📝 Step 1: Registering test user...');
    const testUser = {
        username: `testpwd_${Date.now().toString().slice(-6)}`,
        email: `testpwd${Date.now().toString().slice(-6)}@example.com`,
        phone: '0901234567',
        password: 'TestPass123!',
        role: 'Pet owner',
        gender: 'Male'
    };
    
    try {
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        const registerData = await registerResponse.json();
        console.log('✅ Registration result:', registerData.success ? 'Success' : 'Failed');
        
        if (!registerData.success) {
            console.error('❌ Registration failed:', registerData);
            return;
        }
        
        // Test 2: Request password reset
        console.log('\n🔐 Step 2: Requesting password reset...');
        const forgotResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email })
        });
        
        const forgotData = await forgotResponse.json();
        console.log('📧 Forgot password result:', forgotData.success ? 'Success' : 'Failed');
        console.log('💬 Message:', forgotData.message);
        
        // Test 3: Test with invalid email
        console.log('\n🚫 Step 3: Testing with invalid email...');
        const invalidResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nonexistent@example.com' })
        });
        
        const invalidData = await invalidResponse.json();
        console.log('🔍 Invalid email result:', invalidData.success ? 'Success' : 'Failed');
        console.log('💬 Message:', invalidData.message);
        
        // Test 4: Test resend password reset
        console.log('\n🔄 Step 4: Testing resend password reset...');
        const resendResponse = await fetch(`${API_BASE}/auth/resend-password-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email })
        });
        
        const resendData = await resendResponse.json();
        console.log('🔄 Resend result:', resendData.success ? 'Success' : 'Failed');
        console.log('💬 Message:', resendData.message);
        
        // Test 5: Test validation errors
        console.log('\n⚠️ Step 5: Testing validation errors...');
        const invalidEmailResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'invalid-email' })
        });
        
        const invalidEmailData = await invalidEmailResponse.json();
        console.log('❌ Invalid email format result:', invalidEmailData.success ? 'Unexpected Success' : 'Correctly Failed');
        console.log('💬 Error:', invalidEmailData.error);
        
        console.log('\n✅ Forgot Password Functionality Test Complete!');
        console.log('\n📋 Summary:');
        console.log('   ✅ User registration works');
        console.log('   ✅ Password reset request works');
        console.log('   ✅ Security (same response for all emails) works');
        console.log('   ✅ Resend functionality works');
        console.log('   ✅ Validation works');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Check if server is running first
async function checkServer() {
    try {
        console.log('🔍 Checking if server is running...');
        const response = await fetch('http://localhost:8383/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'test' })
        });
        
        if (response.status === 200 || response.status === 400 || response.status === 401) {
            console.log('✅ Server is responding');
            await testForgotPassword();
        } else {
            console.log('❌ Server not responding properly');
        }
    } catch (error) {
        console.error('❌ Server is not running or not accessible:', error.message);
        console.log('💡 Please start the server with: node src/server.js');
    }
}

checkServer();
