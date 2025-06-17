import express from 'express'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../Database_sqlite.js'
import { validatePetCreation, validatePetUpdate } from '../middleware/validationMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


//helper function to check for valid image file
// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
})

// Get all pets for the authenticated pet owner
router.get('/', (req, res) => {
    try {
        const userId = req.user.userid;
        const userRole = req.user.role;

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
router.post('/', authMiddleware, upload.single('picture'), async (req, res) => {
    let filepath = null;
    try {
        const { userid: userId, role: userRole } = req.user;
        const { name, breed, age, description, dob } = req.body;

        // Validate required fields
        if (!name || !breed) {
            return res.status(400).json({
                success: false,
                error: 'Name and breed are required'
            });
        }

        // Check image upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Pet picture is required'
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
        const checkPetOwnerStmt = db.prepare('SELECT id FROM petowner JOIN users ON id = userid WHERE id = ?');
        const petOwner = checkPetOwnerStmt.get(userId);

        if (!petOwner) {
            return res.status(403).json({ 
                success: false,
                message: 'User is not registered as a pet owner.' 
            });
        }

        // Handle file upload
        const uploadDir = 'uploads/pets';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `pet-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        filepath = path.join(uploadDir, filename);
        
        // Start transaction
        db.prepare('BEGIN').run();

        // Save file to disk
        fs.writeFileSync(filepath, req.file.buffer);

        // Insert new pet
        const insertPetStmt = db.prepare(`
            INSERT INTO pet (name, breed, description, age, dob, picture, userid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const relativePath = filepath.replace(/\\/g, '/');
        const result = insertPetStmt.run(
            name, 
            breed, 
            description || null,
            age || null,
            dob || null, 
            relativePath,
            userId
        );

        // Get the newly created pet
        const getNewPetStmt = db.prepare(`
            SELECT petid, name, breed, description, age, dob, picture
            FROM pet 
            WHERE petid = ?
        `);
        
        const newPet = getNewPetStmt.get(result.lastInsertRowid);

        // Commit transaction
        db.prepare('COMMIT').run();

        res.status(201).json({
            success: true,
            message: 'Pet added successfully',
            pet: newPet
        });

    } catch (err) {
        console.error('Add pet error:', err);
        
        // Rollback transaction if active
        try {
            db.prepare('ROLLBACK').run();
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
});

// Get a specific pet by ID
router.get('/:petId', (req, res) => {
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

router.put('/:id', authMiddleware, upload.single('picture'), async (req, res) => {
    let newFilepath = null;
    let oldPicturePath = null;
    
    try {
        const petId = req.params.id;
        const { userid: userId, role: userRole } = req.user;
        const { name, breed, age, description, dob } = req.body;

        // Verify user role
        if (userRole !== 'Pet owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only pet owners can update pets.'
            });
        }

        // Get existing pet and verify ownership
        const getPetStmt = db.prepare(`
            SELECT * FROM pet WHERE petid = ? AND userid = ?
        `);
        const existingPet = getPetStmt.get(petId, userId);

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
        if (req.file) {
            const uploadDir = 'uploads/pets';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `pet-${uniqueSuffix}${path.extname(req.file.originalname)}`;
            newFilepath = path.join(uploadDir, filename);
            
            // Store old picture path for cleanup
            oldPicturePath = existingPet.picture;
            
            // Add picture to update fields
            const relativePath = newFilepath.replace(/\\/g, '/');
            updateFields.push('picture = ?');
            params.push(relativePath);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        // Start transaction
        db.prepare('BEGIN').run();

        // Save new image if exists
        if (req.file) {
            fs.writeFileSync(newFilepath, req.file.buffer);
        }

        // Update pet record
        const updateQuery = `
            UPDATE pet 
            SET ${updateFields.join(', ')}
            WHERE petid = ? AND userid = ?
        `;
        params.push(petId, userId);

        const updateStmt = db.prepare(updateQuery);
        updateStmt.run(...params);

        // Delete old image if it was updated
        if (oldPicturePath && fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
        }

        // Get updated pet details
        const getUpdatedPetStmt = db.prepare(`
            SELECT petid, name, breed, description, age, dob, picture
            FROM pet WHERE petid = ?
        `);
        const updatedPet = getUpdatedPetStmt.get(petId);

        // Commit transaction
        db.prepare('COMMIT').run();

        res.json({
            success: true,
            message: 'Pet updated successfully',
            pet: updatedPet
        });

    } catch (err) {
        console.error('Update pet error:', err);
        
        // Rollback transaction
        try {
            db.prepare('ROLLBACK').run();
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
});

// Delete a specific pet
router.delete('/:petId', (req, res) => {
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
