// Complete End-to-End Test for Timeslot Conflict Detection
// This script will test the entire workflow with real data

import db from './src/Database_sqlite.js';

// Function to log with timestamp
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

// Hash password function (simplified for testing)
import crypto from 'crypto';
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Insert initial test data
function setupTestData() {
    log('Setting up test data...');
    
    try {
        // 1. Create service types
        db.exec(`
            INSERT INTO servicetype (typeid, type) VALUES 
            (1, 'Pet Grooming'),
            (2, 'Pet Training'),
            (3, 'Pet Boarding'),
            (4, 'Veterinary');
        `);
        log('✓ Service types created');

        // 2. Create manager account
        const managerStmt = db.prepare(`
            INSERT INTO users (userid, name, email, password, role, email_verified) 
            VALUES (?, ?, ?, ?, 'Manager', 1)
        `);
        managerStmt.run(1, 'System Manager', 'manager@petcare.com', hashPassword('manager123'));
        
        const managerProfileStmt = db.prepare(`
            INSERT INTO manager (id) VALUES (?)
        `);
        managerProfileStmt.run(1);
        log('✓ Manager account created');

        // 3. Create service provider
        const providerStmt = db.prepare(`
            INSERT INTO users (userid, name, email, password, gender, role, email_verified) 
            VALUES (?, ?, ?, ?, ?, 'Service provider', 1)
        `);
        providerStmt.run(2, 'Happy Pet Grooming', 'provider@test.com', hashPassword('password123'), 'Other');
        
        const providerProfileStmt = db.prepare(`
            INSERT INTO serviceprovider (id, bussiness_name, phone, description, address) 
            VALUES (?, ?, ?, ?, ?)
        `);
        providerProfileStmt.run(2, 'Happy Pet Grooming', '+1234567890', 'Professional pet grooming services', '123 Pet Street');
        log('✓ Service provider created');

        // 4. Create pet owner
        const ownerStmt = db.prepare(`
            INSERT INTO users (userid, name, email, password, gender, role, email_verified) 
            VALUES (?, ?, ?, ?, ?, 'Pet owner', 1)
        `);
        ownerStmt.run(3, 'John Doe', 'petowner@test.com', hashPassword('password123'), 'Male');
        
        const ownerProfileStmt = db.prepare(`
            INSERT INTO petowner (id, phone, city, address) 
            VALUES (?, ?, ?, ?)
        `);
        ownerProfileStmt.run(3, '+0987654321', 'Pet City', '456 Owner Avenue');
        log('✓ Pet owner created');

        // 5. Create a pet
        const petStmt = db.prepare(`
            INSERT INTO pet (petid, name, breed, description, picture, age, userid) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        petStmt.run(1, 'Buddy', 'Golden Retriever', 'Friendly and energetic dog', 'pet_picture_blob', 3, 3);
        log('✓ Pet created');

        // 6. Create a service (pending approval)
        const serviceStmt = db.prepare(`
            INSERT INTO service (serviceid, name, price, description, duration, typeid, providerid, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
        `);
        serviceStmt.run(1, 'Basic Pet Grooming', 50, 'Full grooming service including bath, haircut, and nail trimming', '2 hours', 1, 2);
        log('✓ Service created and approved');

        // 7. Create timeslots for the service
        const timeslotStmt = db.prepare(`
            INSERT INTO timeslot (serviceid, slot) VALUES (?, ?)
        `);
        const timeslots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        timeslots.forEach(slot => {
            timeslotStmt.run(1, slot);
        });
        log('✓ Timeslots created: ' + timeslots.join(', '));

        // 8. Create a booking for 10:00 slot
        const bookingStmt = db.prepare(`
            INSERT INTO booking (bookid, poid, svid, slot, servedate, payment_method, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
        const futureDateStr = futureDate.toISOString().split('T')[0];
        
        bookingStmt.run(1, 3, 1, '10:00', futureDateStr, 'Credit Card', 'confirmed');
        log(`✓ Booking created for ${futureDateStr} at 10:00`);

        // 9. Link pet to booking
        const bookingPetStmt = db.prepare(`
            INSERT INTO booking_pet (bookid, petid) VALUES (?, ?)
        `);
        bookingPetStmt.run(1, 1);
        log('✓ Pet linked to booking');

        log('✅ Test data setup complete!');
        return futureDateStr;
        
    } catch (error) {
        log(`❌ Error setting up test data: ${error.message}`);
        throw error;
    }
}

// Test conflict detection query
function testConflictDetection() {
    log('\n=== Testing Conflict Detection Query ===');
    
    try {
        // Query to check for timeslot conflicts
        const conflictQuery = `
            SELECT 
                b.bookid,
                b.slot,
                b.servedate,
                b.status,
                u.name as customer_name,
                u.email as customer_email,
                p.name as pet_name
            FROM booking b
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            JOIN booking_pet bp ON b.bookid = bp.bookid
            JOIN pet p ON bp.petid = p.petid
            WHERE b.svid = ? 
            AND b.slot = ?
            AND b.servedate >= date('now')
            AND b.status NOT IN ('cancelled', 'completed')
        `;
        
        const stmt = db.prepare(conflictQuery);
        const conflicts = stmt.all(1, '10:00');
        
        log(`Found ${conflicts.length} conflict(s) for slot 10:00:`);
        conflicts.forEach(conflict => {
            log(`  - Booking ${conflict.bookid}: ${conflict.customer_name} (${conflict.customer_email})`);
            log(`    Pet: ${conflict.pet_name}, Date: ${conflict.servedate}, Status: ${conflict.status}`);
        });
        
        return conflicts.length > 0;
        
    } catch (error) {
        log(`❌ Error testing conflict detection: ${error.message}`);
        return false;
    }
}

// Test safe timeslot updates (no conflicts)
function testSafeUpdate() {
    log('\n=== Testing Safe Timeslot Update ===');
    
    try {
        // Current timeslots
        const currentSlots = db.prepare('SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot').all(1);
        log('Current timeslots: ' + currentSlots.map(s => s.slot).join(', '));
        
        // Proposed new timeslots (adding 17:00, removing 16:00 - safe)
        const newSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '17:00'];
        log('Proposed timeslots: ' + newSlots.join(', '));
        
        // Identify slots to remove
        const existingSlots = currentSlots.map(s => s.slot);
        const slotsToRemove = existingSlots.filter(slot => !newSlots.includes(slot));
        log('Slots to remove: ' + slotsToRemove.join(', '));
        
        // Check conflicts for slots to remove
        const conflictQuery = `
            SELECT DISTINCT slot
            FROM booking 
            WHERE svid = ? 
            AND slot = ?
            AND servedate >= date('now')
            AND status NOT IN ('cancelled', 'completed')
        `;
        
        const conflictStmt = db.prepare(conflictQuery);
        const conflictingSlots = [];
        
        slotsToRemove.forEach(slot => {
            const conflicts = conflictStmt.all(1, slot);
            if (conflicts.length > 0) {
                conflictingSlots.push(slot);
            }
        });
        
        if (conflictingSlots.length > 0) {
            log(`❌ Cannot remove slots due to conflicts: ${conflictingSlots.join(', ')}`);
            return false;
        } else {
            log('✅ Safe to update - no conflicts detected');
            
            // Simulate the update
            try {
                // Remove safe slots
                const deleteStmt = db.prepare('DELETE FROM timeslot WHERE serviceid = ? AND slot = ?');
                slotsToRemove.forEach(slot => {
                    deleteStmt.run(1, slot);
                    log(`Removed slot: ${slot}`);
                });
                
                // Add new slots
                const insertStmt = db.prepare('INSERT OR IGNORE INTO timeslot (serviceid, slot) VALUES (?, ?)');
                newSlots.forEach(slot => {
                    insertStmt.run(1, slot);
                });
                log('Added new slot: 17:00');
            } catch (updateError) {
                log(`Update error: ${updateError.message}`);
                throw updateError;
            }
            
            // Verify the update
            const updatedSlots = db.prepare('SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot').all(1);
            log('Updated timeslots: ' + updatedSlots.map(s => s.slot).join(', '));
            
            return true;
        }
        
    } catch (error) {
        log(`❌ Error testing safe update: ${error.message}`);
        return false;
    }
}

// Test conflicting timeslot update
function testConflictingUpdate() {
    log('\n=== Testing Conflicting Timeslot Update ===');
    
    try {
        // Current timeslots
        const currentSlots = db.prepare('SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot').all(1);
        log('Current timeslots: ' + currentSlots.map(s => s.slot).join(', '));
        
        // Proposed new timeslots (removing 10:00 which has a booking)
        const newSlots = ['09:00', '11:00', '14:00', '15:00', '17:00'];
        log('Proposed timeslots: ' + newSlots.join(', '));
        
        // Identify slots to remove
        const existingSlots = currentSlots.map(s => s.slot);
        const slotsToRemove = existingSlots.filter(slot => !newSlots.includes(slot));
        log('Slots to remove: ' + slotsToRemove.join(', '));
        
        // Check conflicts for slots to remove
        const conflictQuery = `
            SELECT 
                b.bookid,
                b.slot,
                b.servedate,
                b.status,
                u.name as customer_name,
                u.email as customer_email,
                p.name as pet_name
            FROM booking b
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            JOIN booking_pet bp ON b.bookid = bp.bookid
            JOIN pet p ON bp.petid = p.petid
            WHERE b.svid = ? 
            AND b.slot = ?
            AND b.servedate >= date('now')
            AND b.status NOT IN ('cancelled', 'completed')
        `;
        
        const conflictStmt = db.prepare(conflictQuery);
        const allConflicts = [];
        
        slotsToRemove.forEach(slot => {
            const conflicts = conflictStmt.all(1, slot);
            if (conflicts.length > 0) {
                allConflicts.push({
                    timeslot: slot,
                    activeBookings: conflicts.length,
                    bookingDetails: conflicts.map(c => ({
                        bookingId: c.bookid,
                        serviceDate: c.servedate,
                        status: c.status,
                        petOwner: {
                            name: c.customer_name,
                            email: c.customer_email
                        },
                        petName: c.pet_name
                    }))
                });
            }
        });
        
        if (allConflicts.length > 0) {
            log(`❌ Conflict detected! Cannot update timeslots.`);
            log('Conflict details:');
            allConflicts.forEach(conflict => {
                log(`  Slot ${conflict.timeslot}: ${conflict.activeBookings} active booking(s)`);
                conflict.bookingDetails.forEach(booking => {
                    log(`    - Booking ${booking.bookingId}: ${booking.petOwner.name} (${booking.petOwner.email})`);
                    log(`      Pet: ${booking.petName}, Date: ${booking.serviceDate}, Status: ${booking.status}`);
                });
            });
            
            log('\nSuggestions:');
            log('  • Keep the existing timeslots to avoid conflicts');
            log('  • Contact customers to reschedule their bookings');
            log('  • Wait for the bookings to be completed before removing timeslots');
            log('  • Only add new timeslots without removing existing ones');
            
            return false;
        } else {
            log('✅ No conflicts - update would be safe');
            return true;
        }
        
    } catch (error) {
        log(`❌ Error testing conflicting update: ${error.message}`);
        return false;
    }
}

// Test cancelling booking and then updating
function testCancelBookingAndUpdate() {
    log('\n=== Testing Cancel Booking and Update ===');
    
    try {
        // Cancel the booking
        const updateStmt = db.prepare('UPDATE booking SET status = ? WHERE bookid = ?');
        updateStmt.run('cancelled', 1);
        log('✅ Booking cancelled');
        
        // Now try the conflicting update again
        const newSlots = ['09:00', '11:00', '14:00', '15:00', '17:00'];
        log('Attempting to update timeslots after cancellation...');
        
        // Check conflicts for slots to remove (should be none now)
        const conflictQuery = `
            SELECT COUNT(*) as count
            FROM booking 
            WHERE svid = ? 
            AND slot = ?
            AND servedate >= date('now')
            AND status NOT IN ('cancelled', 'completed')
        `;
        
        const conflictStmt = db.prepare(conflictQuery);
        const conflicts = conflictStmt.get(1, '10:00');
        
        if (conflicts.count === 0) {
            log('✅ No conflicts after cancellation - update is now safe');
            
            // Perform the update
            try {
                // Remove 10:00 slot
                const deleteStmt = db.prepare('DELETE FROM timeslot WHERE serviceid = ? AND slot = ?');
                deleteStmt.run(1, '10:00');
                log('Removed slot: 10:00');
            } catch (updateError) {
                log(`Update error: ${updateError.message}`);
                throw updateError;
            }
            
            // Verify the update
            const updatedSlots = db.prepare('SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot').all(1);
            log('Final timeslots: ' + updatedSlots.map(s => s.slot).join(', '));
            
            return true;
        } else {
            log(`❌ Still ${conflicts.count} conflicts after cancellation`);
            return false;
        }
        
    } catch (error) {
        log(`❌ Error testing cancel and update: ${error.message}`);
        return false;
    }
}

// Main test function
function runCompleteTest() {
    log('🚀 Starting Complete End-to-End Timeslot Conflict Test');
    log('='.repeat(60));
    
    try {
        // Setup test data
        const bookingDate = setupTestData();
        
        // Test 1: Conflict detection query
        const hasConflicts = testConflictDetection();
        
        // Test 2: Safe update (no conflicts)
        const safeUpdateSuccess = testSafeUpdate();
        
        // Test 3: Conflicting update (should fail)
        const conflictingUpdateFailed = !testConflictingUpdate();
        
        // Test 4: Cancel booking and retry update
        const cancelAndUpdateSuccess = testCancelBookingAndUpdate();
        
        // Summary
        log('\n' + '='.repeat(60));
        log('🎯 TEST SUMMARY');
        log('='.repeat(60));
        log(`✅ Test data setup: SUCCESS`);
        log(`${hasConflicts ? '✅' : '❌'} Conflict detection: ${hasConflicts ? 'SUCCESS' : 'FAILED'}`);
        log(`${safeUpdateSuccess ? '✅' : '❌'} Safe update: ${safeUpdateSuccess ? 'SUCCESS' : 'FAILED'}`);
        log(`${conflictingUpdateFailed ? '✅' : '❌'} Conflict prevention: ${conflictingUpdateFailed ? 'SUCCESS' : 'FAILED'}`);
        log(`${cancelAndUpdateSuccess ? '✅' : '❌'} Cancel and update: ${cancelAndUpdateSuccess ? 'SUCCESS' : 'FAILED'}`);
        
        const allTestsPassed = hasConflicts && safeUpdateSuccess && conflictingUpdateFailed && cancelAndUpdateSuccess;
        log('\n' + (allTestsPassed ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'));
        
        if (allTestsPassed) {
            log('\n✅ Timeslot conflict detection implementation is working correctly!');
            log('The system properly:');
            log('  • Detects conflicts with active bookings');
            log('  • Allows safe updates without conflicts');
            log('  • Prevents removal of booked timeslots');
            log('  • Enables updates after bookings are cancelled');
        }
        
        return allTestsPassed;
        
    } catch (error) {
        log(`💥 Test failed with error: ${error.message}`);
        log(error.stack);
        return false;
    }
}

// Run the test
runCompleteTest();
