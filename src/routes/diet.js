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

        console.log('🍽️ Diet creation request received:', {
            userId,
            userRole,
            petId,
            body: req.body
        });

        // Only pet owners can add diets
        if (userRole !== 'Pet owner') {
            console.log('❌ Diet creation denied: user is not pet owner');
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can add diets.' 
            });
        }

        if (isNaN(petId)) {
            console.log('❌ Diet creation failed: invalid pet ID');
            return res.status(400).json({ message: 'Invalid pet ID' });
        }

        // Verify that the pet belongs to the authenticated user
        const pet = await db.get(`
            SELECT userid FROM pet WHERE petid = ?
        `, [petId]);

        console.log('🐕 Pet ownership check:', { petId, pet, expectedUserId: userId });

        if (!pet) {
            console.log('❌ Diet creation failed: pet not found');
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            console.log('❌ Diet creation failed: pet does not belong to user');
            return res.status(403).json({ 
                message: 'Access denied. You can only add diets for your own pets.' 
            });
        }

        // Use the transaction wrapper for proper transaction handling
        try {
            const newDiet = await db.transaction(async (connection) => {
                // Insert new diet
                const [result] = await connection.execute(`
                    INSERT INTO diet (name, amount, description, petid)
                    VALUES (?, ?, ?, ?)
                `, [
                    name, 
                    amount || null,
                    description || null, 
                    petId
                ]);

                // Get the newly created diet
                const [dietRows] = await connection.execute(`
                    SELECT dietid, name, amount, description, petid
                    FROM diet 
                    WHERE dietid = ?
                `, [result.insertId]);

                return dietRows[0];
            });

            console.log('✅ Diet created successfully:', newDiet);

            res.status(201).json({
                success: true,
                message: 'Diet added successfully',
                diet: newDiet
            });

        } catch (transactionErr) {
            throw transactionErr;
        }

    } catch (err) {
        console.error('❌ Add diet error:', err.message);
        console.error('❌ Add diet stack:', err.stack);
        
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

        // Use the transaction wrapper for proper transaction handling
        try {
            const updatedDiet = await db.transaction(async (connection) => {
                const setClause = Object.keys(dietUpdates).map(key => `${key} = ?`).join(', ');
                const values = Object.values(dietUpdates);
                
                await connection.execute(`UPDATE diet SET ${setClause} WHERE dietid = ?`, [...values, dietId]);

                // Get updated diet
                const [dietRows] = await connection.execute(`
                    SELECT dietid, name, amount, description, petid
                    FROM diet 
                    WHERE dietid = ?
                `, [dietId]);

                return dietRows[0];
            });

            res.status(200).json({
                message: 'Diet updated successfully',
                diet: updatedDiet
            });

        } catch (transactionErr) {
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

        // Use the transaction wrapper for proper transaction handling
        try {
            const deletedDiet = await db.transaction(async (connection) => {
                // Get diet info before deletion and verify ownership
                const [dietRows] = await connection.execute(`
                    SELECT d.dietid, d.name, d.amount, p.userid, p.name as pet_name
                    FROM diet d
                    JOIN pet p ON d.petid = p.petid
                    WHERE d.dietid = ?
                `, [dietId]);
                
                const diet = dietRows[0];

                if (!diet) {
                    throw new Error('Diet not found');
                }

                if (diet.userid !== userId) {
                    throw new Error('Access denied. You can only delete diets for your own pets.');
                }

                // Delete diet (CASCADE DELETE will handle related records)
                const [result] = await connection.execute(`DELETE FROM diet WHERE dietid = ?`, [dietId]);

                if (result.affectedRows === 0) {
                    throw new Error('Diet not found or already deleted');
                }

                return diet;
            });

            console.log(`Diet deleted: ${deletedDiet.name} for pet ${deletedDiet.pet_name} by user ${userId}`);

            res.status(200).json({
                message: 'Diet deleted successfully',
                deletedDiet: {
                    id: deletedDiet.dietid,
                    name: deletedDiet.name,
                    amount: deletedDiet.amount,
                    pet_name: deletedDiet.pet_name
                }
            });

        } catch (transactionErr) {
            if (transactionErr.message === 'Diet not found' || transactionErr.message === 'Diet not found or already deleted') {
                return res.status(404).json({ message: transactionErr.message });
            }
            if (transactionErr.message.includes('Access denied')) {
                return res.status(403).json({ message: transactionErr.message });
            }
            throw transactionErr;
        }

    } catch (err) {
        console.error('Delete diet error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
