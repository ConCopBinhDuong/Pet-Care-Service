// Test authentication first
fetch('http://localhost:10000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'thanhnhan1662004@gmail.com',
    password: 'password123'
  })
})
.then(async res => {
  console.log('Login Status:', res.status);
  const result = await res.json();
  console.log('Login Response:', JSON.stringify(result, null, 2));
  
  if (result.token) {
    // Test service creation with fresh token
    return fetch('http://localhost:10000/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.token}`
      },
      body: JSON.stringify({
        name: 'Dog Walk Test',
        price: 25,
        description: 'Professional dog walking service for your furry friend',
        duration: '60 minutes',
        typeid: 1,
        timeSlots: ['09:00', '14:00'],
        license: ''
      })
    });
  }
  return null;
})
.then(async res => {
  if (res) {
    console.log('Service Creation Status:', res.status);
    const result = await res.json();
    console.log('Service Creation Response:', JSON.stringify(result, null, 2));
  }
})
.catch(err => console.error('Error:', err));
