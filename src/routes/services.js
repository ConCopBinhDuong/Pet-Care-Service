import express from 'express'
import db from '../Database_sqlite.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateServiceSubmission, validateServiceApproval, validateApprovedServiceUpdate, validateTimeslotConflicts } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Get all service types
router.get('/types', (req, res) => {
    try {
        const getServiceTypesStmt = db.prepare(`
            SELECT typeid, type
            FROM servicetype
            ORDER BY type ASC
        `);
        
        const serviceTypes = getServiceTypesStmt.all();

        res.status(200).json({
            message: 'Service types retrieved successfully',
            serviceTypes: serviceTypes
        });
    } catch (error) {
        console.error('Error retrieving service types:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving service types' 
        });
    }
});

// Get all services with optional filtering by multiple service types and name search
router.get('/', (req, res) => {
    try {
        const { 
            typeid,           // Single type ID (for backward compatibility)
            typeids,          // Multiple type IDs (comma-separated or array)
            name,             // Service name search
            provider,         // Provider name search
            minPrice,         // Minimum price filter
            maxPrice          // Maximum price filter
        } = req.query;
        
        let query = `
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.typeid,
                st.type as service_type,
                s.providerid,
                sp.bussiness_name as provider_name
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE s.status = 'approved'
        `;
        
        const conditions = [];
        const params = [];
        
        // Handle multiple service type filtering
        if (typeids) {
            let typeIdArray;
            if (Array.isArray(typeids)) {
                typeIdArray = typeids;
            } else {
                // Handle comma-separated string
                typeIdArray = typeids.split(',').map(id => id.trim()).filter(id => id);
            }
            
            if (typeIdArray.length > 0) {
                const placeholders = typeIdArray.map(() => '?').join(',');
                conditions.push(`s.typeid IN (${placeholders})`);
                params.push(...typeIdArray.map(id => parseInt(id)));
            }
        } else if (typeid) {
            // Single type ID for backward compatibility
            conditions.push('s.typeid = ?');
            params.push(parseInt(typeid));
        }
        
        // Handle service name search (case-insensitive partial match)
        if (name && name.trim()) {
            conditions.push('LOWER(s.name) LIKE LOWER(?)');
            params.push(`%${name.trim()}%`);
        }
        
        // Handle provider name search (case-insensitive partial match)
        if (provider && provider.trim()) {
            conditions.push('LOWER(sp.bussiness_name) LIKE LOWER(?)');
            params.push(`%${provider.trim()}%`);
        }
        
        // Handle price range filtering
        if (minPrice && !isNaN(minPrice)) {
            conditions.push('s.price >= ?');
            params.push(parseInt(minPrice));
        }
        
        if (maxPrice && !isNaN(maxPrice)) {
            conditions.push('s.price <= ?');
            params.push(parseInt(maxPrice));
        }
        
        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY s.name ASC';
        
        const getServicesStmt = db.prepare(query);
        const services = getServicesStmt.all(...params);

        res.status(200).json({
            message: 'Services retrieved successfully',
            services: services
        });
    } catch (error) {
        console.error('Error retrieving services:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving services' 
        });
    }
});

