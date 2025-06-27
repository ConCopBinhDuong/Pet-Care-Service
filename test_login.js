// Test login to get a fresh token
const testLogin = async () => {
    const loginData = {
        email: "thanhnhan1662004@gmail.com",
        password: "nhan1234"
    };

    try {
        console.log('🔄 Testing login...');
        const response = await fetch('http://localhost:10000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('📄 Response:', JSON.stringify(result, null, 2));
            console.log('🎫 New Token:', result.token);
            console.log('\n🔧 Copy this token to your browser localStorage:');
            console.log(`localStorage.setItem('pet_care_token', '${result.token}');`);
            console.log(`localStorage.setItem('pet_care_user', '${JSON.stringify(result.user)}');`);
        } else {
            console.log('❌ Login failed:');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

testLogin();
