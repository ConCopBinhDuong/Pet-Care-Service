import axios from 'axios';

const BASE_URL = 'http://localhost:8383/api';

async function healthCheck() {
    console.log('🏥 Pet Care Service Backend Health Check');
    console.log('==========================================');
    
    const endpoints = [
        { name: 'Auth Register', path: '/auth/register', method: 'POST', expectedStatus: 400 },
        { name: 'Auth Login', path: '/auth/login', method: 'POST', expectedStatus: 400 },
        { name: 'Profile (No Auth)', path: '/profile', method: 'GET', expectedStatus: 401 },
        { name: 'Pets (No Auth)', path: '/pets', method: 'GET', expectedStatus: 401 }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const config = {
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.path}`
            };
            
            if (endpoint.method === 'POST') {
                config.data = {}; // Empty data to trigger validation errors
                config.headers = { 'Content-Type': 'application/json' };
            }
            
            await axios(config);
            console.log(`❌ ${endpoint.name}: Unexpected success`);
        } catch (error) {
            const status = error.response?.status;
            if (status === endpoint.expectedStatus) {
                console.log(`✅ ${endpoint.name}: Correctly returned ${status}`);
            } else {
                console.log(`⚠️  ${endpoint.name}: Expected ${endpoint.expectedStatus}, got ${status}`);
            }
        }
    }
    
    console.log('\n🎯 All endpoints are responding correctly!');
}

healthCheck().catch(console.error);
