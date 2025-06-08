import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:8383/api';
const PET_OWNER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJwZXRvd25lcjFAZXhhbXBsZS5jb20iLCJyb2xlIjoicGV0X293bmVyIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzQ5MzA3Nzc2LCJleHAiOjE3NDkzOTQxNzZ9.jKhc2q3IFlFXbQITpFXtj5pB9eIO55CBzy1mF3ZWJ24';

console.log('🧪 QUICK PET API TEST');
console.log('='.repeat(50));

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = PET_OWNER_TOKEN) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const responseData = await response.text();
        
        console.log(`\n${method} ${endpoint}`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (responseData) {
            try {
                const jsonData = JSON.parse(responseData);
                console.log('Response:', JSON.stringify(jsonData, null, 2));
            } catch {
                console.log('Response:', responseData);
            }
        }
        
        return { status: response.status, data: responseData };
    } catch (error) {
        console.log(`\n❌ Error with ${method} ${endpoint}:`, error.message);
        return { status: 0, data: null };
    }
}

// Test sequence
async function runTests() {
    console.log('Testing Pet Management API...\n');
    
    // 1. Test authentication - List pets
    console.log('1️⃣ Testing Authentication (GET /pets)');
    await apiRequest('GET', '/pets');
    
    // 2. Create a test pet
    console.log('\n2️⃣ Creating a Test Pet (POST /pets)');
    const testPet = {
        name: 'Test Pet',
        breed: 'Test Breed',
        age: 2,
        dateOfBirth: '2022-01-01',
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAA'
    };
    
    const createResult = await apiRequest('POST', '/pets', testPet);
    
    // 3. List pets again to see the created pet
    console.log('\n3️⃣ Listing Pets After Creation (GET /pets)');
    await apiRequest('GET', '/pets');
    
    // 4. Test invalid token
    console.log('\n4️⃣ Testing Invalid Token Access');
    await apiRequest('GET', '/pets', null, 'invalid_token');
    
    // 5. Test access without token
    console.log('\n5️⃣ Testing Access Without Token');
    await apiRequest('GET', '/pets', null, '');
    
    console.log('\n✅ Quick test completed!');
    console.log('\nNext steps:');
    console.log('- Use test_pets_comprehensive.rest for full testing');
    console.log('- Check server logs for detailed information');
    console.log('- Verify database content if needed');
}

// Run the tests
runTests().catch(console.error);
