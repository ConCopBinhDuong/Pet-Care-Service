/**
 * Simple Chat System Test using API registration
 * Tests the chat functionality between pet owners and service providers
 */

import https from 'https';

// Test configuration
const BASE_URL = 'https://localhost:8443';

// Create an HTTPS agent that ignores self-signed certificate errors
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// Test data storage
let testData = {
    tokens: {},
    bookingId: null
};

/**
 * Make HTTP request with proper error handling
 */
async function makeRequest(method, endpoint, data = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            agent: httpsAgent
        };

        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = responseData ? JSON.parse(responseData) : {};
                    resolve({
                        status: res.statusCode,
                        data: parsedData,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        error: 'JSON parse error'
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

/**
 * Create a test service provider through API registration
 */
async function createServiceProvider() {
    console.log('🔧 Creating service provider...');
    
    try {
        // Register service provider
        const startVerification = await makeRequest('POST', '/api/auth/start-verification', {
            username: 'Test Service Provider',
            email: 'testprovider@test.com',
            password: 'testpass123',
            gender: 'Female',
            role: 'Service provider',
            phone: '+84987654321',
            bussiness_name: 'Test Pet Care Business',
            description: 'Professional pet care services',
            address: '456 Business Avenue'
        });

        if (startVerification.status !== 200) {
            throw new Error(`Service provider registration failed: ${JSON.stringify(startVerification.data)}`);
        }

        const sessionId = startVerification.data.sessionId;

        // Verify email (simulating the verification code process)
        const verifyEmail = await makeRequest('POST', '/api/auth/verify-email', {
            sessionId: sessionId,
            emailCode: '123456' // This might need to be adjusted based on verification system
        });

        if (verifyEmail.status !== 200) {
            // Try completing registration directly if email verification is mocked
            const completeRegistration = await makeRequest('POST', '/api/auth/complete-registration', {
                sessionId: sessionId
            });

            if (completeRegistration.status !== 201) {
                throw new Error(`Service provider registration completion failed: ${JSON.stringify(completeRegistration.data)}`);
            }
        }

        console.log('✅ Service provider created successfully');
        return true;

    } catch (error) {
        console.error('❌ Error creating service provider:', error.message);
        return false;
    }
}

/**
 * Test using existing test data if available
 */
async function testWithExistingData() {
    console.log('🔍 Testing with existing data...');

    try {
        // Try to login with common test credentials
        const testCredentials = [
            { email: 'provider@example.com', password: 'password123' },
            { email: 'testprovider@test.com', password: 'testpass123' },
            { email: 'test@provider.com', password: 'password' }
        ];

        let providerToken = null;
        let ownerToken = null;

        // Try to find working credentials
        for (const cred of testCredentials) {
            const loginResponse = await makeRequest('POST', '/api/auth/login', cred);
            if (loginResponse.status === 200) {
                console.log(`✅ Found working credentials: ${cred.email}`);
                if (loginResponse.data.user.role === 'Service provider') {
                    providerToken = loginResponse.data.token;
                } else if (loginResponse.data.user.role === 'Pet owner') {
                    ownerToken = loginResponse.data.token;
                }
            }
        }

        if (!providerToken) {
            console.log('❌ No service provider credentials found');
            return false;
        }

        testData.tokens.serviceProvider = providerToken;
        if (ownerToken) {
            testData.tokens.petOwner = ownerToken;
        }

        // Get conversations to find a booking ID
        const conversations = await makeRequest('GET', '/api/chat/conversations', null, providerToken);
        
        if (conversations.status === 200 && conversations.data.conversations.length > 0) {
            testData.bookingId = conversations.data.conversations[0].bookid;
            console.log(`✅ Found booking ID: ${testData.bookingId}`);
            return true;
        }

        console.log('❌ No bookings found for testing');
        return false;

    } catch (error) {
        console.error('❌ Error testing with existing data:', error.message);
        return false;
    }
}

/**
 * Test sending a chat message
 */
async function testSendMessage() {
    console.log('💬 Testing message sending...');

    try {
        const response = await makeRequest('POST', `/api/chat/booking/${testData.bookingId}/message`, {
            text: 'This is a test message from the automated test suite.'
        }, testData.tokens.serviceProvider);

        if (response.status === 201) {
            console.log('✅ Message sent successfully');
            console.log(`   Message: ${response.data.update.text}`);
            return true;
        } else {
            console.log(`❌ Message sending failed: ${response.status} - ${JSON.stringify(response.data)}`);
            return false;
        }

    } catch (error) {
        console.error('❌ Error sending message:', error.message);
        return false;
    }
}

/**
 * Test retrieving chat messages
 */
async function testGetMessages() {
    console.log('📖 Testing message retrieval...');

    try {
        const response = await makeRequest('GET', `/api/chat/booking/${testData.bookingId}`, null, testData.tokens.serviceProvider);

        if (response.status === 200) {
            console.log('✅ Messages retrieved successfully');
            console.log(`   Found ${response.data.messages.length} messages`);
            console.log(`   Booking status: ${response.data.booking.status}`);
            console.log(`   Can send message: ${response.data.can_send_message}`);
            return true;
        } else {
            console.log(`❌ Message retrieval failed: ${response.status} - ${JSON.stringify(response.data)}`);
            return false;
        }

    } catch (error) {
        console.error('❌ Error retrieving messages:', error.message);
        return false;
    }
}

/**
 * Test conversations list
 */
async function testGetConversations() {
    console.log('💼 Testing conversations list...');

    try {
        const response = await makeRequest('GET', '/api/chat/conversations', null, testData.tokens.serviceProvider);

        if (response.status === 200) {
            console.log('✅ Conversations retrieved successfully');
            console.log(`   Found ${response.data.conversations.length} conversations`);
            
            if (response.data.conversations.length > 0) {
                const conv = response.data.conversations[0];
                console.log(`   First conversation: Booking ${conv.bookid}, Service: ${conv.service_name}`);
                console.log(`   Message count: ${conv.message_count}, Status: ${conv.status}`);
            }
            
            return true;
        } else {
            console.log(`❌ Conversations retrieval failed: ${response.status} - ${JSON.stringify(response.data)}`);
            return false;
        }

    } catch (error) {
        console.error('❌ Error retrieving conversations:', error.message);
        return false;
    }
}

/**
 * Test API endpoint availability
 */
async function testEndpointAvailability() {
    console.log('🔍 Testing chat endpoint availability...');

    try {
        // Test health endpoint first
        const health = await makeRequest('GET', '/health');
        if (health.status !== 200) {
            console.log('❌ Server health check failed');
            return false;
        }

        console.log('✅ Server is healthy');

        // Test unauthorized access to chat endpoint
        const unauthorized = await makeRequest('GET', '/api/chat/conversations');
        if (unauthorized.status === 401) {
            console.log('✅ Chat endpoints properly require authentication');
            return true;
        } else {
            console.log(`❌ Unexpected response for unauthorized request: ${unauthorized.status}`);
            return false;
        }

    } catch (error) {
        console.error('❌ Error testing endpoint availability:', error.message);
        return false;
    }
}

/**
 * Main test runner
 */
async function runSimpleChatTests() {
    console.log('🚀 Starting Simple Chat System Tests');
    console.log('=' .repeat(50));

    try {
        // Test 1: Basic endpoint availability
        const endpointTest = await testEndpointAvailability();
        if (!endpointTest) {
            console.log('❌ Basic endpoint tests failed');
            return;
        }

        // Test 2: Try with existing test data
        const existingDataTest = await testWithExistingData();
        
        if (existingDataTest) {
            // Run chat functionality tests
            await testSendMessage();
            await testGetMessages();
            await testGetConversations();
            
            console.log('=' .repeat(50));
            console.log('🎉 Chat functionality tests completed with existing data!');
        } else {
            console.log('=' .repeat(50));
            console.log('⚠️ No existing test data found. Chat endpoints are available but need test data.');
            console.log('💡 To test fully, please create test users and bookings manually or through the API.');
        }
        
    } catch (error) {
        console.error('=' .repeat(50));
        console.error('❌ Chat tests failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
runSimpleChatTests();