// Advanced search endpoint for services (must come before /:serviceid route)
router.get('/search', (req, res) => {
    try {
        const { 
            q,                // General search query (searches in name, description, and service type)
            typeids,          // Multiple type IDs (comma-separated or array)
            minPrice,         // Minimum price filter
            maxPrice,         // Maximum price filter
            provider,         // Provider name search
            duration,         // Duration filter
            sortBy,           // Sort by: name, price, type (default: name)
            sortOrder         // Sort order: asc, desc (default: asc)
        } = req.query;
        
        let query = `
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.typeid,
                st.type as service_type,
                s.providerid,
                sp.bussiness_name as provider_name
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE s.status = 'approved'
        `;
        
        const conditions = [];
        const params = [];
        
        // General search query (searches in multiple fields)
        if (q && q.trim()) {
            const searchTerm = q.trim();
            conditions.push(`(
                LOWER(s.name) LIKE LOWER(?) OR 
                LOWER(s.description) LIKE LOWER(?) OR 
                LOWER(st.type) LIKE LOWER(?) OR
                LOWER(sp.bussiness_name) LIKE LOWER(?)
            )`);
            const searchPattern = `%${searchTerm}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        // Multiple service type filtering
        if (typeids) {
            let typeIdArray;
            if (Array.isArray(typeids)) {
                typeIdArray = typeids;
            } else {
                typeIdArray = typeids.split(',').map(id => id.trim()).filter(id => id);
            }
            
            if (typeIdArray.length > 0) {
                const placeholders = typeIdArray.map(() => '?').join(',');
                conditions.push(`s.typeid IN (${placeholders})`);
                params.push(...typeIdArray.map(id => parseInt(id)));
            }
        }
        
        // Provider name search
        if (provider && provider.trim()) {
            conditions.push('LOWER(sp.bussiness_name) LIKE LOWER(?)');
            params.push(`%${provider.trim()}%`);
        }
        
        // Duration filter
        if (duration && duration.trim()) {
            conditions.push('LOWER(s.duration) LIKE LOWER(?)');
            params.push(`%${duration.trim()}%`);
        }
        
        // Price range filtering
        if (minPrice && !isNaN(minPrice)) {
            conditions.push('s.price >= ?');
            params.push(parseInt(minPrice));
        }
        
        if (maxPrice && !isNaN(maxPrice)) {
            conditions.push('s.price <= ?');
            params.push(parseInt(maxPrice));
        }
        
        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }
        
        // Add sorting
        const validSortFields = ['name', 'price', 'type'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        if (sortField === 'type') {
            query += ` ORDER BY st.type ${order}, s.name ASC`;
        } else if (sortField === 'price') {
            query += ` ORDER BY s.price ${order}, s.name ASC`;
        } else {
            query += ` ORDER BY s.name ${order}`;
        }
        
        const searchServicesStmt = db.prepare(query);
        const services = searchServicesStmt.all(...params);

        res.status(200).json({
            message: 'Service search completed successfully',
            searchQuery: {
                generalSearch: q || null,
                typeids: typeids || null,
                provider: provider || null,
                duration: duration || null,
                priceRange: {
                    min: minPrice || null,
                    max: maxPrice || null
                },
                sortBy: sortField,
                sortOrder: order
            },
            totalResults: services.length,
            services: services
        });
    } catch (error) {
        console.error('Error searching services:', error);
        res.status(500).json({ 
            message: 'Internal server error while searching services' 
        });
    }
});

// =============================================================================
// SERVICE PROVIDER ENDPOINTS - Service Submission and Management
// =============================================================================

/**
 * Submit a new service for approval
 * POST /api/services/submit
 * Role: Service Provider only
 */
router.post('/submit', authMiddleware, validateServiceSubmission, (req, res) => {
    try {
        // Check if user is a service provider
        if (req.user.role !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can submit services.'
            });
        }

        const { name, price, description, duration, typeid, timeSlots } = req.body;
        const providerId = req.user.userid;

        // Verify service provider exists
        const checkProviderStmt = db.prepare(`
            SELECT id FROM serviceprovider WHERE id = ?
        `);
        const provider = checkProviderStmt.get(providerId);
        
        if (!provider) {
            return res.status(404).json({
                message: 'Service provider profile not found. Please complete your profile first.'
            });
        }

        // Verify service type exists
        const checkTypeStmt = db.prepare(`
            SELECT typeid FROM servicetype WHERE typeid = ?
        `);
        const serviceType = checkTypeStmt.get(typeid);
        
        if (!serviceType) {
            return res.status(400).json({
                message: 'Invalid service type ID'
            });
        }

        // Insert the service with pending status
        const insertServiceStmt = db.prepare(`
            INSERT INTO service (name, price, description, duration, typeid, providerid, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `);
        
        const serviceResult = insertServiceStmt.run(
            name.trim(),
            price,
            description.trim(),
            duration.trim(),
            typeid,
            providerId
        );

        // Add time slots if provided
        if (timeSlots && timeSlots.length > 0) {
            const insertTimeSlotStmt = db.prepare(`
                INSERT INTO timeslot (serviceid, slot) VALUES (?, ?)
            `);
            
            timeSlots.forEach(slot => {
                insertTimeSlotStmt.run(serviceResult.lastInsertRowid, slot);
            });
        }

        // Get the created service with type name
        const getServiceStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.status,
                s.submission_date,
                st.type as service_type
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            WHERE s.serviceid = ?
        `);
        
        const createdService = getServiceStmt.get(serviceResult.lastInsertRowid);

        res.status(201).json({
            message: 'Service submitted successfully for review',
            service: {
                ...createdService,
                timeSlots: timeSlots || []
            }
        });

    } catch (error) {
        console.error('Error submitting service:', error);
        res.status(500).json({
            message: 'Internal server error while submitting service'
        });
    }
});

/**
 * Get service provider's submitted services
 * GET /api/services/my-services
 * Role: Service Provider only
 */
router.get('/my-services', authMiddleware, (req, res) => {
    try {
        // Check if user is a service provider
        if (req.user.role !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can view their services.'
            });
        }

        const providerId = req.user.userid;
        const { status } = req.query;

        let query = `
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.status,
                s.submission_date,
                s.review_date,
                s.rejection_reason,
                st.type as service_type,
                CASE 
                    WHEN s.reviewed_by IS NOT NULL THEN u.name 
                    ELSE NULL 
                END as reviewed_by_name
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            LEFT JOIN manager m ON s.reviewed_by = m.id
            LEFT JOIN users u ON m.id = u.userid
            WHERE s.providerid = ?
        `;

        const params = [providerId];

        // Filter by status if provided
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query += ' AND s.status = ?';
            params.push(status);
        }

        query += ' ORDER BY s.submission_date DESC';

        const getServicesStmt = db.prepare(query);
        const services = getServicesStmt.all(...params);

        // Get time slots for each service
        const getTimeSlotsStmt = db.prepare(`
            SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot
        `);

        const servicesWithSlots = services.map(service => ({
            ...service,
            timeSlots: getTimeSlotsStmt.all(service.serviceid).map(ts => ts.slot)
        }));

        // Calculate statistics
        const stats = {
            total: services.length,
            pending: services.filter(s => s.status === 'pending').length,
            approved: services.filter(s => s.status === 'approved').length,
            rejected: services.filter(s => s.status === 'rejected').length
        };

        res.status(200).json({
            message: 'Services retrieved successfully',
            services: servicesWithSlots,
            statistics: stats
        });

    } catch (error) {
        console.error('Error retrieving provider services:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving services'
        });
    }
});

