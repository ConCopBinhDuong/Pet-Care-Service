import express from 'express'  
import bcrypt from 'bcryptjs' 
import jwt from  'jsonwebtoken' 
import db from '../../petcare_Database_sqlite.js'
import { validateRegistration, validateLogin } from '../../middleware/validationMiddleware.js'

const router  = express.Router() ; 


//Register handle 
router.post('/petowner/register', validateRegistration, (req, res) => {
    const { username, email, password, gender, role } = req.body;

    // All validation is handled by validateRegistration middleware
    // No need for manual checks here
    
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        
        db.exec('BEGIN TRANSACTION');

     
        const insertUser = db.prepare(`INSERT INTO users(name, email, password, gender, role) VALUES(?, ?, ?, ?, ?)`);
        const result = insertUser.run(username, email, hashedPassword, gender, role);
        const userId = result.lastInsertRowid;


        if (role === 'Pet owner') {
            const { phone, city, address } = req.body;
            // Validation middleware already checked these fields exist and are valid
            
            const insertPetOwner = db.prepare(`INSERT INTO petowner(id, phone, city, address) VALUES(?, ?, ?, ?)`);
            insertPetOwner.run(userId, phone, city, address);

        } else if (role === 'Service provider') {
            const { bussiness_name, logo, phone, description, address, website } = req.body;
            // Validation middleware already checked required fields
            
            const insertProvider = db.prepare(`
                INSERT INTO serviceprovider(id, bussiness_name, logo, phone, description, address, website)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            insertProvider.run(userId, bussiness_name, logo || null, phone, description || null, address, website || null);

        }


        db.exec('COMMIT');

        
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(201).json({ token, message: 'Registration successful. Welcome!' });

    } catch (err) {
        console.error(err.message);
        db.exec('ROLLBACK');

        if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        return res.sendStatus(503); // Service unavailable
    }
});


router.post('/petowner/login', validateLogin, (req, res) => {
    const { username, password } = req.body;

    // Validation middleware already handles empty field checks
    
    try {
        // Query by email (username field contains email)
        const getUser = db.prepare(`SELECT * FROM users WHERE email = ?`);
        const user = getUser.get(username);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const correctPassword = bcrypt.compareSync(password, user.password);

        if (!correctPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        console.log('User logged in:', user.email);
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
        
        res.status(200).json({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: "Login successful"
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(503).json({ message: "Service temporarily unavailable" });
    }
}); 

export default router ; 