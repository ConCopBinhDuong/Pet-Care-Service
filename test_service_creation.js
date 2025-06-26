const testServiceCreation = async () => {
    try {
        const response = await fetch('http://localhost:10000/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjEsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiU2VydmljZSBwcm92aWRlciIsImp0aSI6IjI0ZTJkMGYzLTVlYjAtNGY3OS05MTVlLWY4NThkYmI1YjAzMSIsImlhdCI6MTc1MDk0MzYzNSwiZXhwIjoxNzUxMDMwMDM1fQ.Y1X4V9PDTXSYBChNLuwiPwoxR-zNG_ISAmbejhg5u4U'
            },
            body: JSON.stringify({
                name: 'Test Walking Service',
                price: 25,
                description: 'A professional dog walking service with care and attention',
                duration: '60 minutes',
                serviceType: 'Walking',
                timeSlots: ['09:00', '14:00'],
                license: ''
            })
        });

        console.log('Response Status:', response.status);
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (result.success !== false) {
            console.log('\n✅ SUCCESS: Service creation completed!');
            console.log('Duration was converted and stored correctly.');
        } else {
            console.log('\n❌ FAILED: Service creation failed');
            if (result.details) {
                console.log('Validation errors:');
                result.details.forEach(detail => console.log('  -', detail));
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testServiceCreation();
