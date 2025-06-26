const url = 'http://localhost:5000/api/services';
const data = {
  name: 'Dog Walk Test',
  price: 25,
  description: 'Professional dog walking service for your furry friend',
  duration: '60 minutes',
  typeid: 1,
  timeSlots: ['09:00', '14:00'],
  license: ''
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJTZXJ2aWNlIHByb3ZpZGVyIiwiaWF0IjoxNzM1MTkwMzUzLCJleHAiOjE3MzUyNzY3NTN9.Hl4IqQzrDIpG'
  },
  body: JSON.stringify(data)
})
.then(async res => {
  console.log('Status:', res.status);
  const result = await res.json();
  console.log('Response:', JSON.stringify(result, null, 2));
})
.catch(err => console.error('Error:', err));
