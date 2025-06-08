#!/usr/bin/env node

// Test Delete Endpoint Only
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

async function testDeleteEndpoint() {
    console.log('🗑️ Testing Delete User Endpoint...\n');
    
    try {
        // Step 1: Create a test user
        console.log('1. Creating test user for deletion...');
        const userData = {
            username: `delete_test_${Date.now()}`,
            email: `delete_test_${Date.now()}@example.com`,
            password: 'TestPass123',
            gender: 'Male',
            role: 'Pet owner',
            phone: '+84987654321',
            city: 'Test City',
            address: 'Test Address 123'
        };

        const registerOptions = {
            hostname: 'localhost',
            port: 8383,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const registerResponse = await makeRequest(registerOptions, userData);
        
        if (registerResponse.statusCode === 201) {
            console.log('   ✅ Test user created successfully');
            const token = registerResponse.body.token;
            const userId = registerResponse.body.user.id;
            console.log(`   📝 User ID: ${userId}, Email: ${userData.email}`);
            
            // Step 2: Verify user can access profile
            console.log('\n2. Verifying user profile access...');
            const profileOptions = {
                hostname: 'localhost',
                port: 8383,
                path: '/api/profile',
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const profileResponse = await makeRequest(profileOptions);
            
            if (profileResponse.statusCode === 200) {
                console.log('   ✅ User can access profile before deletion');
                console.log(`   📋 Profile: ${profileResponse.body.profile.name} (${profileResponse.body.profile.role})`);
                
                // Step 3: Delete the user account
                console.log('\n3. Deleting user account...');
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
                    console.log(`   📝 Deleted user: ${deleteResponse.body.deletedUser.email}`);
                    console.log(`   📝 Response: ${deleteResponse.body.message}`);
                    
                    // Step 4: Verify account is actually deleted
                    console.log('\n4. Verifying account deletion...');
                    const verifyResponse = await makeRequest(profileOptions);
                    
                    if (verifyResponse.statusCode === 404) {
                        console.log('   ✅ Account deletion verified - profile no longer accessible');
                        console.log('   📝 Received 404 as expected');
                        
                        console.log('\n🎉 DELETE ENDPOINT TEST PASSED!');
                        console.log('=' .repeat(50));
                        console.log('✅ User creation: SUCCESS');
                        console.log('✅ Profile access before deletion: SUCCESS');
                        console.log('✅ Account deletion: SUCCESS');
                        console.log('✅ Deletion verification: SUCCESS');
                        console.log('=' .repeat(50));
                        
                    } else {
                        console.log(`   ❌ Account deletion verification failed - Status: ${verifyResponse.statusCode}`);
                        console.log(`   📝 Expected 404, got ${verifyResponse.statusCode}`);
                    }
                } else {
                    console.log(`   ❌ Failed to delete account - Status: ${deleteResponse.statusCode}`);
                    if (deleteResponse.body) {
                        console.log(`   📝 Error: ${JSON.stringify(deleteResponse.body)}`);
                    }
                }
            } else {
                console.log(`   ❌ Failed to access profile - Status: ${profileResponse.statusCode}`);
            }
        } else {
            console.log(`   ❌ Failed to create test user - Status: ${registerResponse.statusCode}`);
            if (registerResponse.body) {
                console.log(`   📝 Error: ${JSON.stringify(registerResponse.body)}`);
            }
        }

    } catch (error) {
        console.log(`❌ Test failed with error: ${error.message}`);
    }
}

// Run the test
testDeleteEndpoint();
