// Test the new token
const newToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwianRpIjoiNWJmNDY1NmQtNGY3NS00NDMyLTg2MmUtZWM5NGJiNDE4ZWQ5IiwiaWF0IjoxNzUxMDA5MDg1LCJleHAiOjE3NTEwOTU0ODV9.V4mbijAW4IOxs0jFrAl4JypEGeTyQOh57v4oV_LVaMo";

const testNewToken = async () => {
    try {
        console.log('🔍 Testing new token...');
        
        // Test token validation endpoint
        const response = await fetch('http://localhost:10000/debug/validate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: newToken })
        });

        const result = await response.json();
        console.log('Token validation result:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('✅ New token is VALID');
            
            // Test protected endpoint
            console.log('\n🔍 Testing protected endpoint...');
            const protectedResponse = await fetch('http://localhost:10000/api/notifications/stats', {
                headers: {
                    'Authorization': `Bearer ${newToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const protectedResult = await protectedResponse.json();
            console.log('Protected endpoint result:', JSON.stringify(protectedResult, null, 2));
            
            if (protectedResponse.ok) {
                console.log('✅ Protected endpoint access SUCCESSFUL');
            } else {
                console.log('❌ Protected endpoint access failed');
            }
        } else {
            console.log('❌ New token is INVALID');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testNewToken();
