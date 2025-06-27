import express from 'express'
import fs from 'fs';
import path from 'path';
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

        // Process the pets to handle the picture field correctly
        const processedPets = pets.map(pet => {
            let pictureUrl = null;
            
            if (pet.picture) {
                if (Buffer.isBuffer(pet.picture)) {
                    // Convert buffer to string to check if it's a file path
                    const bufferString = pet.picture.toString('utf8');
                    
                    // Check if the buffer contains a file path
                    if (bufferString.includes('uploads/') || bufferString.includes('.png') || bufferString.includes('.jpg') || bufferString.includes('.jpeg')) {
                        // It's a file path - for now, set to null (missing file)
                        // We could try to read the file, but many are missing
                        console.warn(`Pet ${pet.petid} has file path but file may be missing: ${bufferString}`);
                        pictureUrl = null;
                    } else {
                        // Check if it looks like actual binary image data
                        try {
                            const first4Bytes = pet.picture.slice(0, 4);
                            const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
                            const jpegSignature = Buffer.from([0xFF, 0xD8, 0xFF]);
                            
                            if (first4Bytes.equals(pngSignature) || pet.picture.slice(0, 3).equals(jpegSignature)) {
                                // It's actual image data
                                const mimeType = first4Bytes.equals(pngSignature) ? 'image/png' : 'image/jpeg';
                                pictureUrl = `data:${mimeType};base64,${pet.picture.toString('base64')}`;
                            } else {
                                console.warn(`Unrecognized image data format for pet ${pet.petid}`);
                                pictureUrl = null;
                            }
                        } catch (err) {
                            console.warn('Could not process image data for pet', pet.petid, err.message);
                            pictureUrl = null;
                        }
                    }
                } else if (typeof pet.picture === 'string') {
                    // If picture is already a string, check if it's a base64 data URL
                    if (pet.picture.startsWith('data:')) {
                        pictureUrl = pet.picture;
                    } else {
                        // It's likely a file path - set to null for now
                        console.warn(`Pet ${pet.petid} has string file path: ${pet.picture}`);
                        pictureUrl = null;
                    }
                }
            }
            
            return {
                ...pet,
                picture: pictureUrl
            };
        });

        res.status(200).json({
            message: 'Pets retrieved successfully',
            pets: processedPets
        });

    } catch (err) {
        console.error('Get pets error:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new pet for the authenticated pet owner
router.post('/', authMiddleware, async (req, res) => {
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

        // Convert base64 to buffer
        const base64Data = picture.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Convert dob to MySQL date format if provided
        const mysqlDob = dob ? new Date(dob).toISOString().split('T')[0] : null;

        // Use the transaction wrapper for proper transaction handling
        try {
            const newPet = await db.transaction(async (connection) => {
                // Insert new pet with image data directly in BLOB field
                const [result] = await connection.execute(`
                    INSERT INTO pet (name, breed, description, age, dob, picture, userid)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [name, breed, description || null, age || null, mysqlDob, imageBuffer, userId]);

                // Get the newly created pet
                const [petRows] = await connection.execute(`
                    SELECT petid, name, breed, description, age, dob, picture
                    FROM pet 
                    WHERE petid = ?
                `, [result.insertId]);

                // Convert the picture BLOB to base64 for response
                const pet = petRows[0];
                if (pet.picture && Buffer.isBuffer(pet.picture)) {
                    pet.picture = `data:image/png;base64,${pet.picture.toString('base64')}`;
                }

                return pet;
            });

            res.status(201).json({
                success: true,
                message: 'Pet added successfully',
                pet: newPet
            });

        } catch (err) {
            console.error('Add pet error:', err);
            
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

        // Remove userid from response and convert picture BLOB to base64
        const { userid, ...petData } = pet;
        
        // Convert picture BLOB to base64 if it's a Buffer
        if (petData.picture && Buffer.isBuffer(petData.picture)) {
            petData.picture = `data:image/png;base64,${petData.picture.toString('base64')}`;
        }

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
        if (dob) { 
            // Convert ISO date to MySQL date format (YYYY-MM-DD)
            const mysqlDate = new Date(dob).toISOString().split('T')[0];
            updateFields.push('dob = ?'); 
            params.push(mysqlDate); 
        }

        // Handle image upload if provided
        if (picture) {
            if (!validateBase64Image(picture)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid image format or size. Must be JPG/PNG under 5MB'
                });
            }

            // Convert base64 to buffer and add to update fields
            const base64Data = picture.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            updateFields.push('picture = ?');
            params.push(imageBuffer);
        }

        // Use the transaction wrapper for proper transaction handling
        try {
            const updatedPet = await db.transaction(async (connection) => {
                // Update pet record
                const updateQuery = `
                    UPDATE pet 
                    SET ${updateFields.join(', ')}
                    WHERE petid = ? AND userid = ?
                `;
                params.push(petId, userId);

                await connection.execute(updateQuery, params);

                // Get updated pet details
                const [petRows] = await connection.execute(`
                    SELECT petid, name, breed, description, age, dob, picture
                    FROM pet WHERE petid = ?
                `, [petId]);

                const pet = petRows[0];
                
                // Convert picture BLOB to base64 for response
                if (pet.picture && Buffer.isBuffer(pet.picture)) {
                    pet.picture = `data:image/png;base64,${pet.picture.toString('base64')}`;
                }

                return pet;
            });

            res.json({
                success: true,
                message: 'Pet updated successfully',
                pet: updatedPet
            });

        } catch (err) {
            console.error('Update pet error:', err);

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

        // Use the transaction wrapper for proper transaction handling
        try {
            const deletedPet = await db.transaction(async (connection) => {
                // Get pet info before deletion and verify ownership
                const [petRows] = await connection.execute(`
                    SELECT petid, name, breed, userid 
                    FROM pet 
                    WHERE petid = ?
                `, [petId]);
                
                const pet = petRows[0];

                if (!pet) {
                    throw new Error('Pet not found');
                }

                if (pet.userid !== userId) {
                    throw new Error('Access denied. You can only delete your own pets.');
                }

                // Delete pet (CASCADE DELETE will handle related records)
                const [result] = await connection.execute(`DELETE FROM pet WHERE petid = ?`, [petId]);

                if (result.affectedRows === 0) {
                    throw new Error('Pet not found or already deleted');
                }

                return pet;
            });

            console.log(`Pet deleted: ${deletedPet.name} (${deletedPet.breed}) by user ${userId}`);

            res.status(200).json({
                message: 'Pet deleted successfully',
                deletedPet: {
                    id: deletedPet.petid,
                    name: deletedPet.name,
                    breed: deletedPet.breed
                }
            });

        } catch (err) {
            console.error('Delete pet error:', err.message);
            
            if (err.message === 'Pet not found' || err.message === 'Pet not found or already deleted') {
                return res.status(404).json({ message: err.message });
            }
            if (err.message.includes('Access denied')) {
                return res.status(403).json({ message: err.message });
            }
            
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Delete pet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
