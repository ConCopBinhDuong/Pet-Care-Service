import express from 'express';
import db from '../Database_sqlite.js';
import { validateTicketReply } from '../middleware/validationMiddleware.js';

const router = express.Router();


// Manager closes an open ticket (moves to "finished")
router.post('/:ticketId/close', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const ticketId = parseInt(req.params.ticketId);

        // Only managers can close tickets
        if (userRole !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can close tickets.'
            });
        }

        if (isNaN(ticketId)) {
            return res.status(400).json({ message: 'Invalid ticket ID' });
        }

        // Check if the ticket exists and is in "solving" status
        const getTicketStmt = db.prepare(`
            SELECT ticketid, status 
            FROM ticket 
            WHERE ticketid = ?
        `);
        const ticket = getTicketStmt.get(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.status !== 'solving') {
            return res.status(400).json({ message: 'Only tickets in \"solving\" status can be closed.' });
        }

        // Set status to 'finished'
        const closeTicketStmt = db.prepare(`
            UPDATE ticket 
            SET status = 'finished'
            WHERE ticketid = ?
        `);
        closeTicketStmt.run(ticketId);

        res.status(200).json({
            message: 'Ticket closed successfully',
            ticketId: ticketId,
            status: 'finished'
        });
    } catch (err) {
        console.error('Close ticket error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all finished tickets for the authenticated user (archived = finished)
router.get('/archived', (req, res) => {
    try {
        const userId = req.user.userid;

        // Fetch finished tickets where the user is the owner
        const getArchivedTicketsStmt = db.prepare(`
            SELECT ticketid, subject, description, status, response, attachment, createtime, assigntime, managerid
            FROM ticket
            WHERE userid = ? AND status = 'finished'
            ORDER BY assigntime DESC
        `);
        const archivedTickets = getArchivedTicketsStmt.all(userId);

        res.status(200).json({
            archivedTickets
        });
    } catch (err) {
        console.error('Get archived tickets error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Open a ticket for a booking (Pet owner or Service provider)
router.post('/booking/:bookingId/open', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);
        const { subject, description, attachment } = req.body;

        // Only pet owners or service providers can open tickets
        if (userRole !== 'Pet owner' && userRole !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only pet owners or service providers can open tickets.'
            });
        }

        if (isNaN(bookingId) || !subject || !description) {
            return res.status(400).json({ message: 'Missing or invalid booking ID, subject, or description.' });
        }

        // Check if the booking exists and belongs to the user (as owner or provider)
        const getBookingStmt = db.prepare(`
            SELECT bookid, poid, svid FROM booking WHERE bookid = ?
        `);
        const booking = getBookingStmt.get(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        let serviceProvider = null;
        if (userRole === "Service provider") {
            const getServiceProviderStmt = db.prepare(`
                SELECT s.providerid FROM booking b
                JOIN service s ON s.serviceid = b.svid
                WHERE b.svid =?
            `);
        serviceProvider = getServiceProviderStmt.get(booking.svid);}

        let serviceProviderId = null;
            if (serviceProvider) {
        serviceProviderId = serviceProvider.providerid;}
        
        console.log("serviceProviderId:", serviceProviderId);
        console.log('Booking details:', booking);
        console.log('User details:', { userId, userRole });
        // Check ownership
        if (
            (userRole === 'Pet owner' && booking.poid !== userId) ||
            (userRole === 'Service provider' && serviceProviderId !== userId)
        ) {
            return res.status(403).json({ message: 'You do not have permission to open a ticket for this booking.' });
        }

        // Insert the ticket (attachment is optional, should be a Buffer or null)
        let attachmentBuffer = null;
        if (attachment) {
            // If attachment is base64, convert to Buffer
            if (typeof attachment === 'string' && attachment.startsWith('data:')) {
                const base64Data = attachment.split(',')[1];
                attachmentBuffer = Buffer.from(base64Data, 'base64');
            }
        }

        const insertTicketStmt = db.prepare(`
            INSERT INTO ticket (userid, subject, description, attachment, status, bookingid)
            VALUES (?, ?, ?, ?, 'pending', ?)
        `);
        const result = insertTicketStmt.run(userId, subject, description, attachmentBuffer, bookingId);

        res.status(201).json({
            message: 'Ticket opened successfully',
            ticketId: result.lastInsertRowid,
            status: 'pending'
        });
    } catch (err) {
        console.error('Open ticket error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Pet owner or service provider replies to a pending ticket (threaded reply)
router.post('/:ticketId/reply-user', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const ticketId = parseInt(req.params.ticketId);
        const { message } = req.body;

        if (userRole !== 'Pet owner' && userRole !== 'Service provider') {
            return res.status(403).json({ message: 'Only pet owners or service providers can reply.' });
        }
        if (isNaN(ticketId) || !message) {
            return res.status(400).json({ message: 'Invalid ticket ID or missing message.' });
        }

        // Check ticket exists and is pending, and belongs to user
        const ticket = db.prepare(`SELECT * FROM ticket WHERE ticketid = ?`).get(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
        if (ticket.status !== 'solving') {
            return res.status(400).json({ message: 'You can only reply to tickets in pending status.' });
        }
        if (ticket.userid !== userId) {
            return res.status(403).json({ message: 'You do not have permission to reply to this ticket.' });
        }

        db.prepare(`
            INSERT INTO ticketreply (ticketid, userid, role, message)
            VALUES (?, ?, ?, ?)
        `).run(ticketId, userId, userRole, message);

        res.status(201).json({ message: 'Reply sent successfully.' });
    } catch (err) {
        console.error('User reply error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Manager initial reply to a pending ticket (moves to "solving" and sets response, managerid, assigntime)
router.post('/:ticketId/reply', validateTicketReply, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const ticketId = parseInt(req.params.ticketId);
        const { response } = req.body;

        // Only managers can reply to tickets
        if (userRole !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can reply to tickets.'
            });
        }

        if (isNaN(ticketId)) {
            return res.status(400).json({ message: 'Invalid ticket ID' });
        }

        // Check if the ticket exists and is in "pending" status
        const getTicketStmt = db.prepare(`
            SELECT ticketid, status 
            FROM ticket 
            WHERE ticketid = ?
        `);
        const ticket = getTicketStmt.get(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending tickets can be replied to initially.' });
        }

        // "response" is required for initial manager reply
        if (!response) {
            return res.status(400).json({ message: 'Missing response in request body.' });
        }

        // Initial manager reply: update ticket, set status to solving
        const updateTicketStmt = db.prepare(`
            UPDATE ticket 
            SET response = ?, status = 'solving', managerid = ?, assigntime = CURRENT_TIMESTAMP
            WHERE ticketid = ?
        `);
        updateTicketStmt.run(response, userId, ticketId);

        return res.status(200).json({
            message: 'Ticket replied successfully',
            ticketId: ticketId,
            status: 'solving'
        });

    } catch (err) {
        console.error('Reply to ticket error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Manager replies to a solving ticket (threaded reply)
router.post('/:ticketId/reply-manager', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const ticketId = parseInt(req.params.ticketId);
        const { message } = req.body;

        if (userRole !== 'Manager') {
            return res.status(403).json({ message: 'Only managers can reply.' });
        }
        if (isNaN(ticketId) || !message) {
            return res.status(400).json({ message: 'Invalid ticket ID or missing message.' });
        }

        // Check ticket exists and is in "solving" status
        const ticket = db.prepare(`SELECT * FROM ticket WHERE ticketid = ?`).get(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
        if (ticket.status !== 'solving') {
            return res.status(400).json({ message: 'You can only reply to tickets in solving status.' });
        }

        db.prepare(`
            INSERT INTO ticketreply (ticketid, userid, role, message)
            VALUES (?, ?, ?, ?)
        `).run(ticketId, userId, userRole, message);

        return res.status(201).json({ message: 'Manager reply sent successfully.' });
    } catch (err) {
        console.error('Manager reply error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Optional) Get all replies for a ticket
router.get('/:ticketId/replies', (req, res) => {
    try {
        const ticketId = parseInt(req.params.ticketId);
        if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid ticket ID.' });

        const replies = db.prepare(`
            SELECT replyid, userid, role, message, created_at
            FROM ticketreply
            WHERE ticketid = ?
            ORDER BY created_at ASC
        `).all(ticketId);

        res.status(200).json({ replies });
    } catch (err) {
        console.error('Get replies error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
export default router;