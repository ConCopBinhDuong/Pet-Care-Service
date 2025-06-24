import express from 'express';
import db from '../Database_sqlite.js';
import { validateTicketReply } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Manager replies to a pending ticket
router.post('/:ticketId/reply', validateTicketReply, (req, res) => {
    try {
        const managerId = req.userId; // Assuming manager's ID is set in req.userId
        const userRole = req.userRole;
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
            return res.status(400).json({ message: 'Only pending tickets can be replied to.' });
        }

        // Update the ticket with the manager's response and change status to "solving"
        const updateTicketStmt = db.prepare(`
            UPDATE ticket 
            SET respone = ?, status = 'solving', managerid = ? 
            WHERE ticketid = ?
        `);
        updateTicketStmt.run(response, managerId, ticketId);

        res.status(200).json({
            message: 'Ticket replied successfully',
            ticketId: ticketId,
            status: 'solving'
        });
    } catch (err) {
        console.error('Reply to ticket error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Manager closes an open ticket
router.post('/:ticketId/close', async (req, res) => {
    try {
        const managerId = req.userId; // Assuming manager's ID is set in req.userId
        const userRole = req.userRole;
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
            SELECT ticketid, respone, status 
            FROM ticket 
            WHERE ticketid = ?
        `);
        const ticket = getTicketStmt.get(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.status !== 'solving') {
            return res.status(400).json({ message: 'Only tickets in "solving" status can be closed.' });
        }


        // Archive the ticket
        const archiveTicketStmt = db.prepare(`
            UPDATE ticket 
            SET status = 'closed', archived = 1 
            WHERE ticketid = ?
        `);
        archiveTicketStmt.run(ticketId);

        res.status(200).json({
            message: 'Ticket closed successfully',
            ticketId: ticketId,
            status: 'closed'
        });
    } catch (err) {
        console.error('Close ticket error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get all archived tickets for the authenticated user
router.get('/archived', (req, res) => {
    try {
        const userId = req.userId; // Assuming user's ID is set in req.userId

        // Fetch archived tickets where the user is the owner
        const getArchivedTicketsStmt = db.prepare(`
            SELECT ticketid, subject, description, status, respone, created_at, closed_at
            FROM ticket
            WHERE userid = ? AND archived = 1
            ORDER BY closed_at DESC
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

export default router;