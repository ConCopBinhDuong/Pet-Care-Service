import express from 'express'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js'
import { validatePetCreation, validatePetUpdate } from '../middleware/validationMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


// Helper function to validate base64 image
const validateBase64Image = (base64String) => {
    if (!base64String) return false;
    
    // Check if it's a valid base64 image format
    const isValidFormat = /^data:image\/(jpeg|jpg|png);base64,/.test(base64String);
    if (!isValidFormat) return false;
    
    // Check file size (5MB limit)
    const base64Data = base64String.split(',')[1];
    const fileSize = (base64Data.length * 3) / 4; // Approximate size in bytes
    return fileSize <= 5 * 1024 * 1024; // 5MB limit
};

// Get all pets for the authenticated pet owner
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

        // Only pet owners can access this endpoint
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                message: 'Access denied. Only pet owners can manage pets.' 
            });
        }

        const pets = await db.all(`
            SELECT petid, name, breed, description, age, dob, picture
            FROM pet 
            WHERE userid = ?
            ORDER BY name ASC
        `, [userId]);

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
router.post('/', authMiddleware, async (req, res) => {
    let filepath = null;
    try {
        const { userid: userId, role: userRole } = req.user;
        const { name, breed, age, description, dob, picture } = req.body; // picture is now base64

        // Validate required fields
        if (!name || !breed) {
            return res.status(400).json({
                success: false,
                error: 'Name and breed are required'
            });
        }

        // Validate image
        if (!picture || !validateBase64Image(picture)) {
            return res.status(400).json({
                success: false,
                error: 'Valid pet picture (base64) is required. Must be JPG/PNG under 5MB'
            });
        }

        // Only pet owners can add pets
        if (userRole !== 'Pet owner') {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Only pet owners can add pets.' 
            });
        }

        // Verify pet owner status in database
        const petOwner = await db.get('SELECT id FROM petowner JOIN user ON id = userid WHERE id = ?', [userId]);

        if (!petOwner) {
            return res.status(403).json({ 
                success: false,
                message: 'User is not registered as a pet owner.' 
            });
        }

       // Handle base64 image
        const uploadDir = 'uploads/pets';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = picture.match(/^data:image\/(jpeg|jpg|png)/)[1];
        const filename = `pet-${uniqueSuffix}.${fileExtension}`;
        filepath = path.join(uploadDir, filename);

        // Convert base64 to buffer
        const base64Data = picture.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Start transaction
        try {
            await db.beginTransaction();

            // Save file to disk
            fs.writeFileSync(filepath, imageBuffer);

            // Insert new pet
            const relativePath = filepath.replace(/\\/g, '/');
            const result = await db.execute(`
                INSERT INTO pet (name, breed, description, age, dob, picture, userid)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [name, breed, description || null, age || null, dob || null, relativePath, userId]);

            // Get the newly created pet
            const newPet = await db.get(`
                SELECT petid, name, breed, description, age, dob, picture
                FROM pet 
                WHERE petid = ?
            `, [result.insertId]);

            // Commit transaction
            await db.commit();

            res.status(201).json({
                success: true,
                message: 'Pet added successfully',
                pet: newPet
            });

        } catch (err) {
            console.error('Add pet error:', err);
            
            // Rollback transaction if active
            try {
                await db.rollback();
            } catch (rollbackErr) {
                console.error('Rollback error:', rollbackErr);
            }
            
            // Clean up uploaded file if exists
            if (filepath && fs.existsSync(filepath)) {
                try {
                    fs.unlinkSync(filepath);
                } catch (unlinkErr) {
                    console.error('File cleanup error:', unlinkErr);
                }
            }
            
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ 
                    success: false,
                    message: 'Pet with this name already exists' 
                });
            }
            
            res.status(500).json({ 
                success: false,
                message: 'Internal server error',
                error: err.message 
            });
        }

    } catch (error) {
        console.error('Outer pet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add pet',
            error: error.message
        });
    }
});

// Get a specific pet by ID
router.get('/:petId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        const pet = await db.get(`
            SELECT petid, name, breed, description, age, dob, picture, userid
            FROM pet 
            WHERE petid = ?
        `, [petId]);

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

router.put('/:id', authMiddleware, async (req, res) => {
    let newFilepath = null;
    let oldPicturePath = null;
    
    try {
        const petId = req.params.id;
        const { userid: userId, role: userRole } = req.user;
        const { name, breed, age, description, dob, picture } = req.body;

        // Verify user role
        if (userRole !== 'Pet owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only pet owners can update pets.'
            });
        }

        // Get existing pet and verify ownership
        const existingPet = await db.get(`
            SELECT * FROM pet WHERE petid = ? AND userid = ?
        `, [petId, userId]);

        if (!existingPet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found or not owned by user'
            });
        }

        // Start building update query
        let updateFields = [];
        let params = [];

        // Handle basic fields
        if (name) { updateFields.push('name = ?'); params.push(name); }
        if (breed) { updateFields.push('breed = ?'); params.push(breed); }
        if (age) { updateFields.push('age = ?'); params.push(age); }
        if (description) { updateFields.push('description = ?'); params.push(description); }
        if (dob) { updateFields.push('dob = ?'); params.push(dob); }

        // Handle image upload if provided
         if (picture) {
            if (!validateBase64Image(picture)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid image format or size. Must be JPG/PNG under 5MB'
                });
            }

            const uploadDir = 'uploads/pets';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = picture.match(/^data:image\/(jpeg|jpg|png)/)[1];
            const filename = `pet-${uniqueSuffix}.${fileExtension}`;
            newFilepath = path.join(uploadDir, filename);
            
            // Store old picture path for cleanup
            oldPicturePath = existingPet.picture;
            
            // Add picture to update fields
            const relativePath = newFilepath.replace(/\\/g, '/');
            updateFields.push('picture = ?');
            params.push(relativePath);
        }

        // Start transaction
        try {
            await db.beginTransaction();

            // Save new image if exists
            if (picture) {
                const base64Data = picture.split(',')[1];
                const imageBuffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(newFilepath, imageBuffer);
            }

            // Update pet record
            const updateQuery = `
                UPDATE pet 
                SET ${updateFields.join(', ')}
                WHERE petid = ? AND userid = ?
            `;
            params.push(petId, userId);

            await db.execute(updateQuery, params);

        // Delete old image if it was updated
        if (oldPicturePath && fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
        }

            // Delete old image if it was updated
            if (oldPicturePath && fs.existsSync(oldPicturePath)) {
                fs.unlinkSync(oldPicturePath);
            }

            // Get updated pet details
            const updatedPet = await db.get(`
                SELECT petid, name, breed, description, age, dob, picture
                FROM pet WHERE petid = ?
            `, [petId]);

            // Commit transaction
            await db.commit();

            res.json({
                success: true,
                message: 'Pet updated successfully',
                pet: updatedPet
            });

        } catch (err) {
            console.error('Update pet error:', err);
            
            // Rollback transaction
            try {
                await db.rollback();
            } catch (rollbackErr) {
                console.error('Rollback error:', rollbackErr);
            }

            // Clean up new uploaded file if exists
            if (newFilepath && fs.existsSync(newFilepath)) {
                try {
                    fs.unlinkSync(newFilepath);
                } catch (unlinkErr) {
                    console.error('File cleanup error:', unlinkErr);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update pet',
                error: err.message
            });
        }
    } catch (error) {
        console.error('Update pet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update pet',
            error: error.message
        });
    }
});

// Delete a specific pet
router.delete('/:petId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;
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
        try {
            await db.beginTransaction();

            // Get pet info before deletion and verify ownership
            const pet = await db.get(`
                SELECT petid, name, breed, userid 
                FROM pet 
                WHERE petid = ?
            `, [petId]);

            if (!pet) {
                await db.rollback();
                return res.status(404).json({ message: 'Pet not found' });
            }

            if (pet.userid !== userId) {
                await db.rollback();
                return res.status(403).json({ 
                    message: 'Access denied. You can only delete your own pets.' 
                });
            }

            // Delete pet (CASCADE DELETE will handle related records)
            const result = await db.execute(`DELETE FROM pet WHERE petid = ?`, [petId]);

            if (result.affectedRows === 0) {
                await db.rollback();
                return res.status(404).json({ message: 'Pet not found or already deleted' });
            }

            await db.commit();

        console.log(`Pet deleted: ${pet.name} (${pet.breed}) by user ${userId}`);

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
            await db.rollback();
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Delete pet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
