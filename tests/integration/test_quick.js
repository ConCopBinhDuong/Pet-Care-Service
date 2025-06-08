#!/usr/bin/env node

// Quick Backend Test - Rate Limit Friendly Version
// Tests core functionality with fewer requests to avoid rate limiting
import http from 'http';

const BASE_URL = 'http://localhost:8383';

// Helper function to make HTTP requests
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

// Helper function to add delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Quick test of key functionality
async function runQuickTest() {
    console.log('⚡ Quick Backend Functionality Test (Rate Limit Friendly)\n');
    console.log('=' .repeat(50));

    let passed = 0;
    const totalTests = 6;

    try {
        // Test 1: Server Health Check
        console.log('1. Testing server health...');
        const healthOptions = {
            hostname: 'localhost',
            port: 8383,
            path: '/',
            method: 'GET'
        };

        const healthResponse = await makeRequest(healthOptions);
        if (healthResponse.statusCode === 200) {
            console.log('   ✅ Server is responding');
            passed++;
        } else {
            console.log(`   ❌ Server health check failed: ${healthResponse.statusCode}`);
        }

        await delay(2000); // 2 second delay

        // Test 2: Authentication without token
        console.log('\n2. Testing authentication protection...');
        const noTokenOptions = {
            hostname: 'localhost',
            port: 8383,
            path: '/api/profile',
            method: 'GET'
        };

        const noTokenResponse = await makeRequest(noTokenOptions);
        if (noTokenResponse.statusCode === 401) {
            console.log('   ✅ Protected routes require authentication');
            passed++;
        } else {
            console.log(`   ❌ Authentication protection failed: ${noTokenResponse.statusCode}`);
        }

        await delay(2000); // 2 second delay

        // Test 3: Valid Vietnamese phone registration
        console.log('\n3. Testing simplified Vietnamese phone validation...');
        const validPhoneData = {
            username: `test_user_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'TestPass123',
            gender: 'Male',
            role: 'Pet owner',
            phone: '+84123456789', // Simple Vietnamese phone (any 9 digits after +84)
            city: 'Ho Chi Minh City',
            address: '123 Test Street'
        };

        const registerOptions = {
            hostname: 'localhost',
            port: 8383,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const validPhoneResponse = await makeRequest(registerOptions, validPhoneData);
        if (validPhoneResponse.statusCode === 201) {
            console.log('   ✅ Simplified Vietnamese phone validation working');
            passed++;

            // Save token for further tests
            const token = validPhoneResponse.body.token;

            await delay(2000); // 2 second delay

            // Test 4: Profile retrieval
            console.log('\n4. Testing profile retrieval...');
            const profileOptions = {
                hostname: 'localhost',
                port: 8383,
                path: '/api/profile',
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const profileResponse = await makeRequest(profileOptions);
            if (profileResponse.statusCode === 200 && profileResponse.body.profile) {
                console.log('   ✅ Profile retrieved successfully');
                passed++;
            } else {
                console.log(`   ❌ Profile retrieval failed: ${profileResponse.statusCode}`);
            }

            await delay(2000); // 2 second delay

            // Test 5: Profile update
            console.log('\n5. Testing profile update...');
            const updateData = {
                name: 'Updated Test User',
                city: 'Hanoi'
            };

            const updateOptions = {
                hostname: 'localhost',
                port: 8383,
                path: '/api/profile',
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const updateResponse = await makeRequest(updateOptions, updateData);
            if (updateResponse.statusCode === 200) {
                console.log('   ✅ Profile updated successfully');
                passed++;

                await delay(2000); // 2 second delay

                // Test 6: Account deletion
                console.log('\n6. Testing account deletion...');
                const deleteOptions = {
                    hostname: 'localhost',
                    port: 8383,
                    path: '/api/profile',
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                };

                const deleteResponse = await makeRequest(deleteOptions);
                if (deleteResponse.statusCode === 200) {
                    console.log('   ✅ Account deleted successfully');
                    passed++;
                } else {
                    console.log(`   ❌ Account deletion failed: ${deleteResponse.statusCode}`);
                }

            } else {
                console.log(`   ❌ Profile update failed: ${updateResponse.statusCode}`);
            }

        } else if (validPhoneResponse.statusCode === 429) {
            console.log('   ⚠️  Rate limited - please wait and try again');
        } else {
            console.log(`   ❌ Valid phone registration failed: ${validPhoneResponse.statusCode}`);
        }

        // Summary
        console.log('\n' + '=' .repeat(50));
        console.log('📊 QUICK TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log(`🎯 Tests Passed: ${passed}/${totalTests}`);
        
        if (passed === totalTests) {
            console.log('🎉 ALL TESTS PASSED! Backend core functionality is working.');
        } else if (passed >= totalTests - 1) {
            console.log('✅ Most tests passed. Backend is likely working correctly.');
        } else {
            console.log('⚠️  Some core functionality may have issues.');
        }
        
        console.log('=' .repeat(50));

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\nℹ️  Make sure the server is running:');
        console.log('   npm run dev');
    }
}

// Run quick test
runQuickTest();