/**
 * Get services pending review
 * GET /api/services/pending-review
 * Role: Manager only
 */
router.get('/pending-review', authMiddleware, (req, res) => {
    try {
        // Check if user is a manager
        if (req.user.role !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can review services.'
            });
        }

        const getPendingServicesStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.status,
                s.submission_date,
                st.type as service_type,
                sp.bussiness_name as provider_name,
                u.name as provider_contact_name,
                u.email as provider_email
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON sp.id = u.userid
            WHERE s.status = 'pending'
            ORDER BY s.submission_date ASC
        `);

        const pendingServices = getPendingServicesStmt.all();

        // Get time slots for each service
        const getTimeSlotsStmt = db.prepare(`
            SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot
        `);

        const servicesWithSlots = pendingServices.map(service => ({
            ...service,
            timeSlots: getTimeSlotsStmt.all(service.serviceid).map(ts => ts.slot)
        }));

        res.status(200).json({
            message: 'Pending services retrieved successfully',
            services: servicesWithSlots,
            count: pendingServices.length
        });

    } catch (error) {
        console.error('Error retrieving pending services:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving pending services'
        });
    }
});

/**
 * Get service review summary dashboard
 * GET /api/services/review-summary
 * Role: Manager only
 */
router.get('/review-summary', authMiddleware, (req, res) => {
    try {
        // Check if user is a manager
        if (req.user.role !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can view review summaries.'
            });
        }

        // Get overall statistics
        const getStatsStmt = db.prepare(`
            SELECT 
                COUNT(*) as total_services,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
            FROM service
        `);

        const stats = getStatsStmt.get();

        // Get recent reviews
        const getRecentReviewsStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.status,
                s.review_date,
                s.rejection_reason,
                sp.bussiness_name as provider_name,
                u.name as reviewer_name
            FROM service s
            JOIN serviceprovider sp ON s.providerid = sp.id
            LEFT JOIN manager m ON s.reviewed_by = m.id
            LEFT JOIN users u ON m.id = u.userid
            WHERE s.status IN ('approved', 'rejected')
            ORDER BY s.review_date DESC
            LIMIT 10
        `);

        const recentReviews = getRecentReviewsStmt.all();

        // Get provider breakdown
        const getProviderBreakdownStmt = db.prepare(`
            SELECT 
                sp.bussiness_name as provider_name,
                COUNT(*) as total_services,
                SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN s.status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN s.status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM service s
            JOIN serviceprovider sp ON s.providerid = sp.id
            GROUP BY s.providerid, sp.bussiness_name
            ORDER BY total_services DESC
        `);

        const providerBreakdown = getProviderBreakdownStmt.all();

        res.status(200).json({
            message: 'Service review summary retrieved successfully',
            summary: {
                statistics: stats,
                recentReviews: recentReviews,
                providerBreakdown: providerBreakdown
            }
        });

    } catch (error) {
        console.error('Error retrieving review summary:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving review summary'
        });
    }
});

