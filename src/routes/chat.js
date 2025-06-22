import express from 'express'
import db from '../Database_sqlite.js'
import { validateChatMessage } from '../middleware/validationMiddleware.js'
import notificationService from '../services/notificationService.js'

const router = express.Router();

// Get chat messages for a specific booking
router.get('/booking/:bookingId', (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Verify user has access to this booking
        const bookingCheckStmt = db.prepare(`
            SELECT 
                b.bookid, b.poid, b.status,
                s.providerid,
                sp.business_name as provider_name,
                po.id as owner_id,
                u_owner.name as owner_name,
                u_provider.name as provider_contact_name
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN petowner po ON b.poid = po.id
            JOIN users u_owner ON po.id = u_owner.userid
            JOIN users u_provider ON sp.id = u_provider.userid
            WHERE b.bookid = ?
        `);

        const booking = bookingCheckStmt.get(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user has access to this booking
        let hasAccess = false;
        if (userRole === 'Pet owner' && booking.poid === userId) {
            hasAccess = true;
        } else if (userRole === 'Service provider' && booking.providerid === userId) {
            hasAccess = true;
        } else if (userRole === 'Manager') {
            hasAccess = true; // Managers can view all chats
        }

        if (!hasAccess) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view chats for your own bookings.' 
            });
        }

        // Get all service updates (chat messages) for this booking
        const getChatMessagesStmt = db.prepare(`
            SELECT 
                su.bookid,
                su.no_update,
                su.text,
                su.image,
                'service_provider' as sender_type,
                sp.business_name as sender_name,
                u.name as sender_contact_name,
                datetime('now') as timestamp
            FROM service_update su
            JOIN booking b ON su.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON sp.id = u.userid
            WHERE su.bookid = ?
            ORDER BY su.no_update ASC
        `);

        const messages = getChatMessagesStmt.all(bookingId);

        res.status(200).json({
            message: 'Chat messages retrieved successfully',
            booking: {
                bookid: booking.bookid,
                status: booking.status,
                owner_name: booking.owner_name,
                provider_name: booking.provider_name,
                provider_contact: booking.provider_contact_name
            },
            messages: messages,
            user_role: userRole,
            can_send_message: userRole === 'Service provider' && booking.providerid === userId
        });

    } catch (err) {
        console.error('Get chat messages error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send a new chat message (service update)
router.post('/booking/:bookingId/message', validateChatMessage, (req, res) => {
    try {
        const { bookingId } = req.params;
        const { text, image } = req.body;
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only service providers can send service updates
        if (userRole !== 'Service provider') {
            return res.status(403).json({ 
                message: 'Access denied. Only service providers can send service updates.' 
            });
        }

        // Verify the service provider owns this booking's service
        const bookingCheckStmt = db.prepare(`
            SELECT b.bookid, b.poid, b.status, s.providerid
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            WHERE b.bookid = ? AND s.providerid = ?
        `);

        const booking = bookingCheckStmt.get(bookingId, userId);

        if (!booking) {
            return res.status(404).json({ 
                message: 'Booking not found or you do not have permission to update this booking.' 
            });
        }

        // Check if booking is in a state that allows updates
        if (!['confirmed', 'in_progress', 'completed'].includes(booking.status)) {
            return res.status(400).json({ 
                message: 'Cannot send updates for bookings with status: ' + booking.status 
            });
        }

        // Get the next update number for this booking
        const getMaxUpdateStmt = db.prepare(`
            SELECT COALESCE(MAX(no_update), 0) as max_update
            FROM service_update
            WHERE bookid = ?
        `);

        const result = getMaxUpdateStmt.get(bookingId);
        const nextUpdateNumber = result.max_update + 1;

        // Convert image to blob if provided
        let imageBlob = null;
        if (image) {
            // Assuming image is provided as base64 string
            imageBlob = Buffer.from(image, 'base64');
        }

        // Insert the new service update
        const insertUpdateStmt = db.prepare(`
            INSERT INTO service_update (bookid, no_update, text, image)
            VALUES (?, ?, ?, ?)
        `);

        insertUpdateStmt.run(bookingId, nextUpdateNumber, text, imageBlob);

        // Get service provider info for notification
        const providerInfoStmt = db.prepare(`
            SELECT sp.business_name, u.name as contact_name
            FROM serviceprovider sp
            JOIN users u ON sp.id = u.userid
            WHERE sp.id = ?
        `);

        const providerInfo = providerInfoStmt.get(userId);

        // Send notification to pet owner
        try {
            const notificationResult = notificationService.createNotification(
                booking.poid,
                `New update from ${providerInfo.business_name}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
                'booking_update',
                null,
                bookingId
            );
            
            if (!notificationResult.success) {
                console.error('Failed to create notification:', notificationResult.error);
            }
        } catch (notifError) {
            console.error('Failed to send notification:', notifError.message);
            // Don't fail the main operation if notification fails
        }

        res.status(201).json({
            message: 'Service update sent successfully',
            update: {
                bookid: parseInt(bookingId),
                no_update: nextUpdateNumber,
                text: text,
                has_image: !!image,
                sender: providerInfo.business_name,
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error('Send chat message error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all bookings with chat activity for a user
router.get('/conversations', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        let query, params;

        if (userRole === 'Pet owner') {
            // Get bookings where the user is the pet owner
            query = `
                SELECT DISTINCT
                    b.bookid,
                    b.status,
                    b.servedate,
                    s.name as service_name,
                    sp.business_name as provider_name,
                    u.name as provider_contact_name,
                    COUNT(su.no_update) as message_count,
                    MAX(su.no_update) as last_update_number
                FROM booking b
                JOIN service s ON b.svid = s.serviceid
                JOIN serviceprovider sp ON s.providerid = sp.id
                JOIN users u ON sp.id = u.userid
                LEFT JOIN service_update su ON b.bookid = su.bookid
                WHERE b.poid = ?
                GROUP BY b.bookid, b.status, b.servedate, s.name, sp.business_name, u.name
                ORDER BY b.servedate DESC
            `;
            params = [userId];
        } else if (userRole === 'Service provider') {
            // Get bookings where the user is the service provider
            query = `
                SELECT DISTINCT
                    b.bookid,
                    b.status,
                    b.servedate,
                    s.name as service_name,
                    po.id as owner_id,
                    u_owner.name as owner_name,
                    COUNT(su.no_update) as message_count,
                    MAX(su.no_update) as last_update_number
                FROM booking b
                JOIN service s ON b.svid = s.serviceid
                JOIN petowner po ON b.poid = po.id
                JOIN users u_owner ON po.id = u_owner.userid
                LEFT JOIN service_update su ON b.bookid = su.bookid
                WHERE s.providerid = ?
                GROUP BY b.bookid, b.status, b.servedate, s.name, po.id, u_owner.name
                ORDER BY b.servedate DESC
            `;
            params = [userId];
        } else {
            // Managers can see all conversations
            query = `
                SELECT DISTINCT
                    b.bookid,
                    b.status,
                    b.servedate,
                    s.name as service_name,
                    sp.business_name as provider_name,
                    u_provider.name as provider_contact_name,
                    u_owner.name as owner_name,
                    COUNT(su.no_update) as message_count,
                    MAX(su.no_update) as last_update_number
                FROM booking b
                JOIN service s ON b.svid = s.serviceid
                JOIN serviceprovider sp ON s.providerid = sp.id
                JOIN users u_provider ON sp.id = u_provider.userid
                JOIN petowner po ON b.poid = po.id
                JOIN users u_owner ON po.id = u_owner.userid
                LEFT JOIN service_update su ON b.bookid = su.bookid
                GROUP BY b.bookid, b.status, b.servedate, s.name, sp.business_name, u_provider.name, u_owner.name
                ORDER BY b.servedate DESC
            `;
            params = [];
        }

        const conversationsStmt = db.prepare(query);
        const conversations = conversationsStmt.all(...params);

        res.status(200).json({
            message: 'Conversations retrieved successfully',
            conversations: conversations,
            user_role: userRole
        });

    } catch (err) {
        console.error('Get conversations error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mark chat as read (for future implementation with read status)
router.put('/booking/:bookingId/mark-read', (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Verify user has access to this booking
        const bookingCheckStmt = db.prepare(`
            SELECT b.bookid, b.poid, s.providerid
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            WHERE b.bookid = ?
        `);

        const booking = bookingCheckStmt.get(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user has access to this booking
        let hasAccess = false;
        if (userRole === 'Pet owner' && booking.poid === userId) {
            hasAccess = true;
        } else if (userRole === 'Service provider' && booking.providerid === userId) {
            hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json({ 
                message: 'Access denied. You can only mark your own booking chats as read.' 
            });
        }

        // For now, just return success
        // In future implementations, could add read status tracking
        res.status(200).json({
            message: 'Chat marked as read',
            bookid: parseInt(bookingId)
        });

    } catch (err) {
        console.error('Mark chat as read error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get image from service update
router.get('/message/:bookingId/:updateNumber/image', (req, res) => {
    try {
        const { bookingId, updateNumber } = req.params;
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Verify user has access to this booking
        const accessCheckStmt = db.prepare(`
            SELECT b.bookid, b.poid, s.providerid
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            WHERE b.bookid = ?
        `);

        const booking = accessCheckStmt.get(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user has access to this booking
        let hasAccess = false;
        if (userRole === 'Pet owner' && booking.poid === userId) {
            hasAccess = true;
        } else if (userRole === 'Service provider' && booking.providerid === userId) {
            hasAccess = true;
        } else if (userRole === 'Manager') {
            hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json({ 
                message: 'Access denied.' 
            });
        }

        // Get the image
        const getImageStmt = db.prepare(`
            SELECT image
            FROM service_update
            WHERE bookid = ? AND no_update = ?
        `);

        const result = getImageStmt.get(bookingId, updateNumber);

        if (!result || !result.image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Return image as base64
        const imageBase64 = result.image.toString('base64');
        res.status(200).json({
            message: 'Image retrieved successfully',
            image: imageBase64,
            content_type: 'image/jpeg' // Default, could be detected
        });

    } catch (err) {
        console.error('Get message image error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
