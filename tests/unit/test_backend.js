#!/usr/bin/env node

// Comprehensive Backend Test Suite for Pet Care Service
// Consolidates all automated testing functionality
import http from 'http';

const BASE_URL = 'http://localhost:8383';

// Shared HTTP request helper
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

// Helper function to add delay between requests to avoid rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Suite 1: Vietnamese Phone Validation
async function testVietnamesePhoneValidation() {
    console.log('📱 Testing Vietnamese Phone Validation...\n');

    const phoneTests = [
        { phone: '+84901234567', valid: true, description: 'International format with +84' },
        { phone: '84901234567', valid: true, description: 'International format without +' },
        { phone: '0901234567', valid: true, description: 'Domestic format with 0' },
        { phone: '+84123456789', valid: true, description: 'Any Vietnamese mobile (previously restricted)' },
        { phone: '84987654321', valid: true, description: 'Any Vietnamese mobile (international)' },
        { phone: '0123456789', valid: true, description: 'Any Vietnamese mobile (domestic)' },
        { phone: '+1234567890', valid: false, reason: 'Non-Vietnamese country code' },
        { phone: '123456789', valid: false, reason: 'Too short (missing country/area code)' },
        { phone: '+849012345678', valid: false, reason: 'Too long' },
        { phone: '+84abc123456', valid: false, reason: 'Contains non-numeric characters' }
    ];

    let passed = 0;
    for (let i = 0; i < phoneTests.length; i++) {
        const test = phoneTests[i];
        console.log(`${i + 1}. Testing ${test.phone} (${test.valid ? 'Valid' : 'Invalid'})...`);

        const registerData = {
            username: `test_phone_${i}_${Date.now()}`,
            email: `phone_test_${i}_${Date.now()}@example.com`,
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
                    console.log(`   ✅ Valid phone accepted (${test.description})`);
                    passed++;
                } else {
                    console.log(`   ❌ Valid phone rejected - Status: ${response.statusCode}`);
                }
            } else {
                if (response.statusCode === 400) {
                    console.log(`   ✅ Invalid phone rejected (${test.reason})`);
                    passed++;
                } else {
                    console.log(`   ❌ Invalid phone accepted - Status: ${response.statusCode}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Request failed: ${error.message}`);
        }
        
        // Add delay to avoid rate limiting
        await delay(200);
    }

    console.log(`\n📱 Phone validation: ${passed}/${phoneTests.length} tests passed\n`);
    return passed === phoneTests.length;
}

// Test Suite 2: Authentication & Authorization
async function testAuthentication() {
    console.log('🔐 Testing Authentication & Authorization...\n');

    let passed = 0;
    const totalTests = 3;

    // Test 1: Access profile without token
    console.log('1. Testing profile access without token...');
    const noTokenOptions = {
        hostname: 'localhost',
        port: 8383,
        path: '/api/profile',
        method: 'GET'
    };

    try {
        const noTokenResponse = await makeRequest(noTokenOptions);
        if (noTokenResponse.statusCode === 401) {
            console.log('   ✅ Correctly rejected request without token');
            passed++;
        } else {
            console.log(`   ❌ Unexpected response: ${noTokenResponse.statusCode}`);
        }
    } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
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

    try {
        const invalidTokenResponse = await makeRequest(invalidTokenOptions);
        if (invalidTokenResponse.statusCode === 401) {
            console.log('   ✅ Correctly rejected invalid token');
            passed++;
        } else {
            console.log(`   ❌ Unexpected response: ${invalidTokenResponse.statusCode}`);
        }
    } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
    }

    // Test 3: Invalid login credentials
    console.log('\n3. Testing invalid login credentials...');
    const invalidLoginOptions = {
        hostname: 'localhost',
        port: 8383,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const invalidLoginData = {
        username: 'nonexistent@example.com',
        password: 'wrongpassword'
    };

    try {
        const invalidLoginResponse = await makeRequest(invalidLoginOptions, invalidLoginData);
        if (invalidLoginResponse.statusCode === 404) {
            console.log('   ✅ Correctly rejected invalid credentials');
            passed++;
        } else {
            console.log(`   ❌ Unexpected response: ${invalidLoginResponse.statusCode}`);
        }
    } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
    }

    console.log(`\n🔐 Authentication: ${passed}/${totalTests} tests passed\n`);
    return passed === totalTests;
}

