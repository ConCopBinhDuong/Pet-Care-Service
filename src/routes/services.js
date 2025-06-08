import express from 'express'
import db from '../Database_sqlite.js';


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
            query += ' WHERE ' + conditions.join(' AND ');
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
            query += ' WHERE ' + conditions.join(' AND ');
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
                sp.bussiness_name as provider_name,
                sp.address as provider_address,
                sp.phone as provider_phone
            FROM service s
            JOIN servicetype st ON s.typeid = st.typeid
            JOIN serviceprovider sp ON s.providerid = sp.id
            WHERE s.serviceid = ?
        `);
        
        const service = getServiceStmt.get(serviceid);
        
        if (!service) {
            return res.status(404).json({ 
                message: 'Service not found' 
            });
        }

        // Get available time slots for the service
        const getTimeSlotsStmt = db.prepare(`
            SELECT slot
            FROM timeslot
            WHERE serviceid = ?
            ORDER BY slot ASC
        `);
        
        const timeSlots = getTimeSlotsStmt.all(serviceid);

        res.status(200).json({
            message: 'Service details retrieved successfully',
            service: {
                ...service,
                timeSlots: timeSlots.map(ts => ts.slot)
            }
        });
    } catch (error) {
        console.error('Error retrieving service details:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving service details' 
        });
    }
});

export default router;
