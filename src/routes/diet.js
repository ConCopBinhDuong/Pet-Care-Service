import express from 'express'
import db from '../Database_sqlite.js'
import { validateDietCreation, validateDietUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all diets for a specific pet
router.get('/pet/:petId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const petId = parseInt(req.params.petId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage diets.' 
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
                message: 'Access denied. You can only manage diets for your own pets.' 
            });
        }

        const getDietsStmt = db.prepare(`
            SELECT dietid, name, amount, description, petid
            FROM diet 
            WHERE petid = ?
            ORDER BY name ASC
        `);
        
        const diets = getDietsStmt.all(petId);

        res.status(200).json({
            message: 'Diets retrieved successfully',
            petId: petId,
            diets: diets
        });

    } catch (err) {
        console.error('Get diets error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all diets for all pets of the authenticated user
router.get('/', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage diets.' 
            });
        }

        const getDietsStmt = db.prepare(`
            SELECT d.dietid, d.name, d.amount, d.description, d.petid, p.name as pet_name
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE p.userid = ?
            ORDER BY p.name ASC, d.name ASC
        `);
        
        const diets = getDietsStmt.all(userId);

        res.status(200).json({
            message: 'All diets retrieved successfully',
            diets: diets
        });

    } catch (err) {
        console.error('Get all diets error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new diet for a specific pet
router.post('/pet/:petId', validateDietCreation, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const petId = parseInt(req.params.petId);
        const { name, amount, description } = req.body;

        // Only pet owners can add diets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can add diets.' 
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
                message: 'Access denied. You can only add diets for your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Insert new diet
        const insertDietStmt = db.prepare(`
            INSERT INTO diet (name, amount, description, petid)
            VALUES (?, ?, ?, ?)
        `);

        const result = insertDietStmt.run(
            name, 
            amount || null,
            description || null, 
            petId
        );

        db.exec('COMMIT');

        // Get the newly created diet
        const getNewDietStmt = db.prepare(`
            SELECT dietid, name, amount, description, petid
            FROM diet 
            WHERE dietid = ?
        `);
        
        const newDiet = getNewDietStmt.get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Diet added successfully',
            diet: newDiet
        });

    } catch (err) {
        console.error('Add diet error:', err.message);
        db.exec('ROLLBACK');
        
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Diet with this name already exists for this pet' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific diet by ID
router.get('/:dietId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const dietId = parseInt(req.params.dietId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can view diets.' 
            });
        }

        if (isNaN(dietId)) {
            return res.status(400).json({ message: 'Invalid diet ID' });
        }

        // Get diet and verify ownership through pet
        const getDietStmt = db.prepare(`
            SELECT d.dietid, d.name, d.amount, d.description, d.petid, p.userid, p.name as pet_name
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE d.dietid = ?
        `);
        
        const diet = getDietStmt.get(dietId);

        if (!diet) {
            return res.status(404).json({ message: 'Diet not found' });
        }

        // Verify that the diet belongs to the user's pet
        if (diet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view diets for your own pets.' 
            });
        }

        // Remove userid from response
        const { userid, ...dietData } = diet;

        res.status(200).json({
            message: 'Diet retrieved successfully',
            diet: dietData
        });

    } catch (err) {
        console.error('Get diet error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a specific diet
router.put('/:dietId', validateDietUpdate, (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const dietId = parseInt(req.params.dietId);
        const updates = req.body;

        // Only pet owners can update diets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update diets.' 
            });
        }

        if (isNaN(dietId)) {
            return res.status(400).json({ message: 'Invalid diet ID' });
        }

        // Verify diet exists and belongs to user's pet
        const getDietStmt = db.prepare(`
            SELECT d.dietid, p.userid 
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE d.dietid = ?
        `);
        const diet = getDietStmt.get(dietId);

        if (!diet) {
            return res.status(404).json({ message: 'Diet not found' });
        }

        if (diet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update diets for your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Build update query
        const allowedFields = ['name', 'amount', 'description'];
        const dietUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                dietUpdates[field] = updates[field];
            }
        });

        if (Object.keys(dietUpdates).length === 0) {
            db.exec('ROLLBACK');
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const setClause = Object.keys(dietUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(dietUpdates);
        
        const updateDietStmt = db.prepare(`UPDATE diet SET ${setClause} WHERE dietid = ?`);
        updateDietStmt.run(...values, dietId);

        db.exec('COMMIT');

        // Get updated diet
        const getUpdatedDietStmt = db.prepare(`
            SELECT dietid, name, amount, description, petid
            FROM diet 
            WHERE dietid = ?
        `);
        
        const updatedDiet = getUpdatedDietStmt.get(dietId);

        res.status(200).json({
            message: 'Diet updated successfully',
            diet: updatedDiet
        });

    } catch (err) {
        console.error('Update diet error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a specific diet
router.delete('/:dietId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const dietId = parseInt(req.params.dietId);

        // Only pet owners can delete diets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can delete diets.' 
            });
        }

        if (isNaN(dietId)) {
            return res.status(400).json({ message: 'Invalid diet ID' });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Get diet info before deletion and verify ownership
        const getDietStmt = db.prepare(`
            SELECT d.dietid, d.name, d.amount, p.userid, p.name as pet_name
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE d.dietid = ?
        `);
        
        const diet = getDietStmt.get(dietId);

        if (!diet) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Diet not found' });
        }

        if (diet.userid !== userId) {
            db.exec('ROLLBACK');
            return res.status(403).json({ 
                message: 'Access denied. You can only delete diets for your own pets.' 
            });
        }

        // Delete diet (CASCADE DELETE will handle related records)
        const deleteDietStmt = db.prepare(`DELETE FROM diet WHERE dietid = ?`);
        const result = deleteDietStmt.run(dietId);

        if (result.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Diet not found or already deleted' });
        }

        db.exec('COMMIT');

        console.log(`Diet deleted: ${diet.name} for pet ${diet.pet_name} by user ${userId}`);

        res.status(200).json({
            message: 'Diet deleted successfully',
            deletedDiet: {
                id: diet.dietid,
                name: diet.name,
                amount: diet.amount,
                pet_name: diet.pet_name
            }
        });

    } catch (err) {
        console.error('Delete diet error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
