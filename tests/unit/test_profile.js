#!/usr/bin/env node

// Test script for Profile Endpoint Implementation
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

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testProfileEndpoints() {
    console.log('🧪 Testing Profile Endpoint Implementation...\n');

    try {
        // Test 1: Register a Pet Owner
        console.log('1. Registering Pet Owner...');
        const petOwnerData = {
            username: `test_pet_owner_${Date.now()}`,
            email: `petowner${Date.now()}@test.com`,
            password: 'TestPass123',
            gender: 'Male',
            role: 'Pet owner',
            phone: `+849${Math.floor(Math.random() * 100000000)}`,
            city: 'Ho Chi Minh City',
            address: '123 Test Street, District 1, HCMC'
        };

        const registerOptions = {
            hostname: 'localhost',
            port: 8383,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const registerResponse = await makeRequest(registerOptions, petOwnerData);
        console.log(`   Status: ${registerResponse.statusCode}`);
        
        if (registerResponse.statusCode === 201) {
            console.log('   ✅ Pet owner registered successfully');
            const token = registerResponse.body.token;
            
            // Test 2: Get Profile
            console.log('\n2. Getting Pet Owner Profile...');
            const profileOptions = {
                hostname: 'localhost',
                port: 8383,
                path: '/api/profile',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const profileResponse = await makeRequest(profileOptions);
            console.log(`   Status: ${profileResponse.statusCode}`);
            
            if (profileResponse.statusCode === 200) {
                console.log('   ✅ Profile retrieved successfully');
                console.log('   Profile data:', JSON.stringify(profileResponse.body.profile, null, 2));
                
                // Test 3: Update Profile
                console.log('\n3. Updating Pet Owner Profile...');
                const updateData = {
                    name: 'Updated Pet Owner',
                    phone: `+849${Math.floor(Math.random() * 100000000)}`,
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
                console.log(`   Status: ${updateResponse.statusCode}`);
                
                if (updateResponse.statusCode === 200) {
                    console.log('   ✅ Profile updated successfully');
                    
                    // Test 4: Get Updated Profile
                    console.log('\n4. Getting Updated Profile...');
                    const updatedProfileResponse = await makeRequest(profileOptions);
                    
                    if (updatedProfileResponse.statusCode === 200) {
                        console.log('   ✅ Updated profile retrieved successfully');
                        console.log('   Updated profile:', JSON.stringify(updatedProfileResponse.body.profile, null, 2));
                    } else {
                        console.log('   ❌ Failed to get updated profile');
                    }
                } else {
                    console.log('   ❌ Failed to update profile');
                    console.log('   Error:', registerResponse.body);
                }
            } else {
                console.log('   ❌ Failed to get profile');
                console.log('   Error:', profileResponse.body);
            }
        } else {
            console.log('   ❌ Failed to register pet owner');
            console.log('   Error:', registerResponse.body);
        }

        console.log('\n🏁 Profile endpoint testing completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\nℹ️  Make sure the server is running on port 8383');
        console.log('   Run: npm run dev');
    }
}

// Run tests
testProfileEndpoints();
