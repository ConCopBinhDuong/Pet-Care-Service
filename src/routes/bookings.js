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

// =============================================================================
// SERVICE PROVIDER ENDPOINTS - Booking Request Management
// =============================================================================

/**
 * Get all booking requests for the authenticated service provider
 * GET /bookings/provider/requests
 * Role: Service Provider only
 */
router.get('/provider/requests', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Only service providers can access this endpoint
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can view booking requests.' 
            });
        }

        const { status, startDate, endDate, serviceId } = req.query;

        let query = `
            SELECT 
                b.bookid,
                b.svid as serviceid,
                s.name as service_name,
                s.price,
                s.duration,
                st.type as service_type,
                b.slot,
                b.book_timestamp,
                b.servedate,
                b.payment_method,
                b.status,
                u.name as customer_name,
                u.email as customer_email,
                po.phone as customer_phone,
                po.address as customer_address,
                po.city as customer_city
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ?
        `;

        const params = [userId];

        // Add filters
        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (startDate) {
            query += ' AND b.servedate >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND b.servedate <= ?';
            params.push(endDate);
        }

        if (serviceId) {
            query += ' AND b.svid = ?';
            params.push(parseInt(serviceId));
        }

        query += ' ORDER BY b.book_timestamp DESC, b.servedate ASC, b.slot ASC';

        const getBookingsStmt = db.prepare(query);
        const bookings = getBookingsStmt.all(...params);

        // Get pets for each booking
        for (let booking of bookings) {
            const getPetsStmt = db.prepare(`
                SELECT 
                    p.petid,
                    p.name as pet_name,
                    p.breed,
                    p.age,
                    p.description
                FROM booking_pet bp
                JOIN pet p ON bp.petid = p.petid
                WHERE bp.bookid = ?
            `);
            
            booking.pets = getPetsStmt.all(booking.bookid);

            // Calculate hours since booking was made
            const bookingTime = new Date(booking.book_timestamp);
            const now = new Date();
            booking.hoursSinceBooking = Math.floor((now - bookingTime) / (1000 * 60 * 60));
            booking.shouldAutoReject = booking.status === 'pending' && booking.hoursSinceBooking >= 24;
        }

        // Calculate summary statistics
        const stats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            rejected: bookings.filter(b => b.status === 'rejected').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            overdue: bookings.filter(b => b.shouldAutoReject).length
        };

        res.status(200).json({
            message: 'Booking requests retrieved successfully',
            bookings: bookings,
            statistics: stats
        });

    } catch (error) {
        console.error('Error retrieving booking requests:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving booking requests' 
        });
    }
});

/**
 * Get detailed booking request by ID for service provider
 * GET /bookings/provider/requests/:bookingId
 * Role: Service Provider only
 */
