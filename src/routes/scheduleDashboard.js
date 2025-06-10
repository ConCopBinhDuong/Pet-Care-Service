import express from 'express';
import db from '../Database_sqlite.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// =============================================================================
// PET OWNER SCHEDULE DASHBOARD ENDPOINTS
// =============================================================================

/**
 * Get Pet Owner's Schedule Dashboard - All Service Appointments
 * GET /api/schedule/dashboard
 * Role: Pet Owner only
 */
router.get('/dashboard', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (userRole !== 'Pet owner') {
            return res.status(403).json({
                message: 'Access denied. Only pet owners can view appointment schedules.'
            });
        }

        const { startDate, endDate, status, serviceType } = req.query;
        
        let query = `
            SELECT 
                b.bookid,
                b.servedate,
                b.slot,
                b.status,
                b.payment_method,
                b.book_timestamp,
                s.serviceid,
                s.name as service_name,
                s.description as service_description,
                s.duration,
                s.price,
                st.type as service_type,
                sp.bussiness_name as provider_name,
                sp.phone as provider_phone,
                sp.address as provider_address,
                u.name as provider_contact_name,
                u.email as provider_email
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON sp.id = u.userid
            WHERE b.poid = ?
        `;

        const params = [userId];

        // Add filters
        if (startDate) {
            query += ' AND b.servedate >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND b.servedate <= ?';
            params.push(endDate);
        }

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (serviceType) {
            query += ' AND st.type LIKE ?';
            params.push(`%${serviceType}%`);
        }

        query += ' ORDER BY b.servedate DESC, b.slot ASC';

        const getAppointmentsStmt = db.prepare(query);
        const appointments = getAppointmentsStmt.all(...params);

        // Get pets for each appointment
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

        const appointmentsWithPets = appointments.map(appointment => ({
            ...appointment,
            pets: getPetsStmt.all(appointment.bookid)
        }));

        // Calculate statistics
        const totalAppointments = appointments.length;
        const upcomingAppointments = appointments.filter(a => 
            new Date(a.servedate) >= new Date() && 
            ['pending', 'confirmed'].includes(a.status)
        ).length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
        const totalSpent = appointments
            .filter(a => a.status === 'completed')
            .reduce((sum, a) => sum + a.price, 0);

        const statistics = {
            totalAppointments,
            upcomingAppointments,
            completedAppointments,
            cancelledAppointments,
            totalSpent
        };

        res.status(200).json({
            message: 'Schedule dashboard retrieved successfully',
            dashboard: {
                appointments: appointmentsWithPets,
                statistics,
                filters: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                    status: status || null,
                    serviceType: serviceType || null
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving pet owner schedule dashboard:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving schedule dashboard'
        });
    }
});

/**
 * Get Pet Owner's Weekly Schedule View
 * GET /api/schedule/weekly
 * Role: Pet Owner only
 */