// Test Suite 3: Profile Functionality
async function testProfileFunctionality() {
    console.log('👤 Testing Profile Functionality...\n');

    let passed = 0;
    const totalTests = 4;

    try {
        // Test 1: Register a Pet Owner
        console.log('1. Registering Pet Owner...');
        const petOwnerData = {
            username: `test_pet_owner_${Date.now()}`,
            email: `petowner_${Date.now()}@test.com`,
            password: 'TestPass123',
            gender: 'Male',
            role: 'Pet owner',
            phone: `+849${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            city: 'Ho Chi Minh City',
            address: '123 Test Street, District 1, HCMC'
        };

        const registerOptions = {
            hostname: 'localhost',
            port: 8383,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const registerResponse = await makeRequest(registerOptions, petOwnerData);
        
        if (registerResponse.statusCode === 201) {
            console.log('   ✅ Pet owner registered successfully');
            passed++;
            const token = registerResponse.body.token;
            
            // Test 2: Get Profile
            console.log('\n2. Getting Pet Owner Profile...');
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
                
                // Test 3: Update Profile
                console.log('\n3. Updating Pet Owner Profile...');
                const updateData = {
                    name: 'Updated Pet Owner',
                    phone: `+849${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
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
                    
                    // Test 4: Get Updated Profile
                    console.log('\n4. Verifying Profile Update...');
                    const updatedProfileResponse = await makeRequest(profileOptions);
                    
                    if (updatedProfileResponse.statusCode === 200 && 
                        updatedProfileResponse.body.profile.name === updateData.name) {
                        console.log('   ✅ Profile update verified successfully');
                        passed++;
                    } else {
                        console.log('   ❌ Profile update verification failed');
                    }
                } else {
                    console.log(`   ❌ Failed to update profile - Status: ${updateResponse.statusCode}`);
                }
            } else {
                console.log(`   ❌ Failed to get profile - Status: ${profileResponse.statusCode}`);
            }
        } else {
            console.log(`   ❌ Failed to register pet owner - Status: ${registerResponse.statusCode}`);
        }

    } catch (error) {
        console.log(`   ❌ Profile test failed: ${error.message}`);
    }

    console.log(`\n👤 Profile functionality: ${passed}/${totalTests} tests passed\n`);
    return passed === totalTests;
}

// Test Suite 5: Account Deletion
async function testAccountDeletion() {
    console.log('🗑️ Testing Account Deletion...\n');
    
    let passed = 0;
    const totalTests = 3;

    try {
        // Test 1: Register a test user for deletion
        console.log('1. Creating test user for deletion...');
        const registerData = {
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

        const registerResponse = await makeRequest(registerOptions, registerData);
        
        if (registerResponse.statusCode === 201) {
            console.log('   ✅ Test user created successfully');
            passed++;
            
            const token = registerResponse.body.token;
            const userId = registerResponse.body.user.id;
            
            // Test 2: Delete the user account
            console.log('\n2. Deleting user account...');
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
                passed++;
                
                // Test 3: Verify account is deleted (profile access should fail)
                console.log('\n3. Verifying account deletion...');
                const profileOptions = {
                    hostname: 'localhost',
                    port: 8383,
                    path: '/api/profile',
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                };

                const profileResponse = await makeRequest(profileOptions);
                
                if (profileResponse.statusCode === 404) {
                    console.log('   ✅ Account deletion verified - profile no longer accessible');
                    passed++;
                } else {
                    console.log(`   ❌ Account deletion verification failed - Status: ${profileResponse.statusCode}`);
                }
            } else {
                console.log(`   ❌ Failed to delete account - Status: ${deleteResponse.statusCode}`);
            }
        } else {
            console.log(`   ❌ Failed to create test user - Status: ${registerResponse.statusCode}`);
        }

    } catch (error) {
        console.log(`   ❌ Account deletion test failed: ${error.message}`);
    }

    console.log(`\n🗑️ Account deletion: ${passed}/${totalTests} tests passed\n`);
    return passed === totalTests;
}

