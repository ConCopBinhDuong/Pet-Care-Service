import fetch from 'node:test'; // Using built-in test for simple fetch alternative
import http from 'http';

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test endpoints
async function testEndpoints() {
  const baseUrl = 'http://localhost:8383';
  
  console.log('Testing Pet Care Service Backend Endpoints...\n');
  
  // Test 1: Basic connectivity (should return 401 Unauthorized)
  console.log('1. Testing basic connectivity...');
  try {
    const response = await makeRequest(`${baseUrl}/api/pets`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.data.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 2: Diet endpoint
  console.log('\n2. Testing diet endpoint...');
  try {
    const response = await makeRequest(`${baseUrl}/api/diet`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.data.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 3: Activity endpoint
  console.log('\n3. Testing activity endpoint...');
  try {
    const response = await makeRequest(`${baseUrl}/api/activity`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.data.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 4: Schedule endpoint
  console.log('\n4. Testing schedule endpoint...');
  try {
    const response = await makeRequest(`${baseUrl}/api/schedule`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.data.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 5: Auth endpoint (should be accessible)
  console.log('\n5. Testing auth endpoint...');
  try {
    const response = await makeRequest(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.data.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\nEndpoint testing completed.');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await makeRequest('http://localhost:8383/api/auth/register', {
      method: 'GET'
    });
    console.log('Server is running! Starting tests...\n');
    await testEndpoints();
  } catch (error) {
    console.log('Server is not running. Please start the server with:');
    console.log('npm start');
    console.log('\nOr manually:');
    console.log('node --env-file=.env --experimental-sqlite ./src/server.js');
  }
}

checkServer();
