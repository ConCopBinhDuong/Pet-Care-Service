/**
 * Timeslot Conflict Testing Script
 * Tests the new timeslot conflict detection and handling functionality
 */

import Database from './src/Database_sqlite.js';

const db = Database;

async function testTimeslotConflicts() {
    console.log('='.repeat(60));
    console.log('TIMESLOT CONFLICT TESTING');
    console.log('='.repeat(60));

    try {
        // 1. Check existing services and their timeslots
        console.log('\n1. Checking existing services...');
        const services = db.prepare(`
            SELECT s.serviceid, s.name, s.status, 
                   GROUP_CONCAT(t.slot) as timeslots
            FROM service s
            LEFT JOIN timeslot t ON s.serviceid = t.serviceid
            WHERE s.status = 'approved'
            GROUP BY s.serviceid, s.name, s.status
            LIMIT 3
        `).all();

        services.forEach(service => {
            console.log(`   Service ${service.serviceid}: ${service.name}`);
            console.log(`   Status: ${service.status}`);
            console.log(`   Timeslots: ${service.timeslots || 'None'}`);
            console.log('   ---');
        });

        if (services.length === 0) {
            console.log('   No approved services found. Run initTestData first.');
            return;
        }

        const testServiceId = services[0].serviceid;
        console.log(`\n2. Using service ${testServiceId} for conflict testing...`);

        // 2. Check existing bookings for this service
        console.log('\n3. Checking existing bookings...');
        const bookings = db.prepare(`
            SELECT b.bookid, b.slot, b.servedate, b.status,
                   u.name as petowner_name
            FROM booking b
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE b.svid = ? AND b.status NOT IN ('cancelled', 'completed')
            ORDER BY b.servedate, b.slot
        `).all(testServiceId);

        if (bookings.length > 0) {
            console.log('   Active bookings found:');
            bookings.forEach(booking => {
                console.log(`   - Booking ${booking.bookid}: ${booking.slot} on ${booking.servedate} (${booking.status}) by ${booking.petowner_name}`);
            });
        } else {
            console.log('   No active bookings found.');
        }

        // 3. Test conflict detection function
        console.log('\n4. Testing conflict detection logic...');
        
        const existingSlots = db.prepare(`
            SELECT slot FROM timeslot WHERE serviceid = ?
        `).all(testServiceId).map(ts => ts.slot);
        
        console.log(`   Current timeslots: [${existingSlots.join(', ')}]`);

        // Simulate trying to remove a slot that has bookings
        const proposedSlots = existingSlots.slice(1); // Remove first slot
        const slotsToRemove = existingSlots.filter(slot => !proposedSlots.includes(slot));
        
        console.log(`   Proposed timeslots: [${proposedSlots.join(', ')}]`);
        console.log(`   Slots to remove: [${slotsToRemove.join(', ')}]`);

        if (slotsToRemove.length > 0) {
            const checkBookingsStmt = db.prepare(`
                SELECT b.bookid, b.slot, b.servedate, b.status,
                       u.name as petowner_name, u.email as petowner_email
                FROM booking b
                JOIN petowner po ON b.poid = po.id
                JOIN users u ON po.id = u.userid
                WHERE b.svid = ? AND b.slot = ? AND b.status NOT IN ('cancelled', 'completed')
            `);
            
            const conflicts = [];
            slotsToRemove.forEach(slot => {
                const conflictingBookings = checkBookingsStmt.all(testServiceId, slot);
                if (conflictingBookings.length > 0) {
                    conflicts.push({
                        slot: slot,
                        bookings: conflictingBookings
                    });
                }
            });

            if (conflicts.length > 0) {
                console.log('\n   ⚠️  CONFLICTS DETECTED:');
                conflicts.forEach(conflict => {
                    console.log(`   Slot ${conflict.slot}:`);
                    conflict.bookings.forEach(booking => {
                        console.log(`     - Booking ${booking.bookid} on ${booking.servedate} (${booking.status}) by ${booking.petowner_name}`);
                    });
                });
            } else {
                console.log('\n   ✅ No conflicts detected - safe to proceed');
            }
        }

        // 4. Test the conflict resolution suggestions
        console.log('\n5. Conflict resolution suggestions:');
        console.log('   - Keep existing timeslots that have bookings');
        console.log('   - Contact customers to reschedule their bookings');
        console.log('   - Wait until bookings are completed or cancelled');
        console.log('   - Add new timeslots without removing existing ones');

        // 5. Show statistics
        console.log('\n6. Database statistics:');
        const stats = {
            totalServices: db.prepare('SELECT COUNT(*) as count FROM service WHERE status = "approved"').get().count,
            totalTimeslots: db.prepare('SELECT COUNT(*) as count FROM timeslot').get().count,
            activeBookings: db.prepare('SELECT COUNT(*) as count FROM booking WHERE status NOT IN ("cancelled", "completed")').get().count,
            futureBookings: db.prepare('SELECT COUNT(*) as count FROM booking WHERE servedate >= date("now") AND status NOT IN ("cancelled", "completed")').get().count
        };

        console.log(`   Approved services: ${stats.totalServices}`);
        console.log(`   Total timeslots: ${stats.totalTimeslots}`);
        console.log(`   Active bookings: ${stats.activeBookings}`);
        console.log(`   Future bookings: ${stats.futureBookings}`);

        console.log('\n='.repeat(60));
        console.log('✅ TIMESLOT CONFLICT TESTING COMPLETED');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error during conflict testing:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testTimeslotConflicts();
