import express from 'express'
import db from '../Database_sqlite.js'
import { validateScheduleCreation, validateScheduleUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all schedules for the authenticated pet owner
router.get('/', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage schedules.' 
            });
        }

        const getSchedulesStmt = db.prepare(`
            SELECT 
                ps.petscheduleid, ps.startdate, ps.repeat_option, ps.hour, ps.minute,
                ps.dietid, ps.activityid,
                d.name as diet_name, d.amount as diet_amount,
                a.name as activity_name,
                p.name as pet_name, p.petid
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
            WHERE p.userid = ?
            ORDER BY ps.startdate ASC, ps.hour ASC, ps.minute ASC
        `);
        
        const schedules = getSchedulesStmt.all(userId);

        res.status(200).json({
            message: 'All schedules retrieved successfully',
            schedules: schedules
        });

    } catch (err) {
        console.error('Get all schedules error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get schedules for a specific pet
router.get('/pet/:petId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const petId = parseInt(req.params.petId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage schedules.' 
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
                message: 'Access denied. You can only view schedules for your own pets.' 
            });
        }

        const getSchedulesStmt = db.prepare(`
            SELECT 
                ps.petscheduleid, ps.startdate, ps.repeat_option, ps.hour, ps.minute,
                ps.dietid, ps.activityid,
                d.name as diet_name, d.amount as diet_amount,
                a.name as activity_name
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            WHERE (d.petid = ? OR a.petid = ?)
            ORDER BY ps.startdate ASC, ps.hour ASC, ps.minute ASC
        `);
        
        const schedules = getSchedulesStmt.all(petId, petId);

        res.status(200).json({
            message: `Schedules for ${pet.name} retrieved successfully`,
            pet: {
                id: petId,
                name: pet.name
            },
            schedules: schedules
        });

    } catch (err) {
        console.error('Get pet schedules error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new schedule for a diet or activity
router.post('/', validateScheduleCreation, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { startdate, repeat_option, hour, minute, dietid, activityid } = req.body;

        // Only pet owners can add schedules
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can add schedules.' 
            });
        }

        // Must provide either dietid or activityid, but not both
        if ((!dietid && !activityid) || (dietid && activityid)) {
            return res.status(400).json({ 
                message: 'Must provide either diet ID or activity ID, but not both' 
            });
        }

        let pet = null;

        // Verify ownership of diet or activity
        if (dietid) {
            const checkDietOwnershipStmt = db.prepare(`
                SELECT p.userid, p.name, d.name as diet_name
                FROM diet d
                JOIN pet p ON d.petid = p.petid
                WHERE d.dietid = ?
            `);
            pet = checkDietOwnershipStmt.get(dietid);
            
            if (!pet) {
                return res.status(404).json({ message: 'Diet not found' });
            }
        } else {
            const checkActivityOwnershipStmt = db.prepare(`
                SELECT p.userid, p.name, a.name as activity_name
                FROM activity a
                JOIN pet p ON a.petid = p.petid
                WHERE a.activityid = ?
            `);
            pet = checkActivityOwnershipStmt.get(activityid);
            
            if (!pet) {
                return res.status(404).json({ message: 'Activity not found' });
            }
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only create schedules for your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Insert new schedule
        const insertScheduleStmt = db.prepare(`
            INSERT INTO petschedule (startdate, repeat_option, hour, minute, dietid, activityid)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = insertScheduleStmt.run(
            startdate,
            repeat_option,
            hour,
            minute,
            dietid || null,
            activityid || null
        );

        db.exec('COMMIT');

        // Get the newly created schedule
        const getNewScheduleStmt = db.prepare(`
            SELECT 
                ps.petscheduleid, ps.startdate, ps.repeat_option, ps.hour, ps.minute,
                ps.dietid, ps.activityid,
                d.name as diet_name, d.amount as diet_amount,
                a.name as activity_name,
                p.name as pet_name
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
            WHERE ps.petscheduleid = ?
        `);
        
        const newSchedule = getNewScheduleStmt.get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Schedule added successfully',
            schedule: newSchedule
        });

    } catch (err) {
        console.error('Add schedule error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific schedule by ID
router.get('/:scheduleId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const scheduleId = parseInt(req.params.scheduleId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage schedules.' 
            });
        }

        if (isNaN(scheduleId)) {
            return res.status(400).json({ message: 'Invalid schedule ID' });
        }

        // Get schedule with pet ownership verification
        const getScheduleStmt = db.prepare(`
            SELECT 
                ps.petscheduleid, ps.startdate, ps.repeat_option, ps.hour, ps.minute,
                ps.dietid, ps.activityid,
                d.name as diet_name, d.amount as diet_amount,
                a.name as activity_name,
                p.userid, p.name as pet_name
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
            WHERE ps.petscheduleid = ?
        `);
        
        const schedule = getScheduleStmt.get(scheduleId);

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (schedule.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view schedules for your own pets.' 
            });
        }

        // Remove userid from response
        const { userid, ...scheduleData } = schedule;

        res.status(200).json({
            message: 'Schedule retrieved successfully',
            schedule: scheduleData
        });

    } catch (err) {
        console.error('Get schedule error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a specific schedule
router.put('/:scheduleId', validateScheduleUpdate, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const scheduleId = parseInt(req.params.scheduleId);
        const updates = req.body;

        // Only pet owners can update schedules
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update schedules.' 
            });
        }

        if (isNaN(scheduleId)) {
            return res.status(400).json({ message: 'Invalid schedule ID' });
        }

        // Verify schedule exists and belongs to user's pet
        const getScheduleStmt = db.prepare(`
            SELECT ps.petscheduleid, p.userid
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
            WHERE ps.petscheduleid = ?
        `);
        const schedule = getScheduleStmt.get(scheduleId);

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (schedule.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update schedules for your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Build update query
        const allowedFields = ['startdate', 'repeat_option', 'hour', 'minute'];
        const scheduleUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                scheduleUpdates[field] = updates[field];
            }
        });

        if (Object.keys(scheduleUpdates).length === 0) {
            db.exec('ROLLBACK');
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const setClause = Object.keys(scheduleUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(scheduleUpdates);
        
        const updateScheduleStmt = db.prepare(`UPDATE petschedule SET ${setClause} WHERE petscheduleid = ?`);
        updateScheduleStmt.run(...values, scheduleId);

        db.exec('COMMIT');

        // Get updated schedule
        const getUpdatedScheduleStmt = db.prepare(`
            SELECT 
                ps.petscheduleid, ps.startdate, ps.repeat_option, ps.hour, ps.minute,
                ps.dietid, ps.activityid,
                d.name as diet_name, d.amount as diet_amount,
                a.name as activity_name,
                p.name as pet_name
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
            WHERE ps.petscheduleid = ?
        `);
        
        const updatedSchedule = getUpdatedScheduleStmt.get(scheduleId);

        res.status(200).json({
            message: 'Schedule updated successfully',
            schedule: updatedSchedule
        });

    } catch (err) {
        console.error('Update schedule error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a specific schedule
router.delete('/:scheduleId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const scheduleId = parseInt(req.params.scheduleId);

        // Only pet owners can delete schedules
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can delete schedules.' 
            });
        }

        if (isNaN(scheduleId)) {
            return res.status(400).json({ message: 'Invalid schedule ID' });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Get schedule info before deletion and verify ownership
        const getScheduleStmt = db.prepare(`
            SELECT 
                ps.petscheduleid, ps.startdate, ps.hour, ps.minute,
                d.name as diet_name, a.name as activity_name,
                p.userid, p.name as pet_name
            FROM petschedule ps
            LEFT JOIN diet d ON ps.dietid = d.dietid
            LEFT JOIN activity a ON ps.activityid = a.activityid
            LEFT JOIN pet p ON (d.petid = p.petid OR a.petid = p.petid)
            WHERE ps.petscheduleid = ?
        `);
        
        const schedule = getScheduleStmt.get(scheduleId);

        if (!schedule) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (schedule.userid !== userId) {
            db.exec('ROLLBACK');
            return res.status(403).json({ 
                message: 'Access denied. You can only delete schedules for your own pets.' 
            });
        }

        // Delete schedule
        const deleteScheduleStmt = db.prepare(`DELETE FROM petschedule WHERE petscheduleid = ?`);
        const result = deleteScheduleStmt.run(scheduleId);

        if (result.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Schedule not found or already deleted' });
        }

        db.exec('COMMIT');

        const itemName = schedule.diet_name || schedule.activity_name;
        console.log(`Schedule deleted: ${itemName} for pet ${schedule.pet_name} by user ${userId}`);

        res.status(200).json({
            message: 'Schedule deleted successfully',
            deletedSchedule: {
                id: schedule.petscheduleid,
                item: itemName,
                pet_name: schedule.pet_name,
                time: `${schedule.hour}:${schedule.minute.toString().padStart(2, '0')}`
            }
        });

    } catch (err) {
        console.error('Delete schedule error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
