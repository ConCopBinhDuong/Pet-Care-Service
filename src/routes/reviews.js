import express from 'express'
import db from '../Database_sqlite.js'
import { validateReviewCreation, validateReviewUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all reviews for the authenticated pet owner (their reviews)
router.get('/my-reviews', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can view their reviews.' 
            });
        }

        const getMyReviewsStmt = db.prepare(`
            SELECT 
                sr.bookid, sr.stars, sr.comment,
                b.servedate, b.status as booking_status,
                s.name as service_name, s.description as service_description,
                sp.bussiness_name as provider_name,
                u.name as provider_contact_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u ON sp.id = u.userid
            WHERE b.poid = ?
            ORDER BY b.servedate DESC
        `);
        
        const reviews = getMyReviewsStmt.all(userId);

        res.status(200).json({
            message: 'Your reviews retrieved successfully',
            reviews: reviews
        });

    } catch (err) {
        console.error('Get my reviews error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all reviews for a specific service (for service providers to see their reviews)
router.get('/service/:serviceId', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const serviceId = parseInt(req.params.serviceId);

        if (isNaN(serviceId)) {
            return res.status(400).json({ message: 'Invalid service ID' });
        }

        // Check if service exists and get provider info
        const getServiceStmt = db.prepare(`
            SELECT s.serviceid, s.name, s.providerid, sp.bussiness_name
            FROM service s
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE s.serviceid = ?
        `);
        const service = getServiceStmt.get(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // If user is a service provider, they can only view reviews for their own services
        if (userRole === 'Service provider' && service.providerid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view reviews for your own services.' 
            });
        }

        const getServiceReviewsStmt = db.prepare(`
            SELECT 
                sr.bookid, sr.stars, sr.comment,
                b.servedate, b.book_timestamp,
                po.id as reviewer_id,
                u.name as reviewer_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE b.svid = ?
            ORDER BY b.servedate DESC
        `);
        
        const reviews = getServiceReviewsStmt.all(serviceId);

        // Calculate average rating
        const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length 
            : 0;

        res.status(200).json({
            message: 'Service reviews retrieved successfully',
            service: {
                id: service.serviceid,
                name: service.name,
                provider: service.bussiness_name
            },
            statistics: {
                totalReviews: reviews.length,
                averageRating: Math.round(avgRating * 10) / 10
            },
            reviews: reviews
        });

    } catch (err) {
        console.error('Get service reviews error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get reviews for a specific service provider (all their services)
router.get('/provider/:providerId', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const providerId = parseInt(req.params.providerId);

        if (isNaN(providerId)) {
            return res.status(400).json({ message: 'Invalid provider ID' });
        }

        // Check if provider exists
        const getProviderStmt = db.prepare(`
            SELECT sp.id, sp.bussiness_name, u.name
            FROM serviceprovider sp
            JOIN users u ON sp.id = u.userid
            WHERE sp.id = ?
        `);
        const provider = getProviderStmt.get(providerId);

        if (!provider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }

        // If user is a service provider, they can only view their own reviews
        if (userRole === 'Service provider' && providerId !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own reviews.' 
            });
        }

        const getProviderReviewsStmt = db.prepare(`
            SELECT 
                sr.bookid, sr.stars, sr.comment,
                b.servedate, b.book_timestamp,
                s.serviceid, s.name as service_name,
                po.id as reviewer_id,
                u.name as reviewer_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN petowner po ON b.poid = po.id
            JOIN users u ON po.id = u.userid
            WHERE s.providerid = ?
            ORDER BY b.servedate DESC
        `);
        
        const reviews = getProviderReviewsStmt.all(providerId);

        // Calculate statistics
        const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length 
            : 0;

        // Group by service
        const serviceStats = {};
        reviews.forEach(review => {
            if (!serviceStats[review.serviceid]) {
                serviceStats[review.serviceid] = {
                    serviceName: review.service_name,
                    reviewCount: 0,
                    totalStars: 0
                };
            }
            serviceStats[review.serviceid].reviewCount++;
            serviceStats[review.serviceid].totalStars += review.stars;
        });

        const serviceBreakdown = Object.keys(serviceStats).map(serviceId => ({
            serviceId: parseInt(serviceId),
            serviceName: serviceStats[serviceId].serviceName,
            reviewCount: serviceStats[serviceId].reviewCount,
            averageRating: Math.round((serviceStats[serviceId].totalStars / serviceStats[serviceId].reviewCount) * 10) / 10
        }));

        res.status(200).json({
            message: 'Provider reviews retrieved successfully',
            provider: {
                id: provider.id,
                businessName: provider.bussiness_name,
                contactName: provider.name
            },
            statistics: {
                totalReviews: reviews.length,
                averageRating: Math.round(avgRating * 10) / 10,
                serviceBreakdown: serviceBreakdown
            },
            reviews: reviews
        });

    } catch (err) {
        console.error('Get provider reviews error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new review for a completed booking
router.post('/booking/:bookingId', validateReviewCreation, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);
        const { stars, comment } = req.body;

        // Only pet owners can create reviews
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can create reviews.' 
            });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        // Check if booking exists and belongs to the user
        const getBookingStmt = db.prepare(`
            SELECT b.bookid, b.poid, b.status, b.servedate, s.name as service_name
            FROM booking b
            JOIN service s ON b.svid = s.serviceid
            WHERE b.bookid = ?
        `);
        const booking = getBookingStmt.get(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only review your own bookings.' 
            });
        }

        // Check if booking is completed (you might want to adjust this based on your status values)
        if (booking.status !== 'completed' && booking.status !== 'finished') {
            return res.status(400).json({ 
                message: 'You can only review completed bookings.' 
            });
        }

        // Check if review already exists
        const checkExistingReviewStmt = db.prepare(`
            SELECT bookid FROM service_review WHERE bookid = ?
        `);
        const existingReview = checkExistingReviewStmt.get(bookingId);

        if (existingReview) {
            return res.status(409).json({ 
                message: 'Review already exists for this booking. Use PUT to update it.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Insert new review
        const insertReviewStmt = db.prepare(`
            INSERT INTO service_review (bookid, stars, comment)
            VALUES (?, ?, ?)
        `);

        insertReviewStmt.run(bookingId, stars, comment || null);

        db.exec('COMMIT');

        res.status(201).json({
            message: 'Review created successfully',
            review: {
                bookingId: bookingId,
                serviceName: booking.service_name,
                stars: stars,
                comment: comment,
                serviceDate: booking.servedate
            }
        });

    } catch (err) {
        console.error('Create review error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update an existing review
router.put('/booking/:bookingId', validateReviewUpdate, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);
        const { stars, comment } = req.body;

        // Only pet owners can update reviews
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update reviews.' 
            });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        // Check if review exists and belongs to the user
        const getReviewStmt = db.prepare(`
            SELECT sr.bookid, sr.stars, sr.comment, b.poid, s.name as service_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            WHERE sr.bookid = ?
        `);
        const review = getReviewStmt.get(bookingId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update your own reviews.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Update review
        const updateReviewStmt = db.prepare(`
            UPDATE service_review 
            SET stars = ?, comment = ?
            WHERE bookid = ?
        `);

        updateReviewStmt.run(stars, comment || null, bookingId);

        db.exec('COMMIT');

        res.status(200).json({
            message: 'Review updated successfully',
            review: {
                bookingId: bookingId,
                serviceName: review.service_name,
                stars: stars,
                comment: comment,
                previousRating: review.stars
            }
        });

    } catch (err) {
        console.error('Update review error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a review
router.delete('/booking/:bookingId', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);

        // Only pet owners can delete reviews
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can delete reviews.' 
            });
        }

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        // Check if review exists and belongs to the user
        const getReviewStmt = db.prepare(`
            SELECT sr.bookid, sr.stars, sr.comment, b.poid, s.name as service_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            WHERE sr.bookid = ?
        `);
        const review = getReviewStmt.get(bookingId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only delete your own reviews.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Delete review
        const deleteReviewStmt = db.prepare(`
            DELETE FROM service_review WHERE bookid = ?
        `);

        const result = deleteReviewStmt.run(bookingId);

        if (result.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Review not found or already deleted' });
        }

        db.exec('COMMIT');

        res.status(200).json({
            message: 'Review deleted successfully',
            deletedReview: {
                bookingId: bookingId,
                serviceName: review.service_name,
                stars: review.stars,
                comment: review.comment
            }
        });

    } catch (err) {
        console.error('Delete review error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific review by booking ID
router.get('/booking/:bookingId', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const bookingId = parseInt(req.params.bookingId);

        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        const getReviewStmt = db.prepare(`
            SELECT 
                sr.bookid, sr.stars, sr.comment,
                b.poid, b.servedate, b.book_timestamp, b.status,
                s.serviceid, s.name as service_name, s.description as service_description,
                sp.id as provider_id, sp.bussiness_name as provider_name,
                u_reviewer.name as reviewer_name,
                u_provider.name as provider_contact_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN serviceprovider sp ON s.providerid = sp.id
            JOIN users u_reviewer ON b.poid = u_reviewer.userid
            JOIN users u_provider ON sp.id = u_provider.userid
            WHERE sr.bookid = ?
        `);
        
        const review = getReviewStmt.get(bookingId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check access permissions
        if (userRole === 'Pet owner' && review.poid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own reviews.' 
            });
        }

        if (userRole === 'Service provider' && review.provider_id !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view reviews for your services.' 
            });
        }

        res.status(200).json({
            message: 'Review retrieved successfully',
            review: {
                bookingId: review.bookid,
                stars: review.stars,
                comment: review.comment,
                serviceDate: review.servedate,
                bookingDate: review.book_timestamp,
                bookingStatus: review.status,
                service: {
                    id: review.serviceid,
                    name: review.service_name,
                    description: review.service_description
                },
                provider: {
                    id: review.provider_id,
                    businessName: review.provider_name,
                    contactName: review.provider_contact_name
                },
                reviewer: {
                    name: review.reviewer_name
                }
            }
        });

    } catch (err) {
        console.error('Get review error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
