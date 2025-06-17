import express from 'express'
import db from '../Database_sqlite.js'
import { validateActivityCreation, validateActivityUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all activities for the authenticated pet owner
router.get('/', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage activities.' 
            });
        }

        const getActivitiesStmt = db.prepare(`
            SELECT a.activityid, a.name, a.description, a.petid, p.name as pet_name
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE p.userid = ?
            ORDER BY p.name ASC, a.name ASC
        `);
        
        const activities = getActivitiesStmt.all(userId);

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
router.get('/pet/:petId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
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
        const checkPetOwnershipStmt = db.prepare(`
            SELECT userid, name FROM pet WHERE petid = ?
        `);
        const pet = checkPetOwnershipStmt.get(petId);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view activities for your own pets.' 
            });
        }

        const getActivitiesStmt = db.prepare(`
            SELECT activityid, name, description, petid
            FROM activity 
            WHERE petid = ?
            ORDER BY name ASC
        `);
        
        const activities = getActivitiesStmt.all(petId);

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
router.post('/pet/:petId', validateActivityCreation, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
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
        const checkPetOwnershipStmt = db.prepare(`
            SELECT userid FROM pet WHERE petid = ?
        `);
        const pet = checkPetOwnershipStmt.get(petId);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only add activities for your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Insert new activity
        const insertActivityStmt = db.prepare(`
            INSERT INTO activity (name, description, petid)
            VALUES (?, ?, ?)
        `);

        const result = insertActivityStmt.run(
            name, 
            description || null, 
            petId
        );

        db.exec('COMMIT');

        // Get the newly created activity
        const getNewActivityStmt = db.prepare(`
            SELECT activityid, name, description, petid
            FROM activity 
            WHERE activityid = ?
        `);
        
        const newActivity = getNewActivityStmt.get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Activity added successfully',
            activity: newActivity
        });

    } catch (err) {
        console.error('Add activity error:', err.message);
        db.exec('ROLLBACK');
        
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ 
                message: 'Activity with this name already exists for this pet' 
            });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific activity by ID
router.get('/:activityId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
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
        const getActivityStmt = db.prepare(`
            SELECT a.activityid, a.name, a.description, a.petid, p.userid, p.name as pet_name
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE a.activityid = ?
        `);
        
        const activity = getActivityStmt.get(activityId);

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
router.put('/:activityId', validateActivityUpdate, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
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
        const getActivityStmt = db.prepare(`
            SELECT a.activityid, p.userid
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE a.activityid = ?
        `);
        const activity = getActivityStmt.get(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update activities for your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Build update query
        const allowedFields = ['name', 'description'];
        const activityUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                activityUpdates[field] = updates[field];
            }
        });

        if (Object.keys(activityUpdates).length === 0) {
            db.exec('ROLLBACK');
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const setClause = Object.keys(activityUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(activityUpdates);
        
        const updateActivityStmt = db.prepare(`UPDATE activity SET ${setClause} WHERE activityid = ?`);
        updateActivityStmt.run(...values, activityId);

        db.exec('COMMIT');

        // Get updated activity
        const getUpdatedActivityStmt = db.prepare(`
            SELECT a.activityid, a.name, a.description, a.petid, p.name as pet_name
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE a.activityid = ?
        `);
        
        const updatedActivity = getUpdatedActivityStmt.get(activityId);

        res.status(200).json({
            message: 'Activity updated successfully',
            activity: updatedActivity
        });

    } catch (err) {
        console.error('Update activity error:', err.message);
        db.exec('ROLLBACK');
        
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ 
                message: 'Activity with this name already exists for this pet' 
            });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a specific activity
router.delete('/:activityId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
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

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Get activity info before deletion and verify ownership
        const getActivityStmt = db.prepare(`
            SELECT a.activityid, a.name, a.description, p.userid, p.name as pet_name
            FROM activity a
            JOIN pet p ON a.petid = p.petid
            WHERE a.activityid = ?
        `);
        
        const activity = getActivityStmt.get(activityId);

        if (!activity) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.userid !== userId) {
            db.exec('ROLLBACK');
            return res.status(403).json({ 
                message: 'Access denied. You can only delete activities for your own pets.' 
            });
        }

        // Delete activity (CASCADE DELETE will handle related records)
        const deleteActivityStmt = db.prepare(`DELETE FROM activity WHERE activityid = ?`);
        const result = deleteActivityStmt.run(activityId);

        if (result.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Activity not found or already deleted' });
        }

        db.exec('COMMIT');

        console.log(`Activity deleted: ${activity.name} for pet ${activity.pet_name} by user ${userId}`);

        res.status(200).json({
            message: 'Activity deleted successfully',
            deletedActivity: {
                id: activity.activityid,
                name: activity.name,
                pet_name: activity.pet_name
            }
        });

    } catch (err) {
        console.error('Delete activity error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
