/**
 * Comprehensive Chat System Test
 * Tests the chat functionality between pet owners and service providers
 */

import https from 'https';
import bcrypt from 'bcryptjs';
import db from './src/Database_sqlite.js';

// Test configuration
const BASE_URL = 'https://localhost:8443';
const TEST_TIMEOUT = 30000;

// Create an HTTPS agent that ignores self-signed certificate errors
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// Test data storage
let testData = {
    petOwner: null,
    serviceProvider: null,
    manager: null,
    service: null,
    booking: null,
    tokens: {}
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
 * Setup test data in database
 */
function setupTestData() {
    console.log('🔄 Setting up test data...');
    
    try {
        // Hash the password for test users
        const hashedPassword = bcrypt.hashSync('hashedpassword123', 10);
        
        // Create test users
        const insertUserStmt = db.prepare(`
            INSERT INTO users (name, email, password, gender, role, email_verified)
            VALUES (?, ?, ?, ?, ?, 1)
        `);

        // Pet Owner
        const petOwnerResult = insertUserStmt.run(
            'Test Pet Owner',
            'petowner@test.com',
            hashedPassword,
            'Male',
            'Pet owner'
        );
        testData.petOwner = { id: petOwnerResult.lastInsertRowid };

        // Service Provider
        const providerResult = insertUserStmt.run(
            'Test Service Provider',
            'provider@test.com',
            hashedPassword,
            'Female',
            'Service provider'
        );
        testData.serviceProvider = { id: providerResult.lastInsertRowid };

        // Manager
        const managerResult = insertUserStmt.run(
            'Test Manager',
            'manager@test.com',
            hashedPassword,
            'Other',
            'Manager'
        );
        testData.manager = { id: managerResult.lastInsertRowid };

        // Create pet owner profile
        const insertPetOwnerStmt = db.prepare(`
            INSERT INTO petowner (id, phone, city, address)
            VALUES (?, ?, ?, ?)
        `);
        insertPetOwnerStmt.run(testData.petOwner.id, '+84123456789', 'Ho Chi Minh City', '123 Test Street');

        // Create service provider profile
        const insertProviderStmt = db.prepare(`
            INSERT INTO serviceprovider (id, bussiness_name, phone, description, address)
            VALUES (?, ?, ?, ?, ?)
        `);
        insertProviderStmt.run(
            testData.serviceProvider.id,
            'Test Pet Care Business',
            '+84987654321',
            'Professional pet care services',
            '456 Business Avenue'
        );

        // Create manager profile
        const insertManagerStmt = db.prepare(`
            INSERT INTO manager (id) VALUES (?)
        `);
        insertManagerStmt.run(testData.manager.id);

        // Create service type
        const insertServiceTypeStmt = db.prepare(`
            INSERT INTO servicetype (type) VALUES (?)
        `);
        const serviceTypeResult = insertServiceTypeStmt.run('Pet Grooming');

        // Create service
        const insertServiceStmt = db.prepare(`
            INSERT INTO service (name, price, description, duration, typeid, providerid, status)
            VALUES (?, ?, ?, ?, ?, ?, 'approved')
        `);
        const serviceResult = insertServiceStmt.run(
            'Basic Pet Grooming',
            50,
            'Complete grooming service for your pet',
            '2 hours',
            serviceTypeResult.lastInsertRowid,
            testData.serviceProvider.id
        );
        testData.service = { id: serviceResult.lastInsertRowid };

        // Create time slot
        const insertTimeSlotStmt = db.prepare(`
            INSERT INTO timeslot (serviceid, slot) VALUES (?, ?)
        `);
        insertTimeSlotStmt.run(testData.service.id, '10:00');

        // Create booking
        const insertBookingStmt = db.prepare(`
            INSERT INTO booking (poid, svid, slot, servedate, payment_method, status)
            VALUES (?, ?, ?, ?, ?, 'confirmed')
        `);
        const bookingResult = insertBookingStmt.run(
            testData.petOwner.id,
            testData.service.id,
            '10:00',
            '2025-06-20',
            'cash'
        );
        testData.booking = { id: bookingResult.lastInsertRowid };

        console.log('✅ Test data setup complete');
        console.log(`   Pet Owner ID: ${testData.petOwner.id}`);
        console.log(`   Service Provider ID: ${testData.serviceProvider.id}`);
        console.log(`   Manager ID: ${testData.manager.id}`);
        console.log(`   Service ID: ${testData.service.id}`);
        console.log(`   Booking ID: ${testData.booking.id}`);

    } catch (error) {
        console.error('❌ Error setting up test data:', error.message);
        throw error;
    }
}

/**
 * Login and get authentication tokens
 */
async function loginUsers() {
    console.log('🔐 Logging in test users...');

    try {
        // Login Pet Owner
        const petOwnerLogin = await makeRequest('POST', '/api/auth/login', {
            email: 'petowner@test.com',
            password: 'hashedpassword123'
        });

        if (petOwnerLogin.status !== 200) {
            throw new Error(`Pet owner login failed: ${JSON.stringify(petOwnerLogin.data)}`);
        }
        testData.tokens.petOwner = petOwnerLogin.data.token;

        // Login Service Provider
        const providerLogin = await makeRequest('POST', '/api/auth/login', {
            email: 'provider@test.com',
            password: 'hashedpassword123'
        });

        if (providerLogin.status !== 200) {
            throw new Error(`Service provider login failed: ${JSON.stringify(providerLogin.data)}`);
        }
        testData.tokens.serviceProvider = providerLogin.data.token;

        // Login Manager
        const managerLogin = await makeRequest('POST', '/api/auth/login', {
            email: 'manager@test.com',
            password: 'hashedpassword123'
        });

        if (managerLogin.status !== 200) {
            throw new Error(`Manager login failed: ${JSON.stringify(managerLogin.data)}`);
        }
        testData.tokens.manager = managerLogin.data.token;

        console.log('✅ All users logged in successfully');

    } catch (error) {
        console.error('❌ Error during user login:', error.message);
        throw error;
    }
}

/**
 * Test chat message sending (service provider to pet owner)
 */
async function testSendChatMessage() {
    console.log('💬 Testing chat message sending...');

    try {
        // Test 1: Send text message from service provider
        const textMessage = await makeRequest('POST', `/api/chat/booking/${testData.booking.id}/message`, {
            text: 'Hello! I will be grooming your pet tomorrow. Please make sure your pet is clean and ready.'
        }, testData.tokens.serviceProvider);

        if (textMessage.status !== 201) {
            throw new Error(`Text message failed: ${JSON.stringify(textMessage.data)}`);
        }

        console.log('✅ Text message sent successfully');
        console.log(`   Update #${textMessage.data.update.no_update}: ${textMessage.data.update.text}`);

        // Test 2: Send message with image (base64)
        const sampleImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 pixel PNG
        
        const imageMessage = await makeRequest('POST', `/api/chat/booking/${testData.booking.id}/message`, {
            text: 'Here is a photo of your pet during grooming.',
            image: sampleImageBase64
        }, testData.tokens.serviceProvider);

        if (imageMessage.status !== 201) {
            throw new Error(`Image message failed: ${JSON.stringify(imageMessage.data)}`);
        }

        console.log('✅ Image message sent successfully');
        console.log(`   Update #${imageMessage.data.update.no_update}: ${imageMessage.data.update.text}`);
        console.log(`   Has image: ${imageMessage.data.update.has_image}`);

        // Test 3: Try sending from pet owner (should fail)
        const ownerMessage = await makeRequest('POST', `/api/chat/booking/${testData.booking.id}/message`, {
            text: 'Thank you for the update!'
        }, testData.tokens.petOwner);

        if (ownerMessage.status !== 403) {
            throw new Error(`Pet owner should not be able to send messages, but got status: ${ownerMessage.status}`);
        }

        console.log('✅ Pet owner correctly denied from sending messages');

        // Test 4: Try sending empty message (should fail validation)
        const emptyMessage = await makeRequest('POST', `/api/chat/booking/${testData.booking.id}/message`, {
        }, testData.tokens.serviceProvider);

        if (emptyMessage.status !== 400) {
            throw new Error(`Empty message should fail validation, but got status: ${emptyMessage.status}`);
        }

        console.log('✅ Empty message correctly rejected');

    } catch (error) {
        console.error('❌ Error in chat message sending test:', error.message);
        throw error;
    }
}

/**
 * Test retrieving chat messages
 */
async function testGetChatMessages() {
    console.log('📖 Testing chat message retrieval...');

    try {
        // Test 1: Pet owner retrieves messages
        const ownerMessages = await makeRequest('GET', `/api/chat/booking/${testData.booking.id}`, null, testData.tokens.petOwner);

        if (ownerMessages.status !== 200) {
            throw new Error(`Pet owner message retrieval failed: ${JSON.stringify(ownerMessages.data)}`);
        }

        console.log('✅ Pet owner can retrieve messages');
        console.log(`   Found ${ownerMessages.data.messages.length} messages`);
        console.log(`   Can send message: ${ownerMessages.data.can_send_message}`);

        // Test 2: Service provider retrieves messages
        const providerMessages = await makeRequest('GET', `/api/chat/booking/${testData.booking.id}`, null, testData.tokens.serviceProvider);

        if (providerMessages.status !== 200) {
            throw new Error(`Service provider message retrieval failed: ${JSON.stringify(providerMessages.data)}`);
        }

        console.log('✅ Service provider can retrieve messages');
        console.log(`   Found ${providerMessages.data.messages.length} messages`);
        console.log(`   Can send message: ${providerMessages.data.can_send_message}`);

        // Test 3: Manager retrieves messages
        const managerMessages = await makeRequest('GET', `/api/chat/booking/${testData.booking.id}`, null, testData.tokens.manager);

        if (managerMessages.status !== 200) {
            throw new Error(`Manager message retrieval failed: ${JSON.stringify(managerMessages.data)}`);
        }

        console.log('✅ Manager can retrieve messages');
        console.log(`   Found ${managerMessages.data.messages.length} messages`);

        // Test 4: Unauthorized user (should fail)
        const unauthorizedMessages = await makeRequest('GET', `/api/chat/booking/999`, null, testData.tokens.petOwner);

        if (unauthorizedMessages.status !== 404) {
            throw new Error(`Unauthorized access should fail, but got status: ${unauthorizedMessages.status}`);
        }

        console.log('✅ Unauthorized access correctly denied');

    } catch (error) {
        console.error('❌ Error in chat message retrieval test:', error.message);
        throw error;
    }
}

/**
 * Test conversations list
 */
async function testGetConversations() {
    console.log('💼 Testing conversations list...');

    try {
        // Test 1: Pet owner's conversations
        const ownerConversations = await makeRequest('GET', '/api/chat/conversations', null, testData.tokens.petOwner);

        if (ownerConversations.status !== 200) {
            throw new Error(`Pet owner conversations failed: ${JSON.stringify(ownerConversations.data)}`);
        }

        console.log('✅ Pet owner conversations retrieved');
        console.log(`   Found ${ownerConversations.data.conversations.length} conversations`);

        // Test 2: Service provider's conversations
        const providerConversations = await makeRequest('GET', '/api/chat/conversations', null, testData.tokens.serviceProvider);

        if (providerConversations.status !== 200) {
            throw new Error(`Service provider conversations failed: ${JSON.stringify(providerConversations.data)}`);
        }

        console.log('✅ Service provider conversations retrieved');
        console.log(`   Found ${providerConversations.data.conversations.length} conversations`);

        // Test 3: Manager's conversations (should see all)
        const managerConversations = await makeRequest('GET', '/api/chat/conversations', null, testData.tokens.manager);

        if (managerConversations.status !== 200) {
            throw new Error(`Manager conversations failed: ${JSON.stringify(managerConversations.data)}`);
        }

        console.log('✅ Manager conversations retrieved');
        console.log(`   Found ${managerConversations.data.conversations.length} conversations`);

    } catch (error) {
        console.error('❌ Error in conversations test:', error.message);
        throw error;
    }
}

/**
 * Test image retrieval
 */
async function testGetImage() {
    console.log('🖼️ Testing image retrieval...');

    try {
        // Test retrieving the image from update #2 (which has an image)
        const imageResponse = await makeRequest('GET', `/api/chat/message/${testData.booking.id}/2/image`, null, testData.tokens.petOwner);

        if (imageResponse.status !== 200) {
            throw new Error(`Image retrieval failed: ${JSON.stringify(imageResponse.data)}`);
        }

        console.log('✅ Image retrieved successfully');
        console.log(`   Content type: ${imageResponse.data.content_type}`);
        console.log(`   Image size: ${imageResponse.data.image ? imageResponse.data.image.length : 0} characters`);

        // Test retrieving non-existent image
        const noImageResponse = await makeRequest('GET', `/api/chat/message/${testData.booking.id}/1/image`, null, testData.tokens.petOwner);

        if (noImageResponse.status !== 404) {
            throw new Error(`Non-existent image should return 404, but got: ${noImageResponse.status}`);
        }

        console.log('✅ Non-existent image correctly returns 404');

    } catch (error) {
        console.error('❌ Error in image retrieval test:', error.message);
        throw error;
    }
}

/**
 * Test mark as read functionality
 */
async function testMarkAsRead() {
    console.log('✅ Testing mark as read...');

    try {
        const markReadResponse = await makeRequest('PUT', `/api/chat/booking/${testData.booking.id}/mark-read`, {}, testData.tokens.petOwner);

        if (markReadResponse.status !== 200) {
            throw new Error(`Mark as read failed: ${JSON.stringify(markReadResponse.data)}`);
        }

        console.log('✅ Mark as read functionality works');

    } catch (error) {
        console.error('❌ Error in mark as read test:', error.message);
        throw error;
    }
}

/**
 * Test edge cases and error scenarios
 */
async function testEdgeCases() {
    console.log('⚠️ Testing edge cases...');

    try {
        // Test 1: Invalid booking ID
        const invalidBooking = await makeRequest('GET', '/api/chat/booking/999999', null, testData.tokens.petOwner);
        if (invalidBooking.status !== 404) {
            throw new Error(`Invalid booking should return 404, got: ${invalidBooking.status}`);
        }
        console.log('✅ Invalid booking ID correctly handled');

        // Test 2: No authentication token
        const noAuth = await makeRequest('GET', `/api/chat/booking/${testData.booking.id}`);
        if (noAuth.status !== 401) {
            throw new Error(`No auth should return 401, got: ${noAuth.status}`);
        }
        console.log('✅ Missing authentication correctly handled');

        // Test 3: Message too long
        const longText = 'A'.repeat(2001); // Exceeds 2000 character limit
        const longMessage = await makeRequest('POST', `/api/chat/booking/${testData.booking.id}/message`, {
            text: longText
        }, testData.tokens.serviceProvider);
        
        if (longMessage.status !== 400) {
            throw new Error(`Long message should return 400, got: ${longMessage.status}`);
        }
        console.log('✅ Message length validation works');

        // Test 4: Invalid base64 image
        const invalidImage = await makeRequest('POST', `/api/chat/booking/${testData.booking.id}/message`, {
            text: 'Test message',
            image: 'invalid-base64-string!'
        }, testData.tokens.serviceProvider);
        
        if (invalidImage.status !== 400) {
            throw new Error(`Invalid image should return 400, got: ${invalidImage.status}`);
        }
        console.log('✅ Image validation works');

    } catch (error) {
        console.error('❌ Error in edge cases test:', error.message);
        throw error;
    }
}

/**
 * Clean up test data
 */
function cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    try {
        // Delete in reverse order of foreign key dependencies
        const deleteServiceUpdatesStmt = db.prepare('DELETE FROM service_update WHERE bookid = ?');
        deleteServiceUpdatesStmt.run(testData.booking.id);
        
        const deleteBookingStmt = db.prepare('DELETE FROM booking WHERE bookid = ?');
        deleteBookingStmt.run(testData.booking.id);
        
        const deleteTimeslotStmt = db.prepare('DELETE FROM timeslot WHERE serviceid = ?');
        deleteTimeslotStmt.run(testData.service.id);
        
        const deleteServiceStmt = db.prepare('DELETE FROM service WHERE serviceid = ?');
        deleteServiceStmt.run(testData.service.id);
        
        const deleteServiceTypeStmt = db.prepare('DELETE FROM servicetype WHERE type = ?');
        deleteServiceTypeStmt.run('Pet Grooming');
        
        const deletePetOwnerStmt = db.prepare('DELETE FROM petowner WHERE id = ?');
        deletePetOwnerStmt.run(testData.petOwner.id);
        
        const deleteServiceProviderStmt = db.prepare('DELETE FROM serviceprovider WHERE id = ?');
        deleteServiceProviderStmt.run(testData.serviceProvider.id);
        
        const deleteManagerStmt = db.prepare('DELETE FROM manager WHERE id = ?');
        deleteManagerStmt.run(testData.manager.id);
        
        const deleteUsersStmt = db.prepare('DELETE FROM users WHERE userid IN (?, ?, ?)');
        deleteUsersStmt.run(testData.petOwner.id, testData.serviceProvider.id, testData.manager.id);
        
        console.log('✅ Test data cleaned up');
    } catch (error) {
        console.error('❌ Error cleaning up test data:', error.message);
    }
}

/**
 * Main test runner
 */
async function runChatTests() {
    console.log('🚀 Starting Chat System Tests');
    console.log('=' .repeat(50));

    try {
        // Setup
        setupTestData();
        await loginUsers();

        // Run tests
        await testSendChatMessage();
        await testGetChatMessages();
        await testGetConversations();
        await testGetImage();
        await testMarkAsRead();
        await testEdgeCases();

        console.log('=' .repeat(50));
        console.log('🎉 All chat tests passed successfully!');
        
    } catch (error) {
        console.error('=' .repeat(50));
        console.error('❌ Chat tests failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        cleanupTestData();
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    cleanupTestData();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    cleanupTestData();
    process.exit(1);
});

// Run the tests
runChatTests();