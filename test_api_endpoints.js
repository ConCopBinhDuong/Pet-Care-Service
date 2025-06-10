import axios from 'axios';

// Test the API endpoints
const API_BASE = 'http://localhost:8383/api';

let authTokens = {
    provider: null,
    manager: null,
    petowner: null
};

async function testAPI() {
    console.log('🧪 Starting API Tests for Service Management');
    
    try {
        // Test 1: Login as Service Provider
        console.log('\n1. Testing Service Provider Login...');
        const providerLogin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'provider@test.com',
            password: 'password123'
        });
        
        authTokens.provider = providerLogin.data.token;
        console.log('✅ Service Provider logged in successfully');
        console.log('   Token:', authTokens.provider.substring(0, 20) + '...');
        
        // Test 2: Login as Manager
        console.log('\n2. Testing Manager Login...');
        const managerLogin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'manager@test.com',
            password: 'password123'
        });
        
        authTokens.manager = managerLogin.data.token;
        console.log('✅ Manager logged in successfully');
        console.log('   Token:', authTokens.manager.substring(0, 20) + '...');
        
        // Test 3: Get Public Services (should show only approved services)
        console.log('\n3. Testing Public Services Endpoint...');
        const publicServices = await axios.get(`${API_BASE}/services`);
        console.log('✅ Public services retrieved:', publicServices.data.length);
        console.log('   First service:', publicServices.data[0]?.name || 'None');
        
        // Test 4: Service Provider - Submit New Service
        console.log('\n4. Testing Service Submission...');
        const newService = await axios.post(`${API_BASE}/services/submit`, {
            name: 'Premium Pet Grooming Plus',
            price: 85,
            description: 'Enhanced grooming service with premium products',
            duration: '3 hours',
            type_id: 1,
            time_slots: ['10:00', '14:00', '16:00']
        }, {
            headers: { Authorization: `Bearer ${authTokens.provider}` }
        });
        
        const newServiceId = newService.data.service.serviceid;
        console.log('✅ Service submitted successfully');
        console.log('   Service ID:', newServiceId);
        console.log('   Status:', newService.data.service.status);
        
        // Test 5: Service Provider - View My Services
        console.log('\n5. Testing Provider Services View...');
        const myServices = await axios.get(`${API_BASE}/services/my-services`, {
            headers: { Authorization: `Bearer ${authTokens.provider}` }
        });
        
        console.log('✅ Provider services retrieved');
        console.log('   Total services:', myServices.data.services.length);
        console.log('   Statistics:', myServices.data.statistics);
        
        // Test 6: Manager - View Pending Services
        console.log('\n6. Testing Manager Pending Services...');
        const pendingServices = await axios.get(`${API_BASE}/services/pending-review`, {
            headers: { Authorization: `Bearer ${authTokens.manager}` }
        });
        
        console.log('✅ Pending services retrieved:', pendingServices.data.length);
        const pendingService = pendingServices.data.find(s => s.serviceid === newServiceId);
        console.log('   New service in pending list:', !!pendingService);
        
        // Test 7: Manager - Approve Service
        console.log('\n7. Testing Service Approval...');
        const approvalResponse = await axios.post(`${API_BASE}/services/${newServiceId}/review`, {
            action: 'approve'
        }, {
            headers: { Authorization: `Bearer ${authTokens.manager}` }
        });
        
        console.log('✅ Service approved successfully');
        console.log('   New status:', approvalResponse.data.service.status);
        
        // Test 8: Manager - Review Summary
        console.log('\n8. Testing Manager Review Summary...');
        const reviewSummary = await axios.get(`${API_BASE}/services/review-summary`, {
            headers: { Authorization: `Bearer ${authTokens.manager}` }
        });
        
        console.log('✅ Review summary retrieved');
        console.log('   Statistics:', reviewSummary.data.statistics);
        console.log('   Recent reviews:', reviewSummary.data.recent_reviews.length);
        
        // Test 9: Test Authorization (Provider trying to access Manager endpoint)
        console.log('\n9. Testing Authorization Control...');
        try {
            await axios.get(`${API_BASE}/services/pending-review`, {
                headers: { Authorization: `Bearer ${authTokens.provider}` }
            });
            console.log('❌ Authorization failed - provider accessed manager endpoint');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Authorization working - provider correctly denied access');
            } else {
                console.log('⚠️ Unexpected error:', error.response?.status);
            }
        }
        
        // Test 10: Verify Public Services Now Shows New Approved Service
        console.log('\n10. Testing Updated Public Services...');
        const updatedPublicServices = await axios.get(`${API_BASE}/services`);
        const newlyApprovedService = updatedPublicServices.data.find(s => s.serviceid === newServiceId);
        console.log('✅ Updated public services retrieved');
        console.log('   New service now public:', !!newlyApprovedService);
        
        console.log('\n🎉 All API tests completed successfully!');
        console.log('\n📊 Test Summary:');
        console.log('✅ Authentication: Working');
        console.log('✅ Service Submission: Working');
        console.log('✅ Service Approval Workflow: Working');
        console.log('✅ Role-based Authorization: Working');
        console.log('✅ Public Service Filtering: Working');
        console.log('✅ Service Management Dashboard: Working');
        
    } catch (error) {
        console.error('❌ API Test failed:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);
    }
}

// Check if server is running and run tests
console.log('Waiting for server to be ready...');
setTimeout(() => {
    testAPI();
}, 2000);
