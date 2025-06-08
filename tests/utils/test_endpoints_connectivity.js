const { spawn } = require('child_process');
const http = require('http');

// Start the server
console.log('Starting server...');
const serverProcess = spawn('node', ['--env-file=.env', '--experimental-sqlite', './src/server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Wait for server to start
setTimeout(() => {
  console.log('\nTesting endpoints...');
  
  // Test basic endpoint connectivity
  const testEndpoints = [
    'http://localhost:8383/api/pets',
    'http://localhost:8383/api/diet',
    'http://localhost:8383/api/activity',
    'http://localhost:8383/api/schedule'
  ];
  
  testEndpoints.forEach((url, index) => {
    setTimeout(() => {
      const req = http.get(url, (res) => {
        console.log(`${url}: Status ${res.statusCode}`);
        res.on('data', (chunk) => {
          const response = chunk.toString();
          console.log(`Response: ${response.substring(0, 100)}...`);
        });
      });
      
      req.on('error', (err) => {
        console.log(`${url}: Error - ${err.message}`);
      });
      
      req.setTimeout(5000, () => {
        console.log(`${url}: Timeout`);
        req.destroy();
      });
    }, index * 1000);
  });
  
  // Clean up after tests
  setTimeout(() => {
    console.log('\nStopping server...');
    serverProcess.kill();
    process.exit(0);
  }, 10000);
  
}, 3000);

// Handle server process errors
serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  serverProcess.kill();
  process.exit(0);
});