router.get('/weekly', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (userRole !== 'Pet owner') {
            return res.status(403).json({
                message: 'Access denied. Only pet owners can view weekly schedules.'
            });
        }

        const { weekStart } = req.query;
        
        // Calculate week start and end dates
        let startDate;
        if (weekStart) {
            startDate = new Date(weekStart);
        } else {
            const today = new Date();
            const dayOfWeek = today.getDay();
            startDate = new Date(today);
            startDate.setDate(today.getDate() - dayOfWeek); // Start from Sunday
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End on Saturday

        const getWeeklyAppointmentsStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.servedate,
                b.slot,
                b.status,
                s.serviceid,
                s.name as service_name,
                s.duration,
                s.price,
                st.type as service_type,
                sp.bussiness_name as provider_name
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE b.poid = ? AND b.servedate BETWEEN ? AND ?
            ORDER BY b.servedate ASC, b.slot ASC
        `);

        const weeklyAppointments = getWeeklyAppointmentsStmt.all(
            userId, 
            startDate.toISOString().split('T')[0], 
            endDate.toISOString().split('T')[0]
        );

        // Get pets for each appointment
        const getPetsStmt = db.prepare(`
            SELECT 
                p.petid,
                p.name as pet_name,
                p.breed
            FROM booking_pet bp
            JOIN pet p ON bp.petid = p.petid
            WHERE bp.bookid = ?
        `);

        const appointmentsWithPets = weeklyAppointments.map(appointment => ({
            ...appointment,
            pets: getPetsStmt.all(appointment.bookid)
        }));

        // Group appointments by day
        const weeklySchedule = {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Initialize all days
        days.forEach((day, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);
            const dateStr = date.toISOString().split('T')[0];
            
            weeklySchedule[day] = {
                date: dateStr,
                appointments: []
            };
        });

        // Group appointments by day
        appointmentsWithPets.forEach(appointment => {
            const appointmentDate = new Date(appointment.servedate);
            const dayName = days[appointmentDate.getDay()];
            weeklySchedule[dayName].appointments.push(appointment);
        });

        res.status(200).json({
            message: 'Weekly schedule retrieved successfully',
            weeklySchedule: {
                weekStart: startDate.toISOString().split('T')[0],
                weekEnd: endDate.toISOString().split('T')[0],
                schedule: weeklySchedule,
                totalAppointments: weeklyAppointments.length
            }
        });

    } catch (error) {
        console.error('Error retrieving weekly schedule:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving weekly schedule'
        });
    }
});

/**
 * Get Pet Owner's Today's Schedule
 * GET /api/schedule/today
 * Role: Pet Owner only
 */
router.get('/today', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (userRole !== 'Pet owner') {
            return res.status(403).json({
                message: 'Access denied. Only pet owners can view today\'s schedule.'
            });
        }

        const today = new Date().toISOString().split('T')[0];

        const getTodayAppointmentsStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.slot,
                b.status,
                s.serviceid,
                s.name as service_name,
                s.duration,
                s.price,
                st.type as service_type,
                sp.bussiness_name as provider_name,
                sp.phone as provider_phone,
                sp.address as provider_address
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE b.poid = ? AND b.servedate = ?
            ORDER BY b.slot ASC
        `);

        const todayAppointments = getTodayAppointmentsStmt.all(userId, today);

        // Get pets for each appointment
        const getPetsStmt = db.prepare(`
            SELECT 
                p.petid,
                p.name as pet_name,
                p.breed
            FROM booking_pet bp
            JOIN pet p ON bp.petid = p.petid
            WHERE bp.bookid = ?
        `);

        const appointmentsWithPets = todayAppointments.map(appointment => ({
            ...appointment,
            pets: getPetsStmt.all(appointment.bookid)
        }));

        // Calculate today's statistics
        const todayStats = {
            totalAppointments: todayAppointments.length,
            completedAppointments: todayAppointments.filter(a => a.status === 'completed').length,
            upcomingAppointments: todayAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length,
            cancelledAppointments: todayAppointments.filter(a => a.status === 'cancelled').length
        };

        res.status(200).json({
            message: 'Today\'s schedule retrieved successfully',
            todaySchedule: {
                date: today,
                appointments: appointmentsWithPets,
                statistics: todayStats
            }
        });

    } catch (error) {
        console.error('Error retrieving today\'s schedule:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving today\'s schedule'
        });
    }
});

// =============================================================================
// SERVICE PROVIDER SCHEDULE DASHBOARD ENDPOINTS
// =============================================================================

/**
 * Get Service Provider's Work Schedule Dashboard
 * GET /api/schedule/provider-dashboard
 * Role: Service Provider only
 */
