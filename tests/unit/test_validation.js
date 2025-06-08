#!/usr/bin/env node

// Comprehensive validation tests for Profile Endpoint
import http from 'http';

const BASE_URL = 'http://localhost:8383';

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    };
                    resolve(response);
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testValidation() {
    console.log('🔍 Testing Vietnamese Phone Validation...\n');

    // Test Vietnamese phone validation
    const phoneTests = [
        { phone: '+84901234567', valid: true, network: 'Mobifone' },
        { phone: '0901234567', valid: true, network: 'Mobifone' },
        { phone: '+84981234567', valid: true, network: 'Viettel' },
        { phone: '+84561234567', valid: true, network: 'Vinaphone' },
        { phone: '+84521234567', valid: true, network: 'Vietnamobile' },
        { phone: '+84991234567', valid: true, network: 'Gmobile' },
        { phone: '+1234567890', valid: false, reason: 'Non-Vietnamese number' },
        { phone: '123456789', valid: false, reason: 'Too short' },
        { phone: '+849012345678', valid: false, reason: 'Too long' },
        { phone: '+84201234567', valid: false, reason: 'Invalid network prefix' }
    ];

    for (let i = 0; i < phoneTests.length; i++) {
        const test = phoneTests[i];
        console.log(`${i + 1}. Testing ${test.phone} (${test.valid ? 'Valid' : 'Invalid'})...`);

        const registerData = {
            username: `test_user_${i}`,
            email: `test${i}@example.com`,
            password: 'TestPass123',
            gender: 'Male',
            role: 'Pet owner',
            phone: test.phone,
            city: 'Test City',
            address: 'Test Address 123'
        };

        const options = {
            hostname: 'localhost',
            port: 8383,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        try {
            const response = await makeRequest(options, registerData);
            
            if (test.valid) {
                if (response.statusCode === 201) {
                    console.log(`   ✅ Valid phone accepted (${test.network})`);
                } else {
                    console.log(`   ❌ Valid phone rejected - Status: ${response.statusCode}`);
                    console.log(`   Error: ${JSON.stringify(response.body)}`);
                }
            } else {
                if (response.statusCode === 400) {
                    console.log(`   ✅ Invalid phone rejected (${test.reason})`);
                } else {
                    console.log(`   ❌ Invalid phone accepted - Status: ${response.statusCode}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Request failed: ${error.message}`);
        }
    }

    console.log('\n🏁 Phone validation testing completed!');
}

async function testAuthenticationErrors() {
    console.log('\n🔐 Testing Authentication Errors...\n');

    // Test 1: Access profile without token
    console.log('1. Testing profile access without token...');
    const noTokenOptions = {
        hostname: 'localhost',
        port: 8383,
        path: '/api/profile',
        method: 'GET'
    };

    const noTokenResponse = await makeRequest(noTokenOptions);
    if (noTokenResponse.statusCode === 401) {
        console.log('   ✅ Correctly rejected request without token');
    } else {
        console.log(`   ❌ Unexpected response: ${noTokenResponse.statusCode}`);
    }

    // Test 2: Access profile with invalid token
    console.log('\n2. Testing profile access with invalid token...');
    const invalidTokenOptions = {
        hostname: 'localhost',
        port: 8383,
        path: '/api/profile',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer invalid.token.here'
        }
    };

    const invalidTokenResponse = await makeRequest(invalidTokenOptions);
    if (invalidTokenResponse.statusCode === 401) {
        console.log('   ✅ Correctly rejected invalid token');
    } else {
        console.log(`   ❌ Unexpected response: ${invalidTokenResponse.statusCode}`);
    }

    console.log('\n🏁 Authentication testing completed!');
}

// Run all tests
async function runAllTests() {
    try {
        await testValidation();
        await testAuthenticationErrors();
    } catch (error) {
        console.error('❌ Tests failed:', error.message);
        console.log('\nℹ️  Make sure the server is running on port 8383');
    }
}

runAllTests();