router.get('/provider/requests/:bookingId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { bookingId } = req.params;

        // Only service providers can access this endpoint
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can view booking requests.' 
            });
        }

        const getBookingStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.svid as serviceid,
                s.name as service_name,
                s.price,
                s.duration,
                s.description as service_description,
                st.type as service_type,
                b.slot,
                b.book_timestamp,
                b.servedate,
                b.payment_method,
                b.status,
                u.name as customer_name,
                u.email as customer_email,
                po.phone as customer_phone,
                po.address as customer_address,
                po.city as customer_city
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE b.bookid = ? AND s.providerid = ?
        `);
        
        const booking = getBookingStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking request not found or access denied' 
            });
        }

        // Get pets for the booking
        const getPetsStmt = db.prepare(`
            SELECT 
                p.petid,
                p.name as pet_name,
                p.breed,
                p.age,
                p.description,
                p.dob
            FROM booking_pet bp
            JOIN pet p ON bp.petid = p.petid
            WHERE bp.bookid = ?
        `);
        
        booking.pets = getPetsStmt.all(bookingId);

        // Calculate timing information
        const bookingTime = new Date(booking.book_timestamp);
        const now = new Date();
        booking.hoursSinceBooking = Math.floor((now - bookingTime) / (1000 * 60 * 60));
        booking.shouldAutoReject = booking.status === 'pending' && booking.hoursSinceBooking >= 24;

        // Check for conflicts with other bookings
        const checkConflictsStmt = db.prepare(`
            SELECT 
                b2.bookid,
                b2.svid as other_serviceid,
                s2.name as other_service_name,
                b2.status as other_status
            FROM booking b2
            JOIN service s2 ON b2.svid = s2.serviceid
            WHERE s2.providerid = ? 
            AND b2.servedate = ? 
            AND b2.slot = ? 
            AND b2.bookid != ?
            AND b2.status NOT IN ('cancelled', 'rejected')
        `);

        const conflicts = checkConflictsStmt.all(userId, booking.servedate, booking.slot, bookingId);
        booking.hasConflicts = conflicts.length > 0;
        booking.conflicts = conflicts;

        res.status(200).json({
            message: 'Booking request details retrieved successfully',
            booking: booking
        });

    } catch (error) {
        console.error('Error retrieving booking request details:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving booking request details' 
        });
    }
});

/**
 * Accept a booking request
 * POST /bookings/provider/requests/:bookingId/accept
 * Role: Service Provider only
 */
router.post('/provider/requests/:bookingId/accept', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { bookingId } = req.params;

        // Only service providers can accept booking requests
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can accept booking requests.' 
            });
        }

        // Verify booking exists and belongs to provider
        const getBookingStmt = db.prepare(`
            SELECT 
                b.bookid, b.svid, b.slot, b.servedate, b.status, b.book_timestamp,
                s.name as service_name, s.providerid,
                u.name as customer_name, u.email as customer_email
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE b.bookid = ? AND s.providerid = ?
        `);
        
        const booking = getBookingStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking request not found or access denied' 
            });
        }

        // Check if booking is still pending
        if (booking.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot accept booking with status: ${booking.status}` 
            });
        }

        // Check if booking is expired (more than 24 hours old)
        const bookingTime = new Date(booking.book_timestamp);
        const now = new Date();
        const hoursSinceBooking = Math.floor((now - bookingTime) / (1000 * 60 * 60));

        if (hoursSinceBooking >= 24) {
            // Auto-reject expired booking
            const rejectBookingStmt = db.prepare(`
                UPDATE booking SET status = 'rejected' WHERE bookid = ?
            `);
            rejectBookingStmt.run(bookingId);

            return res.status(400).json({ 
                message: 'Cannot accept expired booking request (more than 24 hours old). Booking has been automatically rejected.' 
            });
        }

        // Check for conflicts with other confirmed bookings
        const checkConflictsStmt = db.prepare(`
            SELECT 
                b2.bookid,
                s2.name as service_name
            FROM booking b2
            JOIN service s2 ON b2.svid = s2.serviceid
            WHERE s2.providerid = ? 
            AND b2.servedate = ? 
            AND b2.slot = ? 
            AND b2.bookid != ?
            AND b2.status = 'confirmed'
        `);

        const conflicts = checkConflictsStmt.all(userId, booking.servedate, booking.slot, bookingId);

        if (conflicts.length > 0) {
            return res.status(409).json({
                message: 'Cannot accept booking due to schedule conflicts',
                conflicts: conflicts.map(c => ({
                    bookingId: c.bookid,
                    serviceName: c.service_name
                }))
            });
        }

        // Accept the booking
        const acceptBookingStmt = db.prepare(`
            UPDATE booking SET status = 'confirmed' WHERE bookid = ?
        `);
        
        acceptBookingStmt.run(bookingId);

        res.status(200).json({
            message: 'Booking request accepted successfully',
            bookingId: parseInt(bookingId),
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            serviceName: booking.service_name,
            serviceDate: booking.servedate,
            timeSlot: booking.slot
        });

    } catch (error) {
        console.error('Error accepting booking request:', error);
        res.status(500).json({ 
            message: 'Internal server error while accepting booking request' 
        });
    }
});

/**
 * Reject a booking request
 * POST /bookings/provider/requests/:bookingId/reject
 * Role: Service Provider only
 */
router.post('/provider/requests/:bookingId/reject', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { bookingId } = req.params;
        const { reason } = req.body;

        // Only service providers can reject booking requests
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can reject booking requests.' 
            });
        }

        // Verify booking exists and belongs to provider
        const getBookingStmt = db.prepare(`
            SELECT 
                b.bookid, b.svid, b.slot, b.servedate, b.status,
                s.name as service_name, s.providerid,
                u.name as customer_name, u.email as customer_email
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE b.bookid = ? AND s.providerid = ?
        `);
        
        const booking = getBookingStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking request not found or access denied' 
            });
        }

        // Check if booking can be rejected
        if (booking.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot reject booking with status: ${booking.status}` 
            });
        }

        // Reject the booking
        const rejectBookingStmt = db.prepare(`
            UPDATE booking SET status = 'rejected' WHERE bookid = ?
        `);
        
        rejectBookingStmt.run(bookingId);

        // TODO: Log rejection reason if needed (could add a rejection_reason column to booking table)

        res.status(200).json({
            message: 'Booking request rejected successfully',
            bookingId: parseInt(bookingId),
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            serviceName: booking.service_name,
            serviceDate: booking.servedate,
            timeSlot: booking.slot,
            reason: reason || 'No reason provided'
        });

    } catch (error) {
        console.error('Error rejecting booking request:', error);
        res.status(500).json({ 
            message: 'Internal server error while rejecting booking request' 
        });
    }
});

/**
 * Auto-reject expired booking requests (more than 24 hours old)
 * POST /bookings/provider/auto-reject-expired
 * Role: Service Provider only
 */
router.post('/provider/auto-reject-expired', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Only service providers can trigger auto-rejection
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can auto-reject expired bookings.' 
            });
        }

        // Find all pending bookings older than 24 hours for this provider
        const getExpiredBookingsStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.book_timestamp,
                s.name as service_name,
                u.name as customer_name
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ? 
            AND b.status = 'pending'
            AND datetime(b.book_timestamp, '+24 hours') <= datetime('now')
        `);

        const expiredBookings = getExpiredBookingsStmt.all(userId);

        if (expiredBookings.length === 0) {
            return res.status(200).json({
                message: 'No expired booking requests found',
                rejectedCount: 0
            });
        }

        // Reject all expired bookings
        const rejectBookingStmt = db.prepare(`
            UPDATE booking SET status = 'rejected' WHERE bookid = ?
        `);

        const rejectedBookings = [];
        expiredBookings.forEach(booking => {
            rejectBookingStmt.run(booking.bookid);
            rejectedBookings.push({
                bookingId: booking.bookid,
                serviceName: booking.service_name,
                customerName: booking.customer_name,
                bookingTimestamp: booking.book_timestamp
            });
        });

        res.status(200).json({
            message: `Successfully auto-rejected ${expiredBookings.length} expired booking request(s)`,
            rejectedCount: expiredBookings.length,
            rejectedBookings: rejectedBookings
        });

    } catch (error) {
        console.error('Error auto-rejecting expired bookings:', error);
        res.status(500).json({ 
            message: 'Internal server error while auto-rejecting expired bookings' 
        });
    }
});

