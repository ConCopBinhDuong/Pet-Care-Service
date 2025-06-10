// Database seeding for manager accounts
import Database from './src/Database_sqlite.js';
import bcrypt from 'bcryptjs';

const seedManagerAccounts = async () => {
    try {
        console.log('🔐 Seeding manager accounts...');

        // Check if any managers exist
        const managerCheck = Database.prepare('SELECT COUNT(*) as count FROM manager').get();
        if (managerCheck.count > 0) {
            console.log('✅ Manager accounts already exist. Skipping.');
            return;
        }

        // Create default manager account
        const hashedPassword = await bcrypt.hash('SuperSecureAdminPass123!', 12);

        const insertUser = Database.prepare(`
            INSERT INTO users (name, email, password, gender, role, email_verified)
            VALUES (?, ?, ?, ?, ?, 1)
        `);

        const managerUser = insertUser.run(
            'System Administrator',
            'admin@petcare.com',
            hashedPassword,
            'Other',
            'Manager'
        );

        const insertManager = Database.prepare(`
            INSERT INTO manager (id) VALUES (?)
        `);
        insertManager.run(managerUser.lastInsertRowid);

        console.log('✅ Manager account created successfully!');
        console.log('📧 Email: admin@petcare.com');
        console.log('🔑 Password: SuperSecureAdminPass123!');
        console.log('⚠️  IMPORTANT: Change this password immediately after first login!');

    } catch (error) {
        console.error('❌ Error seeding manager accounts:', error.message);
    }
};

seedManagerAccounts();
