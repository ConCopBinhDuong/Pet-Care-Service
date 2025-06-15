#!/usr/bin/env node

import db from './src/Database_sqlite.js';
import notificationService from './src/services/notificationService.js';

console.log('🧪 Testing Notification System...\n');

// Test notification creation
console.log('1. Testing basic notification creation...');
try {
    const result = notificationService.createNotification(
        1, // userid
        'Test notification for user 1',
        'general'
    );
    console.log('✅ Basic notification created:', result);
} catch (error) {
    console.error('❌ Failed to create basic notification:', error.message);
}

// Test service approval notification
console.log('\n2. Testing service approval notification...');
try {
    const result = notificationService.notifyServiceApproved(
        1, // serviceId
        2, // providerId
        'Test Service',
        'Manager Smith'
    );
    console.log('✅ Service approval notification created:', result);
} catch (error) {
    console.error('❌ Failed to create service approval notification:', error.message);
}

// Test booking notification
console.log('\n3. Testing booking notification...');
try {
    const result = notificationService.notifyNewBooking(
        1, // bookingId
        2, // providerId
        'Pet Grooming',
        'John Doe',
        '2025-06-15',
        '09:00'
    );
    console.log('✅ Booking notification created:', result);
} catch (error) {
    console.error('❌ Failed to create booking notification:', error.message);
}

// Test notification retrieval
console.log('\n4. Testing notification retrieval...');
try {
    const result = notificationService.getUserNotifications(1, { limit: 5 });
    console.log('✅ Retrieved notifications for user 1:', result.success ? `Found ${result.notifications.length} notifications` : result.error);
} catch (error) {
    console.error('❌ Failed to retrieve notifications:', error.message);
}

// Test notification statistics
console.log('\n5. Testing notification statistics...');
try {
    const result = notificationService.getNotificationStats(1);
    console.log('✅ Notification stats for user 1:', result.success ? result.stats : result.error);
} catch (error) {
    console.error('❌ Failed to get notification stats:', error.message);
}

// Test pet schedule checking
console.log('\n6. Testing pet schedule checking...');
try {
    const result = notificationService.checkPetSchedules();
    console.log('✅ Pet schedule check completed:', result.success ? `Created ${result.notificationsCreated.length} notifications` : result.error);
} catch (error) {
    console.error('❌ Failed to check pet schedules:', error.message);
}

// Test booking status checking
console.log('\n7. Testing booking status checking...');
try {
    const result = notificationService.checkBookingStatus();
    console.log('✅ Booking status check completed:', result.success ? result.results : result.error);
} catch (error) {
    console.error('❌ Failed to check booking status:', error.message);
}

// Check notification table structure
console.log('\n8. Checking notification table structure...');
try {
    const notifications = db.prepare('SELECT * FROM notification LIMIT 3').all();
    console.log('✅ Sample notifications from database:');
    notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. [${notif.type}] ${notif.text} (User: ${notif.userid})`);
    });
} catch (error) {
    console.error('❌ Failed to query notifications table:', error.message);
}

// Test cleanup
console.log('\n9. Testing notification cleanup...');
try {
    const result = notificationService.cleanupOldNotifications();
    console.log('✅ Cleanup completed:', result.success ? `Deleted ${result.deletedCount} old notifications` : result.error);
} catch (error) {
    console.error('❌ Failed to cleanup notifications:', error.message);
}

console.log('\n🎉 Notification system test completed!');
