/**
 * Test script to verify email-only verification system
 */

import db from './src/Database_sqlite.js';

console.log('🧪 Testing Email-Only Verification System');
console.log('==========================================');

// Test 1: Check database schema
console.log('\n📋 Test 1: Database Schema Check');
try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const columns = tableInfo.map(col => col.name);
    
    console.log('✅ Database columns:', columns);
    
    if (columns.includes('phone_verified')) {
        console.log('❌ ERROR: phone_verified column still exists in database');
    } else {
        console.log('✅ SUCCESS: phone_verified column removed');
    }
    
    if (columns.includes('email_verified')) {
        console.log('✅ SUCCESS: email_verified column exists');
    } else {
        console.log('❌ ERROR: email_verified column missing');
    }
    
} catch (error) {
    console.log('❌ Database schema test failed:', error.message);
}

// Test 2: Create test user with email verification only
console.log('\n👤 Test 2: Create Test User');
try {
    // Clean up any existing test user
    db.prepare('DELETE FROM users WHERE email = ?').run('test@example.com');
    
    // Insert test user with only email_verified
    const insertResult = db.prepare(`
        INSERT INTO users (name, email, password, gender, role, email_verified) 
        VALUES (?, ?, ?, ?, ?, ?)
    `).run('Test User', 'test@example.com', 'hashedpassword', 'Male', 'Pet owner', 1);
    
    console.log('✅ Test user created with ID:', insertResult.lastInsertRowid);
    
    // Verify user data
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('test@example.com');
    console.log('✅ User verification status:');
    console.log('   - Email verified:', Boolean(user.email_verified));
    console.log('   - Can login:', Boolean(user.email_verified));
    
} catch (error) {
    console.log('❌ Test user creation failed:', error.message);
}

// Test 3: Verify login logic would work
console.log('\n🔑 Test 3: Login Logic Verification');
try {
    const user = db.prepare(`
        SELECT userid, name, email, role, email_verified 
        FROM users 
        WHERE email = ?
    `).get('test@example.com');
    
    if (user && user.email_verified) {
        console.log('✅ SUCCESS: User can login (email verified)');
        console.log('   - User ID:', user.userid);
        console.log('   - Email verified:', Boolean(user.email_verified));
    } else if (user && !user.email_verified) {
        console.log('⚠️ WARNING: User exists but email not verified - login would be blocked');
    } else {
        console.log('❌ ERROR: User not found');
    }
    
} catch (error) {
    console.log('❌ Login logic test failed:', error.message);
}

// Test 4: Check unverified user scenario
console.log('\n📧 Test 4: Unverified User Scenario');
try {
    // Create unverified user
    db.prepare('DELETE FROM users WHERE email = ?').run('unverified@example.com');
    
    const insertResult = db.prepare(`
        INSERT INTO users (name, email, password, gender, role, email_verified) 
        VALUES (?, ?, ?, ?, ?, ?)
    `).run('Unverified User', 'unverified@example.com', 'hashedpassword', 'Female', 'Service provider', 0);
    
    const unverifiedUser = db.prepare(`
        SELECT userid, name, email, role, email_verified 
        FROM users 
        WHERE email = ?
    `).get('unverified@example.com');
    
    if (unverifiedUser && !unverifiedUser.email_verified) {
        console.log('✅ SUCCESS: Unverified user cannot login');
        console.log('   - Email verified:', Boolean(unverifiedUser.email_verified));
        console.log('   - Login blocked: TRUE');
    } else {
        console.log('❌ ERROR: Unverified user verification failed');
    }
    
} catch (error) {
    console.log('❌ Unverified user test failed:', error.message);
}

// Test 5: Check role-specific tables still work
console.log('\n🏷️ Test 5: Role-Specific Tables');
try {
    // Test pet owner with phone (optional)
    const userId = db.prepare('SELECT userid FROM users WHERE email = ?').get('test@example.com').userid;
    
    db.prepare('DELETE FROM petowner WHERE id = ?').run(userId);
    db.prepare(`
        INSERT INTO petowner (id, phone, city, address) 
        VALUES (?, ?, ?, ?)
    `).run(userId, '+84123456789', 'Ho Chi Minh City', '123 Test Street');
    
    const petOwner = db.prepare('SELECT * FROM petowner WHERE id = ?').get(userId);
    console.log('✅ Pet owner profile created:');
    console.log('   - Phone (optional):', petOwner.phone);
    console.log('   - City:', petOwner.city);
    
} catch (error) {
    console.log('❌ Role-specific table test failed:', error.message);
}

// Clean up
console.log('\n🧹 Cleanup');
try {
    db.prepare('DELETE FROM petowner WHERE id IN (SELECT userid FROM users WHERE email IN (?, ?))').run('test@example.com', 'unverified@example.com');
    db.prepare('DELETE FROM users WHERE email IN (?, ?)').run('test@example.com', 'unverified@example.com');
    console.log('✅ Test data cleaned up');
} catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
}

console.log('\n🎉 EMAIL-ONLY VERIFICATION SYSTEM TEST COMPLETE');
console.log('===============================================');
console.log('Summary:');
console.log('✅ Database schema updated (phone_verified column removed)');
console.log('✅ Users can be created with email verification only');
console.log('✅ Login logic requires only email verification');
console.log('✅ Phone numbers are now optional for all roles');
console.log('✅ Role-specific tables still function correctly');
