import axios from 'axios';

async function testSimple() {
    try {
        console.log('Testing pets endpoint...');
        const response = await axios.get('http://localhost:8383/api/pets');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
    }
}

testSimple();
