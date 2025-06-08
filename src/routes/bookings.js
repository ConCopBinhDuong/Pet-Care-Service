import express from 'express'
import db from '../Database_sqlite.js'
import { validateBookingCreation, validateBookingUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all bookings for the authenticated pet owner
router.get('/', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can view bookings.' 
            });
        }

        const getBookingsStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.svid as serviceid,
                s.name as service_name,
                s.price,
                s.duration,
                st.type as service_type,
                sp.businessname as provider_name,
                b.slot,
                b.book_timestamp,
                b.servedate,
                b.payment_method,
                b.status
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE b.poid = ?
            ORDER BY b.servedate DESC, b.slot ASC
        `);
        
        const bookings = getBookingsStmt.all(userId);

        // Get pets for each booking
        for (let booking of bookings) {
            const getPetsStmt = db.prepare(`
                SELECT 
                    p.petid,
                    p.name as pet_name,
                    p.breed
                FROM booking_pet bp
                JOIN pet p ON bp.petid = p.petid
                WHERE bp.bookid = ?
            `);
            
            booking.pets = getPetsStmt.all(booking.bookid);
        }

        res.status(200).json({
            message: 'Bookings retrieved successfully',
            bookings: bookings
        });
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving bookings' 
        });
    }
});

// Get booking details by ID
router.get('/:bookingId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { bookingId } = req.params;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can view bookings.' 
            });
        }

        const getBookingStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.svid as serviceid,
                s.name as service_name,
                s.price,
                s.duration,
                s.description,
                st.type as service_type,
                sp.businessname as provider_name,
                sp.address as provider_address,
                sp.phone as provider_phone,
                b.slot,
                b.book_timestamp,
                b.servedate,
                b.payment_method,
                b.status
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE b.bookid = ? AND b.poid = ?
        `);
        
        const booking = getBookingStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking not found or access denied' 
            });
        }

        // Get pets for the booking
        const getPetsStmt = db.prepare(`
            SELECT 
                p.petid,
                p.name as pet_name,
                p.breed,
                p.age
            FROM booking_pet bp
            JOIN pet p ON bp.petid = p.petid
            WHERE bp.bookid = ?
        `);
        
        booking.pets = getPetsStmt.all(bookingId);

        res.status(200).json({
            message: 'Booking details retrieved successfully',
            booking: booking
        });
    } catch (error) {
        console.error('Error retrieving booking details:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving booking details' 
        });
    }
});