// Get service details by ID including available time slots
router.get('/:serviceid', (req, res) => {
    try {
        const { serviceid } = req.params;

        // Get service details
        const getServiceStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.typeid,
                st.type as service_type,
                s.providerid,
                sp.bussiness_name as provider_name
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE s.serviceid = ? AND s.status = 'approved'
        `);

        const service = getServiceStmt.get(serviceid);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found or not approved'
            });
        }

        // Get available time slots for this service
        const getTimeSlotsStmt = db.prepare(`
            SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot
        `);

        const timeSlots = getTimeSlotsStmt.all(serviceid);
        service.timeSlots = timeSlots.map(ts => ts.slot);

        res.status(200).json({
            message: 'Service details retrieved successfully',
            service: service
        });

    } catch (error) {
        console.error('Error retrieving service details:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving service details'
        });
    }
});

/**
 * Update a pending service
 * PUT /api/services/:id/update
 * Role: Service Provider only (can only update their own pending services)
 */
router.put('/:id/update', authMiddleware, validateServiceSubmission, (req, res) => {
    try {
        // Check if user is a service provider
        if (req.user.role !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can update services.'
            });
        }

        const serviceId = parseInt(req.params.id);
        const providerId = req.user.userid;
        const { name, price, description, duration, typeid, timeSlots } = req.body;

        if (isNaN(serviceId)) {
            return res.status(400).json({
                message: 'Invalid service ID'
            });
        }

        // Check if service exists and belongs to this provider
        const checkServiceStmt = db.prepare(`
            SELECT serviceid, status, providerid FROM service 
            WHERE serviceid = ? AND providerid = ?
        `);
        const service = checkServiceStmt.get(serviceId, providerId);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found or you do not have permission to update it'
            });
        }

        // Only allow updates to pending services
        if (service.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot update ${service.status} service. Only pending services can be updated.`
            });
        }

        // Verify service type exists
        const checkTypeStmt = db.prepare(`
            SELECT typeid FROM servicetype WHERE typeid = ?
        `);
        const serviceType = checkTypeStmt.get(typeid);
        
        if (!serviceType) {
            return res.status(400).json({
                message: 'Invalid service type ID'
            });
        }

        // Update the service
        const updateServiceStmt = db.prepare(`
            UPDATE service 
            SET name = ?, price = ?, description = ?, duration = ?, typeid = ?, 
                submission_date = CURRENT_TIMESTAMP
            WHERE serviceid = ? AND providerid = ?
        `);
        
        updateServiceStmt.run(
            name.trim(),
            price,
            description.trim(),
            duration.trim(),
            typeid,
            serviceId,
            providerId
        );

        // Update time slots
        if (timeSlots && timeSlots.length > 0) {
            // Remove existing time slots
            const deleteTimeSlotsStmt = db.prepare(`
                DELETE FROM timeslot WHERE serviceid = ?
            `);
            deleteTimeSlotsStmt.run(serviceId);

            // Add new time slots
            const insertTimeSlotStmt = db.prepare(`
                INSERT INTO timeslot (serviceid, slot) VALUES (?, ?)
            `);
            
            timeSlots.forEach(slot => {
                insertTimeSlotStmt.run(serviceId, slot);
            });
        }

        // Get updated service details
        const getServiceStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.status,
                s.submission_date,
                st.type as service_type
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            WHERE s.serviceid = ?
        `);
        
        const updatedService = getServiceStmt.get(serviceId);

        res.status(200).json({
            message: 'Service updated successfully',
            service: {
                ...updatedService,
                timeSlots: timeSlots || []
            }
        });

    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            message: 'Internal server error while updating service'
        });
    }
});

/**
 * Update an approved service (limited fields only)
 * PUT /api/services/:id/update-approved
 * Role: Service Provider only (can only update their own approved services)
 */
router.put('/:id/update-approved', authMiddleware, validateApprovedServiceUpdate, validateTimeslotConflicts, (req, res) => {
    try {
        // Check if user is a service provider
        if (req.user.role !== 'Service provider') {
            return res.status(403).json({
                message: 'Access denied. Only service providers can update services.'
            });
        }

        const serviceId = parseInt(req.params.id);
        const providerId = req.user.userid;
        const { description, timeSlots } = req.body;

        if (isNaN(serviceId)) {
            return res.status(400).json({
                message: 'Invalid service ID'
            });
        }

        // Check if service exists and belongs to this provider
        const checkServiceStmt = db.prepare(`
            SELECT serviceid, status, providerid, name FROM service 
            WHERE serviceid = ? AND providerid = ?
        `);
        const service = checkServiceStmt.get(serviceId, providerId);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found or you do not have permission to update it'
            });
        }

        // Only allow updates to approved services
        if (service.status !== 'approved') {
            return res.status(400).json({
                message: `Cannot update ${service.status} service with this endpoint. Only approved services can be updated here. Use /update for pending services.`
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        try {
            // Update description if provided
            if (description !== undefined) {
                const updateDescriptionStmt = db.prepare(`
                    UPDATE service 
                    SET description = ?
                    WHERE serviceid = ? AND providerid = ?
                `);
                
                updateDescriptionStmt.run(description.trim(), serviceId, providerId);
            }

            // Update time slots if provided
            if (timeSlots !== undefined && timeSlots.length > 0) {
                // Check for booking conflicts before making any changes
                const existingTimeSlotsStmt = db.prepare(`
                    SELECT slot FROM timeslot WHERE serviceid = ?
                `);
                const existingSlots = existingTimeSlotsStmt.all(serviceId).map(ts => ts.slot);
                
                // Find slots to be removed (existing but not in new list)
                const slotsToRemove = existingSlots.filter(slot => !timeSlots.includes(slot));
                
                if (slotsToRemove.length > 0) {
                    // Check if any of the slots to be removed have active bookings
                    const checkBookingsStmt = db.prepare(`
                        SELECT b.bookid, b.slot, b.servedate, b.status,
                               po.id as petowner_id, u.name as petowner_name, u.email as petowner_email
                        FROM booking b
                        JOIN petowner po ON b.poid = po.id
                        JOIN users u ON po.id = u.userid
                        WHERE b.svid = ? AND b.slot = ? AND b.status NOT IN ('cancelled', 'completed')
                    `);
                    
                    const conflictingBookings = [];
                    slotsToRemove.forEach(slot => {
                        const bookings = checkBookingsStmt.all(serviceId, slot);
                        if (bookings.length > 0) {
                            conflictingBookings.push({
                                slot: slot,
                                bookings: bookings
                            });
                        }
                    });
                    
                    if (conflictingBookings.length > 0) {
                        // Return detailed conflict information
                        db.exec('ROLLBACK');
                        return res.status(409).json({
                            success: false,
                            error: 'Timeslot conflict detected',
                            message: 'Cannot remove timeslots that have active bookings',
                            conflicts: conflictingBookings.map(conflict => ({
                                timeslot: conflict.slot,
                                activeBookings: conflict.bookings.length,
                                bookingDetails: conflict.bookings.map(booking => ({
                                    bookingId: booking.bookid,
                                    serviceDate: booking.servedate,
                                    status: booking.status,
                                    petOwner: {
                                        name: booking.petowner_name,
                                        email: booking.petowner_email
                                    }
                                }))
                            })),
                            suggestions: [
                                "Keep the existing timeslots that have bookings",
                                "Contact customers to reschedule their bookings",
                                "Wait until bookings are completed or cancelled",
                                "Add new timeslots without removing existing ones"
                            ]
                        });
                    }
                }

                // If we reach here, no conflicts - proceed with the update
                
                // Remove timeslots that can be safely removed (no active bookings)
                if (slotsToRemove.length > 0) {
                    const deleteTimeSlotsStmt = db.prepare(`
                        DELETE FROM timeslot WHERE serviceid = ? AND slot = ?
                    `);
                    slotsToRemove.forEach(slot => {
                        deleteTimeSlotsStmt.run(serviceId, slot);
                    });
                }

                // Add new time slots
                const slotsToAdd = timeSlots.filter(slot => !existingSlots.includes(slot));
                if (slotsToAdd.length > 0) {
                    const insertTimeSlotStmt = db.prepare(`
                        INSERT INTO timeslot (serviceid, slot) VALUES (?, ?)
                    `);
                    
                    slotsToAdd.forEach(slot => {
                        insertTimeSlotStmt.run(serviceId, slot);
                    });
                }
            }

            db.exec('COMMIT');

            // Get updated service details
            const getServiceStmt = db.prepare(`
                SELECT 
                    s.serviceid,
                    s.name,
                    s.price,
                    s.description,
                    s.duration,
                    s.status,
                    s.submission_date,
                    s.review_date,
                    st.type as service_type
                FROM service s
                JOIN servicetype st ON s.typeid = st.typeid
                WHERE s.serviceid = ?
            `);
            
            const updatedService = getServiceStmt.get(serviceId);

            // Get updated time slots
            const getTimeSlotsStmt = db.prepare(`
                SELECT slot FROM timeslot WHERE serviceid = ? ORDER BY slot
            `);
            const updatedTimeSlots = getTimeSlotsStmt.all(serviceId).map(ts => ts.slot);

            res.status(200).json({
                message: 'Approved service updated successfully',
                service: {
                    ...updatedService,
                    timeSlots: updatedTimeSlots
                },
                updatedFields: {
                    description: description !== undefined,
                    timeSlots: timeSlots !== undefined
                }
            });

        } catch (updateError) {
            db.exec('ROLLBACK');
            throw updateError;
        }

    } catch (error) {
        console.error('Error updating approved service:', error);
        res.status(500).json({
            message: 'Internal server error while updating approved service'
        });
    }
});

/**
 * Review a service (approve or reject)
 * POST /api/services/:id/review
 * Role: Manager only
 */
router.post('/:id/review', authMiddleware, validateServiceApproval, (req, res) => {
    try {
        // Check if user is a manager
        if (req.user.role !== 'Manager') {
            return res.status(403).json({
                message: 'Access denied. Only managers can review services.'
            });
        }

        const serviceId = parseInt(req.params.id);
        const managerId = req.user.userid;
        const { action, rejectionReason } = req.body;

        if (isNaN(serviceId)) {
            return res.status(400).json({
                message: 'Invalid service ID'
            });
        }

        // Check if service exists and is pending
        const checkServiceStmt = db.prepare(`
            SELECT 
                s.serviceid, 
                s.status, 
                s.name,
                sp.bussiness_name as provider_name,
                u.name as provider_contact_name,
                u.email as provider_email
            FROM service s
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON sp.id = u.userid
            WHERE s.serviceid = ?
        `);
        const service = checkServiceStmt.get(serviceId);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }

        if (service.status !== 'pending') {
            return res.status(400).json({
                message: `Service has already been ${service.status}. Only pending services can be reviewed.`
            });
        }

        // Verify manager exists
        const checkManagerStmt = db.prepare(`
            SELECT id FROM manager WHERE id = ?
        `);
        const manager = checkManagerStmt.get(managerId);
        
        if (!manager) {
            return res.status(404).json({
                message: 'Manager profile not found'
            });
        }

        const newStatus = action.toLowerCase() === 'approve' ? 'approved' : 'rejected';
        
        // Update service status
        const updateServiceStmt = db.prepare(`
            UPDATE service 
            SET status = ?, review_date = CURRENT_TIMESTAMP, reviewed_by = ?, rejection_reason = ?
            WHERE serviceid = ?
        `);
        
        updateServiceStmt.run(
            newStatus,
            managerId,
            newStatus === 'rejected' ? rejectionReason.trim() : null,
            serviceId
        );

        // Get updated service details
        const getServiceStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                s.status,
                s.submission_date,
                s.review_date,
                s.rejection_reason,
                st.type as service_type,
                sp.bussiness_name as provider_name,
                u.name as reviewer_name
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            LEFT JOIN manager m ON s.reviewed_by = m.id
            LEFT JOIN users u ON m.id = u.userid
            WHERE s.serviceid = ?
        `);
        
        const reviewedService = getServiceStmt.get(serviceId);

        res.status(200).json({
            message: `Service ${newStatus} successfully`,
            service: reviewedService,
            action: newStatus,
            reviewedBy: req.user.email,
            reviewDate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error reviewing service:', error);
        res.status(500).json({
            message: 'Internal server error while reviewing service'
        });
    }
});

export default router;
