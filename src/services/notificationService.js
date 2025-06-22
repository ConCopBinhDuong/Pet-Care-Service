import db from '../Database_sqlite.js';
import moment from 'moment';

class NotificationService {
    constructor() {
        this.db = db;
    }

    /**
     * Create a notification
     */
    createNotification(userId, text, type = 'general', scheduleId = null, relatedId = null, scheduledTime = null) {
    try {

        const insertStmt = this.db.prepare(`
            INSERT INTO notification (userid, text, type, schedule_id, related_id, scheduled_time, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        console.log('createNotification params:', { userId, text, type, scheduleId, relatedId, scheduledTime });

        const result = insertStmt.run(userId, text, type, scheduleId, relatedId, scheduledTime);
        return { success: true, notificationId: result.lastInsertRowid };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
    }
}

    /**
     * Notify service provider when their service is approved
     */
    notifyServiceApproved(serviceId, providerId, serviceName, reviewerName) {
        const text = `Great news! Your service "${serviceName}" has been approved by ${reviewerName} and is now live for bookings.`;
        return this.createNotification(providerId, text, 'service_approved', null, serviceId);
    }

    /**
     * Notify service provider when their service is rejected
     */
    notifyServiceRejected(serviceId, providerId, serviceName, reviewerName, rejectionReason) {
        const text = `Your service "${serviceName}" has been rejected by ${reviewerName}. Reason: ${rejectionReason}`;
        return this.createNotification(providerId, text, 'service_rejected', null, serviceId);
    }

    /**
     * Notify service provider when they receive a new booking request
     */
    notifyNewBooking(bookingId, providerId, serviceName, customerName, serviceDate, timeSlot) {
        const formattedDate = moment(serviceDate).format('MMMM Do, YYYY');
        const text = `New booking request from ${customerName} for "${serviceName}" on ${formattedDate} at ${timeSlot}.`;
        return this.createNotification(providerId, text, 'booking_request', null, bookingId);
    }

    /**
     * Notify pet owner when their booking is accepted
     */
    notifyBookingAccepted(bookingId, petOwnerId, serviceName, providerName, serviceDate, timeSlot) {
        const formattedDate = moment(serviceDate).format('MMMM Do, YYYY');
        const text = `Your booking for "${serviceName}" with ${providerName} on ${formattedDate} at ${timeSlot} has been confirmed!`;
        return this.createNotification(petOwnerId, text, 'booking_accepted', null, bookingId);
    }

    /**
     * Notify pet owner when their booking is rejected
     */
    notifyBookingRejected(bookingId, petOwnerId, serviceName, providerName, serviceDate, timeSlot, reason = null) {
        const formattedDate = moment(serviceDate).format('MMMM Do, YYYY');
        let text = `Your booking for "${serviceName}" with ${providerName} on ${formattedDate} at ${timeSlot} has been declined.`;
        if (reason) {
            text += ` Reason: ${reason}`;
        }
        return this.createNotification(petOwnerId, text, 'booking_rejected', null, bookingId);
    }

    /**
     * Notify pet owner when their booking expires
     */
    notifyBookingExpired(bookingId, petOwnerId, serviceName, providerName, serviceDate, timeSlot) {
        const formattedDate = moment(serviceDate).format('MMMM Do, YYYY');
        const text = `Your booking request for "${serviceName}" with ${providerName} on ${formattedDate} at ${timeSlot} has expired due to no response.`;
        return this.createNotification(petOwnerId, text, 'booking_expired', null, bookingId);
    }

    /**
     * Create booking reminder notification
     */
    notifyBookingReminder(bookingId, petOwnerId, serviceName, providerName, serviceDate, timeSlot, hoursAhead) {
        const formattedDate = moment(serviceDate).format('MMMM Do, YYYY');
        const text = `Reminder: You have a "${serviceName}" appointment with ${providerName} tomorrow (${formattedDate}) at ${timeSlot}.`;
        return this.createNotification(petOwnerId, text, 'booking_reminder', null, bookingId);
    }

    /**
     * Check and create pet schedule notifications
     */
    checkPetSchedules() {
        try {
            const now = moment();
            const currentTime = now.format('HH:mm');
            const currentDate = now.format('YYYY-MM-DD');

            // Get all active schedules that should trigger notifications
            const getSchedulesStmt = this.db.prepare(`
                SELECT 
                    ps.petscheduleid, ps.startdate, ps.repeat_option, ps.hour, ps.minute,
                    ps.dietid, ps.activityid,
                    d.name as diet_name, d.amount as diet_amount,
                    a.name as activity_name,
                    p.name as pet_name, p.userid
                FROM petschedule ps
                LEFT JOIN diet d ON ps.dietid = d.dietid
                LEFT JOIN activity a ON ps.activityid = a.activityid
                LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
                WHERE p.userid IS NOT NULL
            `);

            const schedules = getSchedulesStmt.all();
            const notifications = [];

            for (const schedule of schedules) {
                const scheduleTime = `${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`;
                
                // Check if it's time for this notification (within 5 minutes)
                const timeDiff = moment.duration(moment(scheduleTime, 'HH:mm').diff(moment(currentTime, 'HH:mm'))).asMinutes();
                
                if (Math.abs(timeDiff) <= 5) {
                    const shouldNotify = this.shouldTriggerScheduleNotification(schedule, currentDate);
                    
                    if (shouldNotify) {
                        // Check if notification already sent today for this schedule
                        const existingNotification = this.db.prepare(`
                            SELECT notiid FROM notification 
                            WHERE userid = ? AND schedule_id = ? 
                            AND DATE(created_at) = DATE(?)
                            AND type IN ('diet', 'activity')
                        `).get(schedule.userid, schedule.petscheduleid, currentDate);

                        if (!existingNotification) {
                            let notificationText, notificationType;
                            
                            if (schedule.diet_name) {
                                notificationText = `Time to feed ${schedule.pet_name}! Diet: ${schedule.diet_name} (${schedule.diet_amount})`;
                                notificationType = 'diet';
                            } else if (schedule.activity_name) {
                                notificationText = `Time for ${schedule.pet_name}'s activity: ${schedule.activity_name}`;
                                notificationType = 'activity';
                            }

                            const result = this.createNotification(
                                schedule.userid,
                                notificationText,
                                notificationType,
                                schedule.petscheduleid,
                                null,
                                `${currentDate} ${scheduleTime}:00`
                            );

                            if (result.success) {
                                notifications.push({
                                    petName: schedule.pet_name,
                                    type: notificationType,
                                    time: scheduleTime
                                });
                            }
                        }
                    }
                }
            }

            return { success: true, notificationsCreated: notifications };
        } catch (error) {
            console.error('Error checking pet schedules:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Determine if a schedule should trigger a notification based on repeat option
     */
    shouldTriggerScheduleNotification(schedule, currentDate) {
        const startDate = moment(schedule.startdate);
        const current = moment(currentDate);
        
        // If current date is before start date, don't trigger
        if (current.isBefore(startDate, 'day')) {
            return false;
        }

        switch (schedule.repeat_option?.toLowerCase()) {
            case 'daily':
                return true;
            case 'weekly':
                return current.day() === startDate.day();
            case 'monthly':
                return current.date() === startDate.date();
            case 'once':
                return current.isSame(startDate, 'day');
            default:
                return false;
        }
    }

    /**
     * Check for expired bookings and send notifications
     */
    checkBookingStatus() {
        try {
            const results = {
                expiredNotifications: 0,
                reminderNotifications: 0
            };

            // Check for expired booking requests (pending > 24 hours)
            const expiredBookingsStmt = this.db.prepare(`
                SELECT 
                    b.bookid, b.poid, b.book_timestamp,
                    s.name as service_name,
                    sp.business_name as provider_name,
                    b.servedate, b.slot
                FROM booking b
                JOIN service s ON b.svid = s.serviceid
                JOIN serviceprovider sp ON s.providerid = sp.id
                WHERE b.status = 'pending'
                AND datetime(b.book_timestamp, '+24 hours') <= datetime('now')
            `);

            const expiredBookings = expiredBookingsStmt.all();

            for (const booking of expiredBookings) {
                // Check if expiry notification already sent
                const existingNotification = this.db.prepare(`
                    SELECT notiid FROM notification 
                    WHERE userid = ? AND related_id = ? AND type = 'booking_expired'
                `).get(booking.poid, booking.bookid);

                if (!existingNotification) {
                    this.notifyBookingExpired(
                        booking.bookid,
                        booking.poid,
                        booking.service_name,
                        booking.provider_name,
                        booking.servedate,
                        booking.slot
                    );
                    results.expiredNotifications++;
                }
            }

            // Check for booking reminders (confirmed bookings tomorrow)
            const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
            
            const upcomingBookingsStmt = this.db.prepare(`
                SELECT 
                    b.bookid, b.poid,
                    s.name as service_name,
                    sp.business_name as provider_name,
                    b.servedate, b.slot
                FROM booking b
                JOIN service s ON b.svid = s.serviceid
                JOIN serviceprovider sp ON s.providerid = sp.id
                WHERE b.status = 'confirmed'
                AND DATE(b.servedate) = ?
            `);

            const upcomingBookings = upcomingBookingsStmt.all(tomorrow);

            for (const booking of upcomingBookings) {
                // Check if reminder already sent
                const existingReminder = this.db.prepare(`
                    SELECT notiid FROM notification 
                    WHERE userid = ? AND related_id = ? AND type = 'booking_reminder'
                    AND DATE(created_at) = DATE('now')
                `).get(booking.poid, booking.bookid);

                if (!existingReminder) {
                    this.notifyBookingReminder(
                        booking.bookid,
                        booking.poid,
                        booking.service_name,
                        booking.provider_name,
                        booking.servedate,
                        booking.slot,
                        24
                    );
                    results.reminderNotifications++;
                }
            }

            return { success: true, results };
        } catch (error) {
            console.error('Error checking booking status:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get notifications for a user with pagination
     */
    getUserNotifications(userId, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                type = null, 
                unreadOnly = false 
            } = options;
            
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT notiid, text, type, created_at, read_status, scheduled_time
                FROM notification 
                WHERE userid = ?
            `;
            const params = [userId];
            
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            
            if (unreadOnly) {
                query += ' AND read_status = 0';
            }
            
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            const notifications = this.db.prepare(query).all(...params);
            
            // Get total count
            let countQuery = 'SELECT COUNT(*) as total FROM notification WHERE userid = ?';
            const countParams = [userId];
            
            if (type) {
                countQuery += ' AND type = ?';
                countParams.push(type);
            }
            
            if (unreadOnly) {
                countQuery += ' AND read_status = 0';
            }
            
            const totalCount = this.db.prepare(countQuery).get(...countParams).total;
            
            return {
                success: true,
                notifications,
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            };
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId, userId) {
        try {
            const updateStmt = this.db.prepare(`
                UPDATE notification 
                SET read_status = 1 
                WHERE notiid = ? AND userid = ?
            `);
            
            const result = updateStmt.run(notificationId, userId);
            
            return { 
                success: result.changes > 0,
                updated: result.changes > 0
            };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId) {
        try {
            const updateStmt = this.db.prepare(`
                UPDATE notification 
                SET read_status = 1 
                WHERE userid = ? AND read_status = 0
            `);
            
            const result = updateStmt.run(userId);
            
            return { 
                success: true,
                updatedCount: result.changes
            };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a notification
     */
    deleteNotification(notificationId, userId) {
        try {
            const deleteStmt = this.db.prepare(`
                DELETE FROM notification 
                WHERE notiid = ? AND userid = ?
            `);
            
            const result = deleteStmt.run(notificationId, userId);
            
            return { 
                success: result.changes > 0,
                deleted: result.changes > 0
            };
        } catch (error) {
            console.error('Error deleting notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get notification statistics for a user
     */
    getNotificationStats(userId) {
        try {
            const statsStmt = this.db.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN read_status = 0 THEN 1 ELSE 0 END) as unread,
                    SUM(CASE WHEN type = 'diet' THEN 1 ELSE 0 END) as diet,
                    SUM(CASE WHEN type = 'activity' THEN 1 ELSE 0 END) as activity,
                    SUM(CASE WHEN type = 'service_approved' THEN 1 ELSE 0 END) as service_approved,
                    SUM(CASE WHEN type = 'service_rejected' THEN 1 ELSE 0 END) as service_rejected,
                    SUM(CASE WHEN type = 'booking_accepted' THEN 1 ELSE 0 END) as booking_accepted,
                    SUM(CASE WHEN type = 'booking_rejected' THEN 1 ELSE 0 END) as booking_rejected,
                    SUM(CASE WHEN type = 'booking_expired' THEN 1 ELSE 0 END) as booking_expired,
                    SUM(CASE WHEN type = 'booking_request' THEN 1 ELSE 0 END) as booking_request,
                    SUM(CASE WHEN type = 'booking_reminder' THEN 1 ELSE 0 END) as booking_reminder
                FROM notification 
                WHERE userid = ?
            `);
            
            const stats = statsStmt.get(userId);
            
            return { success: true, stats };
        } catch (error) {
            console.error('Error getting notification stats:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clean up old notifications (older than 30 days)
     */
    cleanupOldNotifications() {
        try {
            const deleteStmt = this.db.prepare(`
                DELETE FROM notification 
                WHERE datetime(created_at) < datetime('now', '-30 days')
            `);
            
            const result = deleteStmt.run();
            
            return { 
                success: true,
                deletedCount: result.changes
            };
        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new NotificationService();
