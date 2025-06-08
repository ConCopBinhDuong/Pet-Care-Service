import express from 'express'
import db from '../Database_sqlite.js'
// TODO: Add validation middleware when needed
// import { validatePetCreation, validatePetUpdate } from '../middleware/validationMiddleware.js'

const router = express.Router();

// Get all pets for the authenticated pet owner
router.get('/', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage pets.' 
            });
        }

        const getPetsStmt = db.prepare(`
            SELECT petid, name, breed, description, age, dob, picture
            FROM pet 
            WHERE userid = ?
            ORDER BY name ASC
        `);
        
        const pets = getPetsStmt.all(userId);

        res.status(200).json({
            message: 'Pets retrieved successfully',
            pets: pets
        });

    } catch (err) {
        console.error('Get pets error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new pet for the authenticated pet owner
router.post('/', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { name, breed, description, age, dob, picture } = req.body;

        // Only pet owners can add pets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can add pets.' 
            });
        }

        // Verify that the user is actually a pet owner in the database
        const checkPetOwnerStmt = db.prepare(`SELECT id FROM petowner WHERE id = ?`);
        const petOwner = checkPetOwnerStmt.get(userId);

        if (!petOwner) {
            return res.status(403).json({ 
                message: 'User is not registered as a pet owner.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Insert new pet
        const insertPetStmt = db.prepare(`
            INSERT INTO pet (name, breed, description, age, dob, picture, userid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = insertPetStmt.run(
            name, 
            breed, 
            description || null,
            age || null,
            dob || null, 
            picture, 
            userId
        );

        db.exec('COMMIT');

        // Get the newly created pet
        const getNewPetStmt = db.prepare(`
            SELECT petid, name, breed, description, age, dob, picture
            FROM pet 
            WHERE petid = ?
        `);
        
        const newPet = getNewPetStmt.get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Pet added successfully',
            pet: newPet
        });

    } catch (err) {
        console.error('Add pet error:', err.message);
        db.exec('ROLLBACK');
        
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Pet with this name already exists' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific pet by ID
router.get('/:petId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const petId = parseInt(req.params.petId);

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can view pets.' 
            });
        }

        if (isNaN(petId)) {
            return res.status(400).json({ message: 'Invalid pet ID' });
        }

        // Get pet and verify ownership
        const getPetStmt = db.prepare(`
            SELECT petid, name, breed, description, age, dob, picture, userid
            FROM pet 
            WHERE petid = ?
        `);
        
        const pet = getPetStmt.get(petId);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Verify that the pet belongs to the authenticated user
        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own pets.' 
            });
        }

        // Remove userid from response
        const { userid, ...petData } = pet;

        res.status(200).json({
            message: 'Pet retrieved successfully',
            pet: petData
        });

    } catch (err) {
        console.error('Get pet error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a specific pet
router.put('/:petId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const petId = parseInt(req.params.petId);
        const updates = req.body;

        // Only pet owners can update pets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can update pets.' 
            });
        }

        if (isNaN(petId)) {
            return res.status(400).json({ message: 'Invalid pet ID' });
        }

        // Verify pet exists and belongs to user
        const getPetStmt = db.prepare(`SELECT userid FROM pet WHERE petid = ?`);
        const pet = getPetStmt.get(petId);

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update your own pets.' 
            });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Build update query
        const allowedFields = ['name', 'breed', 'description', 'age', 'dob', 'picture'];
        const petUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                petUpdates[field] = updates[field];
            }
        });

        if (Object.keys(petUpdates).length === 0) {
            db.exec('ROLLBACK');
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const setClause = Object.keys(petUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(petUpdates);
        
        const updatePetStmt = db.prepare(`UPDATE pet SET ${setClause} WHERE petid = ?`);
        updatePetStmt.run(...values, petId);

        db.exec('COMMIT');

        // Get updated pet
        const getUpdatedPetStmt = db.prepare(`
            SELECT petid, name, breed, description, age, dob, picture
            FROM pet 
            WHERE petid = ?
        `);
        
        const updatedPet = getUpdatedPetStmt.get(petId);

        res.status(200).json({
            message: 'Pet updated successfully',
            pet: updatedPet
        });

    } catch (err) {
        console.error('Update pet error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a specific pet
router.delete('/:petId', (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const petId = parseInt(req.params.petId);

        // Only pet owners can delete pets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can delete pets.' 
            });
        }

        if (isNaN(petId)) {
            return res.status(400).json({ message: 'Invalid pet ID' });
        }

        // Start transaction
        db.exec('BEGIN TRANSACTION');

        // Get pet info before deletion and verify ownership
        const getPetStmt = db.prepare(`
            SELECT petid, name, breed, userid 
            FROM pet 
            WHERE petid = ?
        `);
        
        const pet = getPetStmt.get(petId);

        if (!pet) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (pet.userid !== userId) {
            db.exec('ROLLBACK');
            return res.status(403).json({ 
                message: 'Access denied. You can only delete your own pets.' 
            });
        }

        // Delete pet (CASCADE DELETE will handle related records)
        const deletePetStmt = db.prepare(`DELETE FROM pet WHERE petid = ?`);
        const result = deletePetStmt.run(petId);

        if (result.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Pet not found or already deleted' });
        }

        db.exec('COMMIT');

        console.log(`Pet deleted: ${pet.name} (${pet.breed}) by user ${userId}`);

        res.status(200).json({
            message: 'Pet deleted successfully',
            deletedPet: {
                id: pet.petid,
                name: pet.name,
                breed: pet.breed
            }
        });

    } catch (err) {
        console.error('Delete pet error:', err.message);
        db.exec('ROLLBACK');
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
