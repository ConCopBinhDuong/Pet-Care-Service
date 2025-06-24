import express from 'express'
import db from '../db.js'
import { validateDietCreation, validateDietUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all diets for a specific pet
router.get('/pet/:petId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        const pet = await db.get(`
            SELECT userid FROM pet WHERE petid = ?
        `, [petId]);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only manage diets for your own pets.' 
            });
        }

        const diets = await db.all(`
            SELECT dietid, name, amount, description, petid
            FROM diet 
            WHERE petid = ?
            ORDER BY name ASC
        `, [petId]);

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
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage diets.' 
            });
        }

        const diets = await db.all(`
            SELECT d.dietid, d.name, d.amount, d.description, d.petid, p.name as pet_name
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE p.userid = ?
            ORDER BY p.name ASC, d.name ASC
        `, [userId]);

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
router.post('/pet/:petId', validateDietCreation, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        const pet = await db.get(`
            SELECT userid FROM pet WHERE petid = ?
        `, [petId]);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only add diets for your own pets.' 
            });
        }

        // Start transaction
        await db.beginTransaction();

        try {
            // Insert new diet
            const result = await db.execute(`
                INSERT INTO diet (name, amount, description, petid)
                VALUES (?, ?, ?, ?)
            `, [
                name, 
                amount || null,
                description || null, 
                petId
            ]);

            await db.commit();

            // Get the newly created diet
            const newDiet = await db.get(`
                SELECT dietid, name, amount, description, petid
                FROM diet 
                WHERE dietid = ?
            `, [result.insertId]);

            res.status(201).json({
                message: 'Diet added successfully',
                diet: newDiet
            });

        } catch (transactionErr) {
            await db.rollback();
            throw transactionErr;
        }

    } catch (err) {
        console.error('Add diet error:', err.message);
        
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('Duplicate entry')) {
            return res.status(409).json({ message: 'Diet with this name already exists for this pet' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific diet by ID
router.get('/:dietId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        const diet = await db.get(`
            SELECT d.dietid, d.name, d.amount, d.description, d.petid, p.userid, p.name as pet_name
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE d.dietid = ?
        `, [dietId]);

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
router.put('/:dietId', validateDietUpdate, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        const diet = await db.get(`
            SELECT d.dietid, p.userid 
            FROM diet d
            JOIN pet p ON d.petid = p.petid
            WHERE d.dietid = ?
        `, [dietId]);

        if (!diet) {
            return res.status(404).json({ message: 'Diet not found' });
        }

        if (diet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update diets for your own pets.' 
            });
        }

        // Build update query
        const allowedFields = ['name', 'amount', 'description'];
        const dietUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                dietUpdates[field] = updates[field];
            }
        });

        if (Object.keys(dietUpdates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Start transaction
        await db.beginTransaction();

        try {
            const setClause = Object.keys(dietUpdates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(dietUpdates);
            
            await db.execute(`UPDATE diet SET ${setClause} WHERE dietid = ?`, [...values, dietId]);

            await db.commit();

            // Get updated diet
            const updatedDiet = await db.get(`
                SELECT dietid, name, amount, description, petid
                FROM diet 
                WHERE dietid = ?
            `, [dietId]);

            res.status(200).json({
                message: 'Diet updated successfully',
                diet: updatedDiet
            });

        } catch (transactionErr) {
            await db.rollback();
            throw transactionErr;
        }

    } catch (err) {
        console.error('Update diet error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a specific diet
router.delete('/:dietId', async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        await db.beginTransaction();

        try {
            // Get diet info before deletion and verify ownership
            const diet = await db.get(`
                SELECT d.dietid, d.name, d.amount, p.userid, p.name as pet_name
                FROM diet d
                JOIN pet p ON d.petid = p.petid
                WHERE d.dietid = ?
            `, [dietId]);

            if (!diet) {
                await db.rollback();
                return res.status(404).json({ message: 'Diet not found' });
            }

            if (diet.userid !== userId) {
                await db.rollback();
                return res.status(403).json({ 
                    message: 'Access denied. You can only delete diets for your own pets.' 
                });
            }

            // Delete diet (CASCADE DELETE will handle related records)
            const result = await db.execute(`DELETE FROM diet WHERE dietid = ?`, [dietId]);

            if (result.affectedRows === 0) {
                await db.rollback();
                return res.status(404).json({ message: 'Diet not found or already deleted' });
            }

            await db.commit();

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

        } catch (transactionErr) {
            await db.rollback();
            throw transactionErr;
        }

    } catch (err) {
        console.error('Delete diet error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
