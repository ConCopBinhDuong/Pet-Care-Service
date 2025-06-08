import express from 'express'
import db from '../Database_sqlite.js'
import { validateProfileUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get current user profile (protected route)
// Note: authMiddleware is applied at the router level in server.js
router.get('/', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

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
                SELECT bussiness_name, logo, phone, description, address, website 
                FROM serviceprovider WHERE id = ?
            `);
            const serviceProviderData = getServiceProviderStmt.get(userId);
            
            if (serviceProviderData) {
                profileData.businessName = serviceProviderData.bussiness_name;
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

// Update user profile (protected route)
router.put('/', validateProfileUpdate, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
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
            const allowedProviderFields = ['bussiness_name', 'logo', 'phone', 'description', 'address', 'website'];
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
        const userId = req.userId;
        const userRole = req.userRole;

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
