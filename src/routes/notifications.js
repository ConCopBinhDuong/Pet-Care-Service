import express from 'express';
import notificationService from '../services/notificationService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import db from '../db.js';

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(authMiddleware);

/**
 * Get user notifications with pagination and filtering
 * GET /api/notifications
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userid;
        const { 
            page = 1, 
            limit = 20, 
            type = null, 
            unreadOnly = false 
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 100), // Max 100 per page
            type: type,
            unreadOnly: unreadOnly === 'true'
        };

        const result = await notificationService.getUserNotifications(userId, options);

        if (!result.success) {
            return res.status(500).json({
                message: 'Error retrieving notifications',
                error: result.error
            });
        }

        res.status(200).json({
            message: 'Notifications retrieved successfully',
            ...result
        });

    } catch (error) {
        console.error('Error in get notifications route:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving notifications'
        });
    }
});

/**
 * Get notification statistics for the user
 * GET /api/notifications/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.userid;
        const result = await notificationService.getNotificationStats(userId);

        if (!result.success) {
            return res.status(500).json({
                message: 'Error retrieving notification statistics',
                error: result.error
            });
        }

        res.status(200).json({
            message: 'Notification statistics retrieved successfully',
            ...result
        });

    } catch (error) {
        console.error('Error in get notification stats route:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving notification statistics'
        });
    }
});

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', async (req, res) => {
    try {
        const userId = req.user.userid;
        const notificationId = parseInt(req.params.id);

        if (isNaN(notificationId)) {
            return res.status(400).json({
                message: 'Invalid notification ID'
            });
        }

        const result = await notificationService.markAsRead(notificationId, userId);

        if (!result.success) {
            return res.status(500).json({
                message: 'Error marking notification as read',
                error: result.error
            });
        }

        if (!result.updated) {
            return res.status(404).json({
                message: 'Notification not found or access denied'
            });
        }

        res.status(200).json({
            message: 'Notification marked as read successfully'
        });

    } catch (error) {
        console.error('Error in mark notification as read route:', error);
        res.status(500).json({
            message: 'Internal server error while marking notification as read'
        });
    }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', async (req, res) => {
    try {
        const userId = req.user.userid;
        const result = await notificationService.markAllAsRead(userId);

        if (!result.success) {
            return res.status(500).json({
                message: 'Error marking all notifications as read',
                error: result.error
            });
        }

        res.status(200).json({
            message: 'All notifications marked as read successfully',
            updatedCount: result.updatedCount
        });

    } catch (error) {
        console.error('Error in mark all notifications as read route:', error);
        res.status(500).json({
            message: 'Internal server error while marking all notifications as read'
        });
    }
});

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.userid;
        const notificationId = parseInt(req.params.id);

        if (isNaN(notificationId)) {
            return res.status(400).json({
                message: 'Invalid notification ID'
            });
        }

        const result = await notificationService.deleteNotification(notificationId, userId);

        if (!result.success) {
            return res.status(500).json({
                message: 'Error deleting notification',
                error: result.error
            });
        }

        if (!result.deleted) {
            return res.status(404).json({
                message: 'Notification not found or access denied'
            });
        }

        res.status(200).json({
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Error in delete notification route:', error);
        res.status(500).json({
            message: 'Internal server error while deleting notification'
        });
    }
});

/**
 * Manually trigger schedule checks (for testing)
 * POST /api/notifications/check-schedules
 */
router.post('/check-schedules', async (req, res) => {
    try {
        const userRole = req.user.role;

        // Only allow managers and service providers to trigger manual checks
        if (!['Manager', 'Service provider'].includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Only managers and service providers can trigger manual checks.'
            });
        }

        const scheduleResult = await notificationService.checkPetSchedules();
        const bookingResult = await notificationService.checkBookingStatus();

        res.status(200).json({
            message: 'Manual notification check completed',
            results: {
                petSchedules: scheduleResult,
                bookingStatus: bookingResult
            }
        });

    } catch (error) {
        console.error('Error in manual check schedules route:', error);
        res.status(500).json({
            message: 'Internal server error while checking schedules'
        });
    }
});

// =============================================================================
// ADMIN ROUTES (Manager only)
// =============================================================================

/**
 * Get system notification statistics (Admin only)
 * GET /api/notifications/admin/stats
 */
router.get('/admin/stats', async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can access system statistics.'
            });
        }

        // Get overall system notification stats
        const statsQuery = `
            SELECT 
                COUNT(*) as total_notifications,
                SUM(CASE WHEN read_status = 0 THEN 1 ELSE 0 END) as total_unread,
                SUM(CASE WHEN type = 'diet' THEN 1 ELSE 0 END) as diet_notifications,
                SUM(CASE WHEN type = 'activity' THEN 1 ELSE 0 END) as activity_notifications,
                SUM(CASE WHEN type = 'service_approved' THEN 1 ELSE 0 END) as service_approved,
                SUM(CASE WHEN type = 'service_rejected' THEN 1 ELSE 0 END) as service_rejected,
                SUM(CASE WHEN type = 'booking_accepted' THEN 1 ELSE 0 END) as booking_accepted,
                SUM(CASE WHEN type = 'booking_rejected' THEN 1 ELSE 0 END) as booking_rejected,
                SUM(CASE WHEN type = 'booking_expired' THEN 1 ELSE 0 END) as booking_expired,
                SUM(CASE WHEN type = 'booking_request' THEN 1 ELSE 0 END) as booking_requests,
                SUM(CASE WHEN type = 'booking_reminder' THEN 1 ELSE 0 END) as booking_reminders,
                COUNT(DISTINCT userid) as active_users,
                DATE(created_at) as notification_date,
                COUNT(*) as daily_count
            FROM notification
            GROUP BY DATE(created_at)
            ORDER BY notification_date DESC
            LIMIT 7
        `;

        const overallStatsQuery = `
            SELECT 
                COUNT(*) as total_notifications,
                SUM(CASE WHEN read_status = 0 THEN 1 ELSE 0 END) as total_unread,
                COUNT(DISTINCT userid) as total_users_with_notifications,
                type,
                COUNT(*) as type_count
            FROM notification
            GROUP BY type
        `;

        const dailyStats = await db.all(statsQuery);
        const typeStats = await db.all(overallStatsQuery);

        res.status(200).json({
            message: 'System notification statistics retrieved successfully',
            dailyStats,
            typeStats
        });

    } catch (error) {
        console.error('Error in admin stats route:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving admin statistics'
        });
    }
});

/**
 * Clean up old notifications (Admin only)
 * POST /api/notifications/admin/cleanup
 */
router.post('/admin/cleanup', async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can perform cleanup operations.'
            });
        }

        const result = await notificationService.cleanupOldNotifications();

        if (!result.success) {
            return res.status(500).json({
                message: 'Error during cleanup operation',
                error: result.error
            });
        }

        res.status(200).json({
            message: 'Cleanup operation completed successfully',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error in admin cleanup route:', error);
        res.status(500).json({
            message: 'Internal server error during cleanup operation'
        });
    }
});

export default router;
