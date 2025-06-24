import express from 'express'
import db from '../Database_sqlite.js'
import { validateProfileUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get current user profile (protected route)
// Note: authMiddleware is applied at the router level in server.js
router.get('/', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Get basic user info
        const getUserStmt = db.prepare(`SELECT userid, name, email, gender, role FROM users WHERE userid = ?`);
        const user = getUserStmt.get(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileData = {
            id: user.userid,
            name: user.name,
            email: user.email,
            gender: user.gender,
            role: user.role
        };

        // Fetch role-specific data
        if (userRole === 'Pet owner') {
            const getPetOwnerStmt = db.prepare(`SELECT phone, city, address FROM petowner WHERE id = ?`);
            const petOwnerData = getPetOwnerStmt.get(userId);
            
            if (petOwnerData) {
                profileData.phone = petOwnerData.phone;
                profileData.city = petOwnerData.city;
                profileData.address = petOwnerData.address;
            }

        } else if (userRole === 'Service provider') {
            const getServiceProviderStmt = db.prepare(`
                SELECT business_name, logo, phone, description, address, website 
                FROM serviceprovider WHERE id = ?
            `);
            const serviceProviderData = getServiceProviderStmt.get(userId);
            
            if (serviceProviderData) {
                profileData.businessName = serviceProviderData.business_name;
                profileData.logo = serviceProviderData.logo;
                profileData.phone = serviceProviderData.phone;
                profileData.description = serviceProviderData.description;
                profileData.address = serviceProviderData.address;
                profileData.website = serviceProviderData.website;
            }

        } else if (userRole === 'Manager') {
            // Manager profile might just be basic user info for now
            // Could add manager-specific fields later if needed
        }

        res.status(200).json({ 
            message: 'Profile retrieved successfully',
            profile: profileData
        });

    } catch (err) {
        console.error('Profile fetch error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Get service provider profile by ID (accessible by pet owners and managers)
 * GET /api/profile/provider/:providerId
 * Role: Pet owner, Manager (Service providers can only view their own profile via the main route)
 */
router.get('/provider/:providerId', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const providerId = parseInt(req.params.providerId);

        if (isNaN(providerId)) {
            return res.status(400).json({ message: 'Invalid provider ID' });
        }

        // Only pet owners and managers can view service provider profiles
        if (userRole !== 'Pet owner' && userRole !== 'Manager') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners and managers can view service provider profiles.' 
            });
        }

        // Get service provider profile information
        const getProviderProfileStmt = db.prepare(`
            SELECT 
                u.userid,
                u.name,
                u.email,
                u.gender,
                u.role,
                u.created_at,
                sp.business_name,
                sp.logo,
                sp.phone,
                sp.description,
                sp.address,
                sp.website
            FROM users u
            JOIN serviceprovider sp ON u.userid = sp.id
            WHERE u.userid = ? AND u.role = 'Service provider'
        `);

        const providerProfile = getProviderProfileStmt.get(providerId);

        if (!providerProfile) {
            return res.status(404).json({ message: 'Service provider not found' });
        }

        // Get service statistics for this provider
        const getServiceStatsStmt = db.prepare(`
            SELECT 
                COUNT(*) as total_services,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_services,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_services,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_services
            FROM service 
            WHERE providerid = ?
        `);

        const serviceStats = getServiceStatsStmt.get(providerId);

        // Get average rating from reviews
        const getAverageRatingStmt = db.prepare(`
            SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(CAST(sr.stars AS REAL)), 2) as average_rating
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            WHERE s.providerid = ?
        `);

        const ratingInfo = getAverageRatingStmt.get(providerId);

        // Get recent reviews (last 5)
        const getRecentReviewsStmt = db.prepare(`
            SELECT 
                sr.stars,
                sr.comment,
                b.servedate,
                s.name as service_name,
                u.name as reviewer_name
            FROM service_review sr
            JOIN booking b ON sr.bookid = b.bookid
            JOIN service s ON b.svid = s.serviceid
            JOIN users u ON b.poid = u.userid
            WHERE s.providerid = ?
            ORDER BY b.servedate DESC
            LIMIT 5
        `);

        const recentReviews = getRecentReviewsStmt.all(providerId);

        // Get approved services offered by this provider
        const getServicesStmt = db.prepare(`
            SELECT 
                s.serviceid,
                s.name,
                s.price,
                s.description,
                s.duration,
                st.type as service_type
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            WHERE s.providerid = ? AND s.status = 'approved'
            ORDER BY s.name
        `);

        const services = getServicesStmt.all(providerId);

        // Format the response
        const profileData = {
            id: providerProfile.userid,
            name: providerProfile.name,
            email: providerProfile.email,
            gender: providerProfile.gender,
            role: providerProfile.role,
            joinedDate: providerProfile.created_at,
            businessName: providerProfile.business_name,
            logo: providerProfile.logo,
            phone: providerProfile.phone,
            description: providerProfile.description,
            address: providerProfile.address,
            website: providerProfile.website,
            statistics: {
                totalServices: serviceStats.total_services || 0,
                approvedServices: serviceStats.approved_services || 0,
                pendingServices: serviceStats.pending_services || 0,
                rejectedServices: serviceStats.rejected_services || 0,
                totalReviews: ratingInfo.total_reviews || 0,
                averageRating: ratingInfo.average_rating || 0
            },
            services: services,
            recentReviews: recentReviews
        };

        res.status(200).json({
            message: 'Service provider profile retrieved successfully',
            profile: profileData,
            viewedBy: {
                userId: userId,
                role: userRole
            }
        });

    } catch (err) {
        console.error('Provider profile fetch error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Get all service providers (accessible by pet owners and managers)
 * GET /api/profile/providers
 * Role: Pet owner, Manager
 */
router.get('/providers', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners and managers can view service provider list
        if (userRole !== 'Pet owner' && userRole !== 'Manager') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners and managers can view service provider list.' 
            });
        }

        const { 
            search,           // Search in business name or contact name
            city,            // Filter by city/address
            serviceType,     // Filter by service type offered
            minRating,       // Minimum average rating
            hasServices      // Show only providers with approved services
        } = req.query;

        let query = `
            SELECT DISTINCT
                u.userid,
                u.name,
                u.created_at,
                sp.business_name,
                sp.phone,
                sp.description,
                sp.address,
                sp.website,
                COUNT(DISTINCT s.serviceid) as service_count,
                COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.serviceid END) as approved_service_count,
                COUNT(DISTINCT sr.bookid) as total_reviews,
                ROUND(AVG(CAST(sr.stars AS REAL)), 2) as average_rating
            FROM users u
            JOIN serviceprovider sp ON u.userid = sp.id
            LEFT JOIN service s ON sp.id = s.providerid
            LEFT JOIN booking b ON s.serviceid = b.svid
            LEFT JOIN service_review sr ON b.bookid = sr.bookid
            WHERE u.role = 'Service provider'
        `;

        const params = [];
        const conditions = [];

        // Search filter
        if (search && search.trim()) {
            conditions.push(`(
                LOWER(sp.business_name) LIKE LOWER(?) OR 
                LOWER(u.name) LIKE LOWER(?) OR 
                LOWER(sp.description) LIKE LOWER(?)
            )`);
            const searchPattern = `%${search.trim()}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // City filter
        if (city && city.trim()) {
            conditions.push('LOWER(sp.address) LIKE LOWER(?)');
            params.push(`%${city.trim()}%`);
        }

        // Service type filter
        if (serviceType && serviceType.trim()) {
            query += ` JOIN servicetype st ON s.typeid = st.typeid`;
            conditions.push('LOWER(st.type) LIKE LOWER(?)');
            params.push(`%${serviceType.trim()}%`);
        }

        // Add conditions to query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += `
            GROUP BY u.userid, u.name, u.created_at, sp.business_name, sp.phone, sp.description, sp.address, sp.website
        `;

        // Filter by minimum rating
        if (minRating && !isNaN(minRating)) {
            query += ` HAVING average_rating >= ?`;
            params.push(parseFloat(minRating));
        }

        // Filter by has services
        if (hasServices === 'true') {
            query += ` ${minRating && !isNaN(minRating) ? 'AND' : 'HAVING'} approved_service_count > 0`;
        }

        query += ` ORDER BY average_rating DESC, approved_service_count DESC, sp.business_name ASC`;

        const getProvidersStmt = db.prepare(query);
        const providers = getProvidersStmt.all(...params);

        res.status(200).json({
            message: 'Service providers retrieved successfully',
            providers: providers,
            totalCount: providers.length,
            filters: {
                search: search || null,
                city: city || null,
                serviceType: serviceType || null,
                minRating: minRating || null,
                hasServices: hasServices || null
            },
            viewedBy: {
                userId: userId,
                role: userRole
            }
        });

    } catch (err) {
        console.error('Providers list fetch error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user profile (protected route)
router.put('/', validateProfileUpdate, (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const updates = req.body;

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Update basic user info if provided
        const allowedUserFields = ['name', 'gender'];
        const userUpdates = {};
        
        allowedUserFields.forEach(field => {
            if (updates[field] !== undefined) {
                userUpdates[field] = updates[field];
            }
        });

        if (Object.keys(userUpdates).length > 0) {
            const setClause = Object.keys(userUpdates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(userUpdates);
            
            const updateUserStmt = db.prepare(`UPDATE users SET ${setClause} WHERE userid = ?`);
            updateUserStmt.run(...values, userId);
        }

        // Update role-specific data
        if (userRole === 'Pet owner') {
            const allowedPetOwnerFields = ['phone', 'city', 'address'];
            const petOwnerUpdates = {};
            
            allowedPetOwnerFields.forEach(field => {
                if (updates[field] !== undefined) {
                    petOwnerUpdates[field] = updates[field];
                }
            });

            if (Object.keys(petOwnerUpdates).length > 0) {
                const setClause = Object.keys(petOwnerUpdates).map(key => `${key} = ?`).join(', ');
                const values = Object.values(petOwnerUpdates);
                
                const updatePetOwnerStmt = db.prepare(`UPDATE petowner SET ${setClause} WHERE id = ?`);
                updatePetOwnerStmt.run(...values, userId);
            }

        } else if (userRole === 'Service provider') {
            const allowedProviderFields = ['business_name', 'logo', 'phone', 'description', 'address', 'website'];
            const providerUpdates = {};
            
            allowedProviderFields.forEach(field => {
                if (updates[field] !== undefined) {
                    providerUpdates[field] = updates[field];
                }
            });

            if (Object.keys(providerUpdates).length > 0) {
                const setClause = Object.keys(providerUpdates).map(key => `${key} = ?`).join(', ');
                const values = Object.values(providerUpdates);
                
                const updateProviderStmt = db.prepare(`UPDATE serviceprovider SET ${setClause} WHERE id = ?`);
                updateProviderStmt.run(...values, userId);
            }
        }

        db.exec('COMMIT');

        res.status(200).json({ 
            message: 'Profile updated successfully'
        });

    } catch (err) {
        console.error('Profile update error:', err.message);
        db.exec('ROLLBACK');
        
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Phone number or email already in use' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete user account (protected route)
router.delete('/', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // First check if user exists
        const getUserStmt = db.prepare(`SELECT userid, name, email, role FROM users WHERE userid = ?`);
        const user = getUserStmt.get(userId);

        if (!user) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user - CASCADE DELETE will automatically remove related records
        const deleteUserStmt = db.prepare(`DELETE FROM users WHERE userid = ?`);
        const result = deleteUserStmt.run(userId);

        if (result.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'User not found or already deleted' });
        }

        db.exec('COMMIT');

        console.log(`User account deleted: ${user.email} (${user.role})`);

        res.status(200).json({ 
            message: 'Account deleted successfully',
            deletedUser: {
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Account deletion error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
