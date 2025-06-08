#!/usr/bin/env node

// Simple server health check
import http from 'http';

function healthCheck() {
    const options = {
        hostname: 'localhost',
        port: 8383,
        path: '/',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Server is running! Status: ${res.statusCode}`);
        console.log('🚀 Profile endpoints are ready for testing');
        process.exit(0);
    });

    req.on('error', (error) => {
        console.log('❌ Server is not running or not accessible');
        console.log(`   Error: ${error.message}`);
        console.log('\n📝 To start the server, run:');
        console.log('   npm run dev');
        console.log('   or');
        console.log('   node --env-file=.env --experimental-sqlite ./src/server.js');
        process.exit(1);
    });

    req.on('timeout', () => {
        console.log('❌ Server response timeout');
        req.destroy();
        process.exit(1);
    });

    req.end();
}

console.log('🔍 Checking server health...');
healthCheck();
