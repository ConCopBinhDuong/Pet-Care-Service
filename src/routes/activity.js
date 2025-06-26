import express from 'express'
import db from '../db.js'
import { validateActivityCreation, validateActivityUpdate } from '../middleware/validationMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all activities for the authenticated pet owner
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage activities.',
                role: userRole
            });
        }

        const activities = await db.all(`
            SELECT a.activityid, a.name, a.description, a.petid, p.name as pet_name
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE p.userid = ?
            ORDER BY p.name ASC, a.name ASC
        `, [userId]);

        res.status(200).json({
            message: 'All activities retrieved successfully',
            activities: activities
        });

    } catch (err) {
        console.error('Get all activities error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Get activities for a specific pet
router.get('/pet/:petId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const petId = parseInt(req.params.petId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage activities.' 
            });
        }

        if (isNaN(petId)) {
            return res.status(400).json({ message: 'Invalid pet ID' });
        }

        // Verify that the pet belongs to the authenticated user
        const pet = await db.get(`
            SELECT userid, name FROM pet WHERE petid = ?
        `, [petId]);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view activities for your own pets.' 
            });
        }

        const activities = await db.all(`
            SELECT activityid, name, description, petid
            FROM activity 
            WHERE petid = ?
            ORDER BY name ASC
        `, [petId]);

        res.status(200).json({
            message: `Activities for ${pet.name} retrieved successfully`,
            pet: {
                id: petId,
                name: pet.name
            },
            activities: activities
        });

    } catch (err) {
        console.error('Get pet activities error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new activity for a specific pet
router.post('/pet/:petId', validateActivityCreation, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const petId = parseInt(req.params.petId);
        const { name, description } = req.body;

        // Only pet owners can add activities
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can add activities.' 
            });
        }

        if (isNaN(petId)) {
            return res.status(400).json({ message: 'Invalid pet ID' });
        }

        // Verify that the pet belongs to the authenticated user
        const pet = await db.get(`
            SELECT userid FROM pet WHERE petid = ?
        `, [petId]);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only add activities for your own pets.' 
            });
        }

        // Use the transaction wrapper for proper transaction handling
        try {
            const newActivity = await db.transaction(async (connection) => {
                // Insert new activity
                const [result] = await connection.execute(`
                    INSERT INTO activity (name, description, petid)
                    VALUES (?, ?, ?)
                `, [
                    name, 
                    description || null, 
                    petId
                ]);

                // Get the newly created activity
                const [activityRows] = await connection.execute(`
                    SELECT activityid, name, description, petid
                    FROM activity 
                    WHERE activityid = ?
                `, [result.insertId]);
                
                return activityRows[0];
            });

            res.status(201).json({
                message: 'Activity added successfully',
                activity: newActivity
            });

        } catch (transactionErr) {
            throw transactionErr;
        }

    } catch (err) {
        console.error('Add activity error:', err.message);
        
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('Duplicate entry')) {
            return res.status(409).json({ 
                message: 'Activity with this name already exists for this pet' 
            });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific activity by ID
router.get('/:activityId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const activityId = parseInt(req.params.activityId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage activities.' 
            });
        }

        if (isNaN(activityId)) {
            return res.status(400).json({ message: 'Invalid activity ID' });
        }

        // Get activity with pet ownership verification
        const activity = await db.get(`
            SELECT a.activityid, a.name, a.description, a.petid, p.userid, p.name as pet_name
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE a.activityid = ?
        `, [activityId]);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view activities for your own pets.' 
            });
        }

        // Remove userid from response
        const { userid, ...activityData } = activity;

        res.status(200).json({
            message: 'Activity retrieved successfully',
            activity: activityData
        });

    } catch (err) {
        console.error('Get activity error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a specific activity
router.put('/:activityId', validateActivityUpdate, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const activityId = parseInt(req.params.activityId);
        const updates = req.body;

        // Only pet owners can update activities
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update activities.' 
            });
        }

        if (isNaN(activityId)) {
            return res.status(400).json({ message: 'Invalid activity ID' });
        }

        // Verify activity exists and belongs to user's pet
        const activity = await db.get(`
            SELECT a.activityid, p.userid
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE a.activityid = ?
        `, [activityId]);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update activities for your own pets.' 
            });
        }

        // Use the transaction wrapper for proper transaction handling
        try {
            const updatedActivity = await db.transaction(async (connection) => {
                // Build update query
                const allowedFields = ['name', 'description'];
                const activityUpdates = {};
                
                allowedFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        activityUpdates[field] = updates[field];
                    }
                });

                if (Object.keys(activityUpdates).length === 0) {
                    throw new Error('No valid fields to update');
                }

                const setClause = Object.keys(activityUpdates).map(key => `${key} = ?`).join(', ');
                const values = Object.values(activityUpdates);
                
                await connection.execute(`UPDATE activity SET ${setClause} WHERE activityid = ?`, [...values, activityId]);

                // Get updated activity
                const [activityRows] = await connection.execute(`
                    SELECT a.activityid, a.name, a.description, a.petid, p.name as pet_name
                    FROM activity a
                    JOIN pet p ON a.petid = p.petid
                    WHERE a.activityid = ?
                `, [activityId]);

                return activityRows[0];
            });

            res.status(200).json({
                message: 'Activity updated successfully',
                activity: updatedActivity
            });

        } catch (transactionErr) {
            if (transactionErr.message === 'No valid fields to update') {
                return res.status(400).json({ message: transactionErr.message });
            }
            throw transactionErr;
        }

    } catch (err) {
        console.error('Update activity error:', err.message);
        
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('Duplicate entry')) {
            return res.status(409).json({ 
                message: 'Activity with this name already exists for this pet' 
            });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a specific activity
router.delete('/:activityId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
        const activityId = parseInt(req.params.activityId);

        // Only pet owners can delete activities
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can delete activities.' 
            });
        }

        if (isNaN(activityId)) {
            return res.status(400).json({ message: 'Invalid activity ID' });
        }

        // Use the transaction wrapper for proper transaction handling
        try {
            const deletedActivity = await db.transaction(async (connection) => {
                // Get activity info before deletion and verify ownership
                const [activityRows] = await connection.execute(`
                    SELECT a.activityid, a.name, a.description, p.userid, p.name as pet_name
                    FROM activity a
                    JOIN pet p ON a.petid = p.petid
                    WHERE a.activityid = ?
                `, [activityId]);
                
                const activity = activityRows[0];

                if (!activity) {
                    throw new Error('Activity not found');
                }

                if (activity.userid !== userId) {
                    throw new Error('Access denied. You can only delete activities for your own pets.');
                }

                // Delete activity (CASCADE DELETE will handle related records)
                const [result] = await connection.execute(`DELETE FROM activity WHERE activityid = ?`, [activityId]);

                if (result.affectedRows === 0) {
                    throw new Error('Activity not found or already deleted');
                }

                return activity;
            });

            console.log(`Activity deleted: ${deletedActivity.name} for pet ${deletedActivity.pet_name} by user ${userId}`);

            res.status(200).json({
                message: 'Activity deleted successfully',
                deletedActivity: {
                    id: deletedActivity.activityid,
                    name: deletedActivity.name,
                    pet_name: deletedActivity.pet_name
                }
            });

        } catch (transactionErr) {
            if (transactionErr.message === 'Activity not found' || transactionErr.message === 'Activity not found or already deleted') {
                return res.status(404).json({ message: transactionErr.message });
            }
            if (transactionErr.message.includes('Access denied')) {
                return res.status(403).json({ message: transactionErr.message });
            }
            throw transactionErr;
        }

    } catch (err) {
        console.error('Delete activity error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
