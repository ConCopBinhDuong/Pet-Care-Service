import notificationService from './notificationService.js';

class NotificationScheduler {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        this.checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    /**
     * Start the notification scheduler
     */
    start(customInterval = null) {
        if (this.isRunning) {
            console.log('Notification scheduler is already running');
            return;
        }

        const interval = customInterval || this.checkInterval;
        
        console.log(`Starting notification scheduler with ${interval / 1000}s intervals`);
        
        // Run initial check
        this.runNotificationChecks();
        
        // Set up recurring checks
        this.intervalId = setInterval(() => {
            this.runNotificationChecks();
        }, interval);
        
        this.isRunning = true;
        console.log('Notification scheduler started successfully');
    }

    /**
     * Stop the notification scheduler
     */
    stop() {
        if (!this.isRunning) {
            console.log('Notification scheduler is not running');
            return;
        }

        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isRunning = false;
        console.log('Notification scheduler stopped');
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            checkInterval: this.checkInterval,
            intervalId: this.intervalId
        };
    }

    /**
     * Run all notification checks
     */
    async runNotificationChecks() {
        try {
            console.log(`[${new Date().toISOString()}] Running notification checks...`);
            
            // Check pet schedules
            const scheduleResult = notificationService.checkPetSchedules();
            if (scheduleResult.success && scheduleResult.notificationsCreated.length > 0) {
                console.log(`Created ${scheduleResult.notificationsCreated.length} pet schedule notifications`);
            }

            // Check booking status (expired bookings and reminders)
            const bookingResult = notificationService.checkBookingStatus();
            if (bookingResult.success) {
                const { expiredNotifications, reminderNotifications } = bookingResult.results;
                if (expiredNotifications > 0) {
                    console.log(`Created ${expiredNotifications} booking expiry notifications`);
                }
                if (reminderNotifications > 0) {
                    console.log(`Created ${reminderNotifications} booking reminder notifications`);
                }
            }

            // Optional: Clean up old notifications (run less frequently)
            if (Math.random() < 0.1) { // 10% chance to run cleanup
                const cleanupResult = notificationService.cleanupOldNotifications();
                if (cleanupResult.success && cleanupResult.deletedCount > 0) {
                    console.log(`Cleaned up ${cleanupResult.deletedCount} old notifications`);
                }
            }

        } catch (error) {
            console.error('Error in notification checks:', error);
        }
    }

    /**
     * Manually trigger notification checks
     */
    triggerCheck() {
        console.log('Manually triggering notification checks...');
        return this.runNotificationChecks();
    }

    /**
     * Update check interval
     */
    updateInterval(newInterval) {
        const wasRunning = this.isRunning;
        
        if (wasRunning) {
            this.stop();
        }
        
        this.checkInterval = newInterval;
        
        if (wasRunning) {
            this.start();
        }
        
        console.log(`Updated notification check interval to ${newInterval / 1000}s`);
    }
}

export default new NotificationScheduler();