// Create a new service booking (Reserve service endpoint)
router.post('/', validateBookingCreation, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Only pet owners can make bookings
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can make bookings.' 
            });
        }

        const { serviceid, slot, servedate, payment_method, petIds } = req.body;

        // Verify the service exists
        const getServiceStmt = db.prepare(`
            SELECT serviceid, name, price FROM service WHERE serviceid = ?
        `);
        const service = getServiceStmt.get(serviceid);

        if (!service) {
            return res.status(404).json({ 
                message: 'Service not found' 
            });
        }

        // Verify the time slot exists for this service
        const getTimeSlotStmt = db.prepare(`
            SELECT serviceid, slot FROM timeslot WHERE serviceid = ? AND slot = ?
        `);
        const timeSlot = getTimeSlotStmt.get(serviceid, slot);

        if (!timeSlot) {
            return res.status(400).json({ 
                message: 'Invalid time slot for this service' 
            });
        }

        // Check if the slot is already booked for the same date
        const checkConflictStmt = db.prepare(`
            SELECT bookid FROM booking 
            WHERE svid = ? AND slot = ? AND servedate = ? AND status != 'cancelled'
        `);
        const existingBooking = checkConflictStmt.get(serviceid, slot, servedate);

        if (existingBooking) {
            return res.status(409).json({ 
                message: 'This time slot is already booked for the selected date' 
            });
        }

        // Verify all pets belong to the user
        const verifyPetsStmt = db.prepare(`
            SELECT petid FROM pet WHERE petid = ? AND userid = ?
        `);

        for (let petId of petIds) {
            const pet = verifyPetsStmt.get(petId, userId);
            if (!pet) {
                return res.status(400).json({ 
                    message: `Pet with ID ${petId} not found or doesn't belong to you` 
                });
            }
        }

        // Start transaction
        const transaction = db.transaction(() => {
            // Create the booking
            const createBookingStmt = db.prepare(`
                INSERT INTO booking (poid, svid, slot, servedate, payment_method, status)
                VALUES (?, ?, ?, ?, ?, 'pending')
            `);
            
            const bookingResult = createBookingStmt.run(userId, serviceid, slot, servedate, payment_method);
            const bookingId = bookingResult.lastInsertRowid;

            // Link pets to the booking
            const linkPetStmt = db.prepare(`
                INSERT INTO booking_pet (bookid, petid) VALUES (?, ?)
            `);
            
            for (let petId of petIds) {
                linkPetStmt.run(bookingId, petId);
            }

            return bookingId;
        });

        const bookingId = transaction();

        res.status(201).json({
            message: 'Service booking created successfully',
            booking: {
                bookingId: bookingId,
                serviceid: serviceid,
                service_name: service.name,
                price: service.price,
                slot: slot,
                servedate: servedate,
                payment_method: payment_method,
                status: 'pending',
                petIds: petIds
            }
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            message: 'Internal server error while creating booking' 
        });
    }
});

// Update booking status or details
router.put('/:bookingId', validateBookingUpdate, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { bookingId } = req.params;
        const { servedate, payment_method, status } = req.body;

        // Only pet owners can update their bookings
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update bookings.' 
            });
        }

        // Verify booking exists and belongs to user
        const getBookingStmt = db.prepare(`
            SELECT bookid, poid, status FROM booking WHERE bookid = ? AND poid = ?
        `);
        const booking = getBookingStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking not found or access denied' 
            });
        }

        // Prevent updating cancelled or completed bookings
        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return res.status(400).json({ 
                message: `Cannot update ${booking.status} booking` 
            });
        }

        // Build update query dynamically
        const updates = [];
        const params = [];

        if (servedate !== undefined) {
            updates.push('servedate = ?');
            params.push(servedate);
        }
        if (payment_method !== undefined) {
            updates.push('payment_method = ?');
            params.push(payment_method);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                message: 'No valid fields to update' 
            });
        }

        params.push(bookingId);

        const updateBookingStmt = db.prepare(`
            UPDATE booking 
            SET ${updates.join(', ')} 
            WHERE bookid = ?
        `);
        
        updateBookingStmt.run(...params);

        res.status(200).json({
            message: 'Booking updated successfully'
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ 
            message: 'Internal server error while updating booking' 
        });
    }
});

// Cancel a booking
router.delete('/:bookingId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { bookingId } = req.params;

        // Only pet owners can cancel their bookings
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can cancel bookings.' 
            });
        }

        // Verify booking exists and belongs to user
        const getBookingStmt = db.prepare(`
            SELECT bookid, poid, status FROM booking WHERE bookid = ? AND poid = ?
        `);
        const booking = getBookingStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking not found or access denied' 
            });
        }

        // Prevent cancelling already cancelled or completed bookings
        if (booking.status === 'cancelled') {
            return res.status(400).json({ 
                message: 'Booking is already cancelled' 
            });
        }
        if (booking.status === 'completed') {
            return res.status(400).json({ 
                message: 'Cannot cancel completed booking' 
            });
        }

        // Update booking status to cancelled
        const cancelBookingStmt = db.prepare(`
            UPDATE booking SET status = 'cancelled' WHERE bookid = ?
        `);
        
        cancelBookingStmt.run(bookingId);

        res.status(200).json({
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ 
            message: 'Internal server error while cancelling booking' 
        });
    }
});


export default router;
