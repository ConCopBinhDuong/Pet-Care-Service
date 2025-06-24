import express from 'express'
import db from '../db.js'
import { validateReportCreation, validateReportUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all reports for the authenticated pet owner (their reports)
router.get('/my-reports', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can view their reports.' 
            });
        }

        const reports = await db.all(`
            SELECT 
                sr.bookid, sr.text, sr.image,
                b.servedate, b.status as booking_status, b.book_timestamp,
                s.name as service_name, s.description as service_description,
                sp.business_name as provider_name,
                u.name as provider_contact_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON sp.id = u.userid
            WHERE b.poid = ?
            ORDER BY b.servedate DESC
        `, [userId]);

        res.status(200).json({
            message: 'Your reports retrieved successfully',
            reports: reports
        });

    } catch (err) {
        console.error('Get my reports error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all reports for a specific service (for service providers to see their reports)
router.get('/service/:serviceId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const serviceId = parseInt(req.params.serviceId);

        if (isNaN(serviceId)) {
            return res.status(400).json({ message: 'Invalid service ID' });
        }

        // Check if service exists and get provider info
        const service = await db.get(`
            SELECT s.serviceid, s.name, s.providerid, sp.business_name
            FROM service s
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE s.serviceid = ?
        `, [serviceId]);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Only service providers can view reports for their own services, or managers
        if (userRole === 'Service provider' && service.providerid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view reports for your own services.' 
            });
        } else if (userRole === 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Pet owners cannot view service reports.' 
            });
        }

        const reports = await db.all(`
            SELECT 
                sr.bookid, sr.text, sr.image,
                b.servedate, b.book_timestamp, b.status as booking_status,
                po.id as reporter_id,
                u.name as reporter_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE b.svid = ?
            ORDER BY b.servedate DESC
        `, [serviceId]);

        res.status(200).json({
            message: 'Service reports retrieved successfully',
            service: {
                id: service.serviceid,
                name: service.name,
                provider: service.business_name
            },
            statistics: {
                totalReports: reports.length
            },
            reports: reports
        });

    } catch (err) {
        console.error('Get service reports error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get reports for a specific service provider (all their services)
router.get('/provider/:providerId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const providerId = parseInt(req.params.providerId);

        if (isNaN(providerId)) {
            return res.status(400).json({ message: 'Invalid provider ID' });
        }

        // Check if provider exists
        const provider = await db.get(`
            SELECT sp.id, sp.business_name, u.name
            FROM serviceprovider sp
            JOIN users u ON sp.id = u.userid
            WHERE sp.id = ?
        `, [providerId]);

        if (!provider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }

        // Only service providers can view their own reports, or managers
        if (userRole === 'Service provider' && providerId !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own reports.' 
            });
        } else if (userRole === 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Pet owners cannot view provider reports.' 
            });
        }

        const reports = await db.all(`
            SELECT 
                sr.bookid, sr.text, sr.image,
                b.servedate, b.book_timestamp, b.status as booking_status,
                s.serviceid, s.name as service_name,
                po.id as reporter_id,
                u.name as reporter_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ?
            ORDER BY b.servedate DESC
        `, [providerId]);

        // Group by service
        const serviceStats = {};
        reports.forEach(report => {
            if (!serviceStats[report.serviceid]) {
                serviceStats[report.serviceid] = {
                    serviceName: report.service_name,
                    reportCount: 0
                };
            }
            serviceStats[report.serviceid].reportCount++;
        });

        const serviceBreakdown = Object.keys(serviceStats).map(serviceId => ({
            serviceId: parseInt(serviceId),
            serviceName: serviceStats[serviceId].serviceName,
            reportCount: serviceStats[serviceId].reportCount
        }));

        res.status(200).json({
            message: 'Provider reports retrieved successfully',
            provider: {
                id: provider.id,
                businessName: provider.business_name,
                contactName: provider.name
            },
            statistics: {
                totalReports: reports.length,
                serviceBreakdown: serviceBreakdown
            },
            reports: reports
        });

    } catch (err) {
        console.error('Get provider reports error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new report for a booking
router.post('/booking/:bookingId', validateReportCreation, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);
        const { text, image } = req.body;

        // Only pet owners can create reports
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can create service reports.' 
            });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        // Check if booking exists and belongs to the user
        const booking = await db.get(`
            SELECT b.bookid, b.poid, b.status, b.servedate, s.name as service_name
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            WHERE b.bookid = ?
        `, [bookingId]);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only report issues for your own bookings.' 
            });
        }

        // Check if booking has occurred (service date has passed or is today)
        const currentDate = new Date().toISOString().split('T')[0];
        if (booking.servedate && booking.servedate > currentDate) {
            return res.status(400).json({ 
                message: 'You can only report issues for services that have already occurred.' 
            });
        }

        // Check if report already exists
        const existingReport = await db.get(`
            SELECT bookid FROM service_report WHERE bookid = ?
        `, [bookingId]);

        if (existingReport) {
            return res.status(409).json({ 
                message: 'Report already exists for this booking. Use PUT to update it.' 
            });
        }

        // Start transaction
        const connection = await db.beginTransaction();
        try {
            // Insert new report
            await connection.execute(`
                INSERT INTO service_report (bookid, text, image)
                VALUES (?, ?, ?)
            `, [bookingId, text, image || null]);

            await connection.commit();

            res.status(201).json({
                message: 'Service report created successfully',
                report: {
                    bookingId: bookingId,
                    serviceName: booking.service_name,
                    text: text,
                    image: image,
                    serviceDate: booking.servedate
                }
            });

        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        }

    } catch (err) {
        console.error('Create report error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update an existing report
router.put('/booking/:bookingId', validateReportUpdate, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);
        const { text, image } = req.body;

        // Only pet owners can update reports
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update service reports.' 
            });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        // Check if report exists and belongs to the user
        const report = await db.get(`
            SELECT sr.bookid, sr.text, sr.image, b.poid, s.name as service_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            WHERE sr.bookid = ?
        `, [bookingId]);

        if (!report) {
            return res.status(404).json({ message: 'Service report not found' });
        }

        if (report.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update your own service reports.' 
            });
        }

        // Start transaction
        const connection = await db.beginTransaction();
        try {
            // Update report
            await connection.execute(`
                UPDATE service_report 
                SET text = ?, image = ?
                WHERE bookid = ?
            `, [text, image || null, bookingId]);

            await connection.commit();

            res.status(200).json({
                message: 'Service report updated successfully',
                report: {
                    bookingId: bookingId,
                    serviceName: report.service_name,
                    text: text,
                    image: image,
                    previousText: report.text
                }
            });

        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        }

    } catch (err) {
        console.error('Update report error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a report
router.delete('/booking/:bookingId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);

        // Only pet owners can delete reports
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can delete service reports.' 
            });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        // Check if report exists and belongs to the user
        const report = await db.get(`
            SELECT sr.bookid, sr.text, sr.image, b.poid, s.name as service_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            WHERE sr.bookid = ?
        `, [bookingId]);

        if (!report) {
            return res.status(404).json({ message: 'Service report not found' });
        }

        if (report.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only delete your own service reports.' 
            });
        }

        // Start transaction
        const connection = await db.beginTransaction();
        try {
            // Delete report
            const result = await connection.execute(`
                DELETE FROM service_report WHERE bookid = ?
            `, [bookingId]);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Service report not found or already deleted' });
            }

            await connection.commit();

            res.status(200).json({
                message: 'Service report deleted successfully',
                deletedReport: {
                    bookingId: bookingId,
                    serviceName: report.service_name,
                    text: report.text,
                    image: report.image
                }
            });

        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        }

    } catch (err) {
        console.error('Delete report error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific report by booking ID
router.get('/booking/:bookingId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        const report = await db.get(`
            SELECT 
                sr.bookid, sr.text, sr.image,
                b.poid, b.servedate, b.book_timestamp, b.status,
                s.serviceid, s.name as service_name, s.description as service_description,
                sp.id as provider_id, sp.business_name as provider_name,
                u_reporter.name as reporter_name,
                u_provider.name as provider_contact_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u_reporter ON b.poid = u_reporter.userid
            JOIN users u_provider ON sp.id = u_provider.userid
            WHERE sr.bookid = ?
        `, [bookingId]);

        if (!report) {
            return res.status(404).json({ message: 'Service report not found' });
        }

        // Check access permissions
        if (userRole === 'Pet owner' && report.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own service reports.' 
            });
        }

        if (userRole === 'Service provider' && report.provider_id !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view reports for your services.' 
            });
        }

        res.status(200).json({
            message: 'Service report retrieved successfully',
            report: {
                bookingId: report.bookid,
                text: report.text,
                image: report.image,
                serviceDate: report.servedate,
                bookingDate: report.book_timestamp,
                bookingStatus: report.status,
                service: {
                    id: report.serviceid,
                    name: report.service_name,
                    description: report.service_description
                },
                provider: {
                    id: report.provider_id,
                    businessName: report.provider_name,
                    contactName: report.provider_contact_name
                },
                reporter: {
                    name: report.reporter_name
                }
            }
        });

    } catch (err) {
        console.error('Get report error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get reports summary for managers (admin endpoint)
router.get('/admin/summary', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only managers can access this endpoint
        if (userRole !== 'Manager') {
            return res.status(403).json({ 
                message: 'Access denied. Only managers can view reports summary.' 
            });
        }

        // Get total reports count
        const totalReports = await db.get(`
            SELECT COUNT(*) as total_reports FROM service_report
        `);

        // Get reports by service provider
        const reportsByProvider = await db.all(`
            SELECT 
                sp.id, sp.business_name,
                COUNT(*) as report_count
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            GROUP BY sp.id, sp.business_name
            ORDER BY report_count DESC
        `);

        // Get recent reports
        const recentReports = await db.all(`
            SELECT 
                sr.bookid, sr.text,
                b.servedate,
                s.name as service_name,
                sp.business_name as provider_name,
                u.name as reporter_name
            FROM service_report sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON b.poid = u.userid
            ORDER BY b.servedate DESC
            LIMIT 10
        `);

        res.status(200).json({
            message: 'Reports summary retrieved successfully',
            summary: {
                totalReports: totalReports.total_reports,
                providerBreakdown: reportsByProvider,
                recentReports: recentReports
            }
        });

    } catch (err) {
        console.error('Get reports summary error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
