// Test backend API directly
const testBackendDashboard = async () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwianRpIjoiNWJmNDY1NmQtNGY3NS00NDMyLTg2MmUtZWM5NGJiNDE4ZWQ5IiwiaWF0IjoxNzUxMDA5MDg1LCJleHAiOjE3NTEwOTU0ODV9.V4mbijAW4IOxs0jFrAl4JypEGeTyQOh57v4oV_LVaMo";

    try {
        console.log('🔍 Testing backend dashboard API directly...');
        const response = await fetch('http://localhost:10000/api/schedule/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        
        const result = await response.json();
        console.log('Response data:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ Backend dashboard API working');
        } else {
            console.log('❌ Backend dashboard API failed');
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

testBackendDashboard();