/**
 * Check available timeslots for a service on a specific date
 * GET /bookings/provider/availability/:serviceId/:date
 * Role: Service Provider only
 */
router.get('/provider/availability/:serviceId/:date', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { serviceId, date } = req.params;

        // Only service providers can check availability
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can check availability.' 
            });
        }

        // Verify service belongs to provider
        const getServiceStmt = db.prepare(`
            SELECT serviceid, name, providerid FROM service 
            WHERE serviceid = ? AND providerid = ?
        `);
        
        const service = getServiceStmt.get(serviceId, userId);

        if (!service) {
            return res.status(404).json({ 
                message: 'Service not found or access denied' 
            });
        }

        // Get all timeslots for this service
        const getAllTimeSlotsStmt = db.prepare(`
            SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot
        `);
        const allTimeSlots = getAllTimeSlotsStmt.all(serviceId);

        // Get booked timeslots for the specified date (excluding cancelled/rejected)
        const getBookedSlotsStmt = db.prepare(`
            SELECT slot, status, COUNT(*) as booking_count
            FROM booking 
            WHERE svid = ? AND servedate = ? AND status NOT IN ('cancelled', 'rejected')
            GROUP BY slot, status
        `);
        const bookedSlots = getBookedSlotsStmt.all(serviceId, date);

        // Check for conflicts with other services on the same date
        const getOtherServiceConflictsStmt = db.prepare(`
            SELECT 
                b.slot,
                s.name as conflicting_service_name,
                COUNT(*) as conflict_count
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            WHERE s.providerid = ? 
            AND b.servedate = ? 
            AND b.svid != ?
            AND b.status = 'confirmed'
            GROUP BY b.slot, s.serviceid, s.name
        `);
        const conflicts = getOtherServiceConflictsStmt.all(userId, date, serviceId);

        // Build availability response
        const availability = allTimeSlots.map(timeSlot => {
            const slot = timeSlot.slot;
            const booked = bookedSlots.filter(b => b.slot === slot);
            const conflicted = conflicts.filter(c => c.slot === slot);
            
            let status = 'available';
            let details = [];

            if (booked.length > 0) {
                const confirmed = booked.filter(b => b.status === 'confirmed');
                const pending = booked.filter(b => b.status === 'pending');
                
                if (confirmed.length > 0) {
                    status = 'booked';
                    details.push(`${confirmed.length} confirmed booking(s)`);
                }
                if (pending.length > 0) {
                    details.push(`${pending.length} pending booking(s)`);
                }
            }

            if (conflicted.length > 0) {
                status = status === 'available' ? 'conflicted' : 'booked_and_conflicted';
                details.push(`Conflicts with: ${conflicted.map(c => c.conflicting_service_name).join(', ')}`);
            }

            return {
                slot: slot,
                status: status,
                available: status === 'available',
                details: details,
                bookingCount: booked.reduce((sum, b) => sum + b.booking_count, 0),
                conflictCount: conflicted.reduce((sum, c) => sum + c.conflict_count, 0)
            };
        });

        const summary = {
            total: allTimeSlots.length,
            available: availability.filter(a => a.available).length,
            booked: availability.filter(a => a.status.includes('booked')).length,
            conflicted: availability.filter(a => a.status.includes('conflicted')).length
        };

        res.status(200).json({
            message: 'Availability checked successfully',
            serviceId: parseInt(serviceId),
            serviceName: service.name,
            date: date,
            availability: availability,
            summary: summary
        });

    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ 
            message: 'Internal server error while checking availability' 
        });
    }
});


export default router;