router.get('/provider-dashboard', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (userRole !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can view work schedules.'
            });
        }

        const { startDate, endDate, status, serviceType } = req.query;
        
        let query = `
            SELECT 
                b.bookid,
                b.servedate,
                b.slot,
                b.status,
                b.payment_method,
                b.book_timestamp,
                s.serviceid,
                s.name as service_name,
                s.description as service_description,
                s.duration,
                s.price,
                st.type as service_type,
                u.name as pet_owner_name,
                u.email as pet_owner_email,
                po.phone as pet_owner_phone,
                po.address as pet_owner_address
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ?
        `;

        const params = [userId];

        // Add filters
        if (startDate) {
            query += ' AND b.servedate >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND b.servedate <= ?';
            params.push(endDate);
        }

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (serviceType) {
            query += ' AND st.type LIKE ?';
            params.push(`%${serviceType}%`);
        }

        query += ' ORDER BY b.servedate DESC, b.slot ASC';

        const getWorkScheduleStmt = db.prepare(query);
        const workAppointments = getWorkScheduleStmt.all(...params);

        // Get pets for each appointment
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

        const appointmentsWithPets = workAppointments.map(appointment => ({
            ...appointment,
            pets: getPetsStmt.all(appointment.bookid)
        }));

        // Calculate work statistics
        const totalAppointments = workAppointments.length;
        const upcomingAppointments = workAppointments.filter(a => 
            new Date(a.servedate) >= new Date() && 
            ['pending', 'confirmed'].includes(a.status)
        ).length;
        const completedAppointments = workAppointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = workAppointments.filter(a => a.status === 'cancelled').length;
        const totalRevenue = workAppointments
            .filter(a => a.status === 'completed')
            .reduce((sum, a) => sum + a.price, 0);

        // Service breakdown statistics
        const serviceBreakdown = {};
        workAppointments.forEach(appointment => {
            const serviceType = appointment.service_type;
            if (!serviceBreakdown[serviceType]) {
                serviceBreakdown[serviceType] = {
                    count: 0,
                    revenue: 0
                };
            }
            serviceBreakdown[serviceType].count++;
            if (appointment.status === 'completed') {
                serviceBreakdown[serviceType].revenue += appointment.price;
            }
        });

        const statistics = {
            totalAppointments,
            upcomingAppointments,
            completedAppointments,
            cancelledAppointments,
            totalRevenue,
            serviceBreakdown
        };

        res.status(200).json({
            message: 'Work schedule dashboard retrieved successfully',
            dashboard: {
                workAppointments: appointmentsWithPets,
                statistics,
                filters: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                    status: status || null,
                    serviceType: serviceType || null
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving service provider work dashboard:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving work schedule dashboard'
        });
    }
});

/**
 * Get Service Provider's Monthly Schedule View
 * GET /api/schedule/monthly
 * Role: Service Provider only
 */
