import axios from 'axios';

const BASE_URL = 'http://localhost:8383/api';
let petOwnerToken = '';
let serviceProviderToken = '';
let createdPetId = null;

// Test data
const timestamp = Date.now();
const testPetOwner = {
    username: `pet_owner_${timestamp}`,
    email: `petowner${timestamp}@example.com`,
    password: 'TestPass123',
    gender: 'Female',
    role: 'Pet owner',
    phone: `09${String(timestamp).slice(-8)}`, // Generate unique phone number
    city: 'Ho Chi Minh City',
    address: '123 Test Street, District 1'
};

const testServiceProvider = {
    username: `service_provider_${timestamp}`,
    email: `provider${timestamp}@example.com`,
    password: 'TestPass123',
    gender: 'Male',
    role: 'Service provider',
    bussiness_name: 'Test Pet Services',
    phone: `01${String(timestamp).slice(-8)}`, // Generate unique phone number
    address: '456 Service Ave, District 2'
};

const testPet = {
    name: 'Buddy',
    breed: 'Golden Retriever',
    description: 'A friendly and energetic dog',
    age: 3,
    dob: '2021-06-15',
    picture: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // 1x1 transparent PNG
};

const updatedPet = {
    name: 'Buddy Updated',
    breed: 'Labrador Retriever',
    description: 'A very friendly and calm dog',
    age: 4
};

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testPetsEndpoint() {
    console.log('🐾 Testing Pet Management Endpoints...');
    console.log('==================================================');

    let passedTests = 0;
    let totalTests = 0;

    try {
        // 1. Register a pet owner
        totalTests++;
        console.log('1. Registering pet owner...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testPetOwner);
            console.log('   ✅ Pet owner registered successfully');
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to register pet owner - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(1000); // Wait for rate limiting

        // 2. Login as pet owner
        totalTests++;
        console.log('2. Logging in as pet owner...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                username: testPetOwner.email,
                password: testPetOwner.password
            });
            petOwnerToken = loginResponse.data.token;
            console.log('   ✅ Pet owner logged in successfully');
            console.log(`   📝 Token received: ${petOwnerToken.substring(0, 20)}...`);
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to login - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
            return;
        }

        await delay(1000);

        // 3. Get pets (should be empty initially)
        totalTests++;
        console.log('3. Getting pets list (should be empty)...');
        try {
            const response = await axios.get(`${BASE_URL}/pets`, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            if (response.data.pets.length === 0) {
                console.log('   ✅ Empty pets list retrieved successfully');
                passedTests++;
            } else {
                console.log('   ❌ Expected empty list, got:', response.data.pets.length, 'pets');
            }
        } catch (error) {
            console.log(`   ❌ Failed to get pets - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(1000);

        // 4. Add a new pet
        totalTests++;
        console.log('4. Adding a new pet...');
        try {
            const response = await axios.post(`${BASE_URL}/pets`, testPet, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            createdPetId = response.data.pet.petid;
            console.log('   ✅ Pet added successfully');
            console.log(`   📝 Pet ID: ${createdPetId}, Name: ${response.data.pet.name}`);
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to add pet - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(1000);

        // 5. Get pets list (should have 1 pet now)
        totalTests++;
        console.log('5. Getting pets list (should have 1 pet)...');
        try {
            const response = await axios.get(`${BASE_URL}/pets`, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            if (response.data.pets.length === 1) {
                console.log('   ✅ Pets list retrieved with 1 pet');
                console.log(`   📝 Pet: ${response.data.pets[0].name} (${response.data.pets[0].breed})`);
                passedTests++;
            } else {
                console.log('   ❌ Expected 1 pet, got:', response.data.pets.length, 'pets');
            }
        } catch (error) {
            console.log(`   ❌ Failed to get pets - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(1000);

        // 6. Get specific pet by ID
        totalTests++;
        console.log('6. Getting specific pet by ID...');
        try {
            const response = await axios.get(`${BASE_URL}/pets/${createdPetId}`, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            console.log('   ✅ Specific pet retrieved successfully');
            console.log(`   📝 Pet: ${response.data.pet.name} (${response.data.pet.breed})`);
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to get specific pet - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(1000);

        // 7. Update pet information
        totalTests++;
        console.log('7. Updating pet information...');
        try {
            const response = await axios.put(`${BASE_URL}/pets/${createdPetId}`, updatedPet, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            console.log('   ✅ Pet updated successfully');
            console.log(`   📝 Updated pet: ${response.data.pet.name} (${response.data.pet.breed})`);
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to update pet - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(2000); // Longer delay for service provider registration

        // 8. Register service provider and test access denial
        totalTests++;
        console.log('8. Testing access control - registering service provider...');
        try {
            await axios.post(`${BASE_URL}/auth/register`, testServiceProvider);
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                username: testServiceProvider.email,
                password: testServiceProvider.password
            });
            serviceProviderToken = loginResponse.data.token;
            console.log('   ✅ Service provider registered and logged in');
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to register/login service provider - Status: ${error.response?.status}`);
        }

        await delay(1000);

        // 9. Test access denial for service provider
        totalTests++;
        console.log('9. Testing access denial for service provider...');
        try {
            await axios.get(`${BASE_URL}/pets`, {
                headers: { Authorization: `Bearer ${serviceProviderToken}` }
            });
            console.log('   ❌ Service provider should not be able to access pets endpoint');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('   ✅ Access correctly denied for service provider');
                passedTests++;
            } else {
                console.log(`   ❌ Unexpected error - Status: ${error.response?.status}`);
            }
        }

        await delay(1000);

        // 10. Test invalid pet ID
        totalTests++;
        console.log('10. Testing invalid pet ID...');
        try {
            await axios.get(`${BASE_URL}/pets/99999`, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            console.log('   ❌ Should have returned 404 for invalid pet ID');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('   ✅ Correctly returned 404 for invalid pet ID');
                passedTests++;
            } else {
                console.log(`   ❌ Unexpected error - Status: ${error.response?.status}`);
            }
        }

        await delay(1000);

        // 11. Delete the pet
        totalTests++;
        console.log('11. Deleting the pet...');
        try {
            const response = await axios.delete(`${BASE_URL}/pets/${createdPetId}`, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            console.log('   ✅ Pet deleted successfully');
            console.log(`   📝 Deleted pet: ${response.data.deletedPet.name}`);
            passedTests++;
        } catch (error) {
            console.log(`   ❌ Failed to delete pet - Status: ${error.response?.status}`);
            console.log(`   📝 Error: ${JSON.stringify(error.response?.data)}`);
        }

        await delay(1000);

        // 12. Verify pet is deleted
        totalTests++;
        console.log('12. Verifying pet deletion...');
        try {
            await axios.get(`${BASE_URL}/pets/${createdPetId}`, {
                headers: { Authorization: `Bearer ${petOwnerToken}` }
            });
            console.log('   ❌ Pet should be deleted and not accessible');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('   ✅ Pet deletion verified - no longer accessible');
                passedTests++;
            } else {
                console.log(`   ❌ Unexpected error - Status: ${error.response?.status}`);
            }
        }

    } catch (error) {
        console.error('Unexpected error during testing:', error.message);
    }

    console.log('\n🐾 Pet Management Tests Summary:');
    console.log('==================================================');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL PET MANAGEMENT TESTS PASSED!');
    } else {
        console.log('⚠️  Some tests failed. Please check the implementation.');
    }
}

// Run the tests
testPetsEndpoint().catch(console.error);
