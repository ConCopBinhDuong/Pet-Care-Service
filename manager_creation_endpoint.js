// Special manager creation endpoint (add to routes/auth.js)

/**
 * Create manager account (special endpoint)
 * POST /api/auth/create-manager
 * Requires special admin key from environment
 */
router.post('/create-manager', async (req, res) => {
    try {
        const { adminKey, name, email, password, gender } = req.body;

        // Check admin key from environment
        const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY;
        if (!ADMIN_CREATION_KEY || adminKey !== ADMIN_CREATION_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Invalid admin creation key'
            });
        }

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if manager with this email already exists
        const existingUser = db.prepare('SELECT userid FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password, gender, role, email_verified)
            VALUES (?, ?, ?, ?, 'Manager', 1)
        `);

        const result = insertUser.run(name, email, hashedPassword, gender || 'Other');

        // Create manager record
        const insertManager = db.prepare('INSERT INTO manager (id) VALUES (?)');
        insertManager.run(result.lastInsertRowid);

        console.log(`Manager account created: ${email} by admin key`);

        res.status(201).json({
            success: true,
            message: 'Manager account created successfully',
            userId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Create manager error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
