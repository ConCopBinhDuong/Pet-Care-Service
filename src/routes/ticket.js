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

        // Generate a PDF of the ticket response
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 12;

        page.drawText(`Ticket ID: ${ticket.ticketid}`, { x: 50, y: height - 50, size: fontSize });
        page.drawText(`Response: ${ticket.respone}`, { x: 50, y: height - 70, size: fontSize });
        page.drawText(`Status: Closed`, { x: 50, y: height - 90, size: fontSize });

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(__dirname, `ticket_${ticketId}_response.pdf`);
        fs.writeFileSync(pdfPath, pdfBytes);

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
            pdfPath: pdfPath
        });
    } catch (err) {
        console.error('Close ticket error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;