router.get('/monthly', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (userRole !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can view monthly work schedules.'
            });
        }

        const { year, month } = req.query;
        
        // Use current month if not specified
        const currentDate = new Date();
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        
        // Calculate month start and end dates
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0); // Last day of the month

        const getMonthlyAppointmentsStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.servedate,
                b.slot,
                b.status,
                s.serviceid,
                s.name as service_name,
                s.duration,
                s.price,
                st.type as service_type,
                u.name as pet_owner_name
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ? AND b.servedate BETWEEN ? AND ?
            ORDER BY b.servedate ASC, b.slot ASC
        `);

        const monthlyAppointments = getMonthlyAppointmentsStmt.all(
            userId, 
            startDate.toISOString().split('T')[0], 
            endDate.toISOString().split('T')[0]
        );

        // Get pets for each appointment
        const getPetsStmt = db.prepare(`
            SELECT 
                p.petid,
                p.name as pet_name,
                p.breed
            FROM booking_pet bp
            JOIN pet p ON bp.petid = p.petid
            WHERE bp.bookid = ?
        `);

        const appointmentsWithPets = monthlyAppointments.map(appointment => ({
            ...appointment,
            pets: getPetsStmt.all(appointment.bookid)
        }));

        // Group appointments by date
        const monthlySchedule = {};
        appointmentsWithPets.forEach(appointment => {
            const date = appointment.servedate;
            if (!monthlySchedule[date]) {
                monthlySchedule[date] = [];
            }
            monthlySchedule[date].push(appointment);
        });

        // Calculate monthly statistics
        const monthlyRevenue = monthlyAppointments
            .filter(a => a.status === 'completed')
            .reduce((sum, a) => sum + a.price, 0);
        
        const completedThisMonth = monthlyAppointments.filter(a => a.status === 'completed').length;

        res.status(200).json({
            message: 'Monthly work schedule retrieved successfully',
            monthlySchedule: {
                year: targetYear,
                month: targetMonth,
                monthName: startDate.toLocaleString('default', { month: 'long' }),
                schedule: monthlySchedule,
                statistics: {
                    totalAppointments: monthlyAppointments.length,
                    completedAppointments: completedThisMonth,
                    monthlyRevenue: monthlyRevenue
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving monthly work schedule:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving monthly work schedule'
        });
    }
});

/**
 * Get Service Provider's Today's Work Schedule
 * GET /api/schedule/provider-today
 * Role: Service Provider only
 */
router.get('/provider-today', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (userRole !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can view today\'s work schedule.'
            });
        }

        const today = new Date().toISOString().split('T')[0];

        const getTodayWorkStmt = db.prepare(`
            SELECT 
                b.bookid,
                b.slot,
                b.status,
                s.serviceid,
                s.name as service_name,
                s.duration,
                s.price,
                st.type as service_type,
                u.name as pet_owner_name,
                po.phone as pet_owner_phone,
                po.address as pet_owner_address
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ? AND b.servedate = ?
            ORDER BY b.slot ASC
        `);

        const todayWork = getTodayWorkStmt.all(userId, today);

        // Get pets for each appointment
        const getPetsStmt = db.prepare(`
            SELECT 
                p.petid,
                p.name as pet_name,
                p.breed
            FROM booking_pet bp
            JOIN pet p ON bp.petid = p.petid
            WHERE bp.bookid = ?
        `);

        const workWithPets = todayWork.map(appointment => ({
            ...appointment,
            pets: getPetsStmt.all(appointment.bookid)
        }));

        // Calculate today's work statistics
        const todayStats = {
            totalAppointments: todayWork.length,
            completedAppointments: todayWork.filter(a => a.status === 'completed').length,
            upcomingAppointments: todayWork.filter(a => ['pending', 'confirmed'].includes(a.status)).length,
            cancelledAppointments: todayWork.filter(a => a.status === 'cancelled').length,
            todayRevenue: todayWork
                .filter(a => a.status === 'completed')
                .reduce((sum, a) => sum + a.price, 0)
        };

        res.status(200).json({
            message: 'Today\'s work schedule retrieved successfully',
            todayWorkSchedule: {
                date: today,
                appointments: workWithPets,
                statistics: todayStats
            }
        });

    } catch (error) {
        console.error('Error retrieving today\'s work schedule:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving today\'s work schedule'
        });
    }
});

// =============================================================================
// GENERAL SCHEDULE MANAGEMENT ENDPOINTS
// =============================================================================

/**
 * Create a general schedule entry
 * POST /api/schedule/create
 * Role: Pet Owner and Service Provider
 */
router.post('/create', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (!['Pet owner', 'Service provider'].includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Only pet owners and service providers can create schedule entries.'
            });
        }

        const { scheduled_time, title, detail } = req.body;

        // Validate required fields
        if (!scheduled_time || !title) {
            return res.status(400).json({
                message: 'Scheduled time and title are required.'
            });
        }

        // Validate date format
        const scheduledDate = new Date(scheduled_time);
        if (isNaN(scheduledDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid scheduled time format.'
            });
        }

        const createScheduleStmt = db.prepare(`
            INSERT INTO schedule (scheduled_time, tittle, detail, userid)
            VALUES (?, ?, ?, ?)
        `);

        const result = createScheduleStmt.run(
            scheduled_time,
            title.trim(),
            detail ? detail.trim() : null,
            userId
        );

        // Get the created schedule entry
        const getScheduleStmt = db.prepare(`
            SELECT 
                scheduleid,
                scheduled_time,
                tittle as title,
                detail,
                userid
            FROM schedule
            WHERE scheduleid = ?
        `);

        const createdSchedule = getScheduleStmt.get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Schedule entry created successfully',
            schedule: createdSchedule
        });

    } catch (error) {
        console.error('Error creating schedule entry:', error);
        res.status(500).json({
            message: 'Internal server error while creating schedule entry'
        });
    }
});

/**
 * Get user's general schedule entries
 * GET /api/schedule/entries
 * Role: Pet Owner and Service Provider
 */
router.get('/entries', authMiddleware, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        
        if (!['Pet owner', 'Service provider'].includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Only pet owners and service providers can view schedule entries.'
            });
        }

        const { startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                scheduleid,
                scheduled_time,
                tittle as title,
                detail
            FROM schedule
            WHERE userid = ?
        `;

        const params = [userId];

        if (startDate) {
            query += ' AND DATE(scheduled_time) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(scheduled_time) <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY scheduled_time ASC';

        const getScheduleEntriesStmt = db.prepare(query);
        const scheduleEntries = getScheduleEntriesStmt.all(...params);

        res.status(200).json({
            message: 'Schedule entries retrieved successfully',
            scheduleEntries: scheduleEntries,
            totalEntries: scheduleEntries.length
        });

    } catch (error) {
        console.error('Error retrieving schedule entries:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving schedule entries'
        });
    }
});

export default router;