// Test Suite 4: Service Provider Registration
async function testServiceProviderRegistration() {
    console.log('🏥 Testing Service Provider Registration...\n');

    const serviceProviderData = {
        username: `test_provider_${Date.now()}`,
        email: `provider_${Date.now()}@test.com`,
        password: 'TestPass123',
        gender: 'Other',
        role: 'Service provider',
        bussiness_name: 'Test Pet Clinic',
        phone: `+849${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        description: 'A test veterinary clinic',
        address: '456 Provider Street, District 2, HCMC',
        website: 'https://testclinic.com'
    };

    const registerOptions = {
        hostname: 'localhost',
        port: 8383,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const response = await makeRequest(registerOptions, serviceProviderData);
        
        if (response.statusCode === 201) {
            console.log('   ✅ Service provider registered successfully');
            
            // Get provider profile to verify registration
            const token = response.body.token;
            const profileOptions = {
                hostname: 'localhost',
                port: 8383,
                path: '/api/profile',
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const profileResponse = await makeRequest(profileOptions);
            
            if (profileResponse.statusCode === 200 && 
                profileResponse.body.profile.role === 'Service provider') {
                console.log('   ✅ Service provider profile verified');
                console.log(`\n🏥 Service provider registration: 2/2 tests passed\n`);
                return true;
            } else {
                console.log('   ❌ Service provider profile verification failed');
            }
        } else {
            console.log(`   ❌ Service provider registration failed - Status: ${response.statusCode}`);
        }
    } catch (error) {
        console.log(`   ❌ Service provider test failed: ${error.message}`);
    }

    console.log(`\n🏥 Service provider registration: 0/2 tests passed\n`);
    return false;
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Pet Care Service Backend Test Suite...\n');
    console.log('=' .repeat(60));

    const results = {
        phoneValidation: false,
        authentication: false,
        profileFunctionality: false,
        accountDeletion: false,
        serviceProviderRegistration: false
    };

    try {
        // Run all test suites with delays between them
        results.phoneValidation = await testVietnamesePhoneValidation();
        await delay(1000); // Wait 1 second between test suites
        
        results.authentication = await testAuthentication();
        await delay(1000);
        
        results.profileFunctionality = await testProfileFunctionality();
        await delay(1000);
        
        results.accountDeletion = await testAccountDeletion();
        await delay(1000);
        
        results.serviceProviderRegistration = await testServiceProviderRegistration();

        // Summary
        console.log('=' .repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('=' .repeat(60));
        
        const passed = Object.values(results).filter(Boolean).length;
        const total = Object.keys(results).length;
        
        console.log(`📱 Vietnamese Phone Validation: ${results.phoneValidation ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🔐 Authentication & Authorization: ${results.authentication ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`👤 Profile Functionality: ${results.profileFunctionality ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🗑️ Account Deletion: ${results.accountDeletion ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🏥 Service Provider Registration: ${results.serviceProviderRegistration ? '✅ PASSED' : '❌ FAILED'}`);
        
        console.log('\n' + '=' .repeat(60));
        console.log(`🎯 OVERALL RESULT: ${passed}/${total} test suites passed`);
        
        if (passed === total) {
            console.log('🎉 ALL TESTS PASSED! Backend is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please check the issues above.');
        }
        
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('❌ Test suite failed with error:', error.message);
        console.log('\nℹ️  Make sure the server is running:');
        console.log('   npm run dev');
        console.log('   or');
        console.log('   node --env-file=.env --experimental-sqlite ./src/server.js');
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export { runAllTests, testVietnamesePhoneValidation, testAuthentication, testProfileFunctionality, testServiceProviderRegistration };
