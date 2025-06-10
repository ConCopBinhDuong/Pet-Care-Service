#!/usr/bin/env node
// CLI tool for admin operations
import Database from './src/Database_sqlite.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

const createManager = async () => {
    try {
        console.log('🔐 Pet Care Service - Manager Account Creation Tool\n');

        const name = await question('Manager Name: ');
        const email = await question('Manager Email: ');
        const password = await question('Manager Password (min 8 chars): ');
        const gender = await question('Gender (Male/Female/Other) [Other]: ') || 'Other';

        // Validate
        if (!name || !email || !password) {
            console.log('❌ All fields are required');
            process.exit(1);
        }

        if (password.length < 8) {
            console.log('❌ Password must be at least 8 characters');
            process.exit(1);
        }

        // Check if user exists
        const existingUser = Database.prepare('SELECT userid FROM users WHERE email = ?').get(email);
        if (existingUser) {
            console.log('❌ User with this email already exists');
            process.exit(1);
        }

        // Create account
        const hashedPassword = await bcrypt.hash(password, 12);

        const insertUser = Database.prepare(`
            INSERT INTO users (name, email, password, gender, role, email_verified)
            VALUES (?, ?, ?, ?, 'Manager', 1)
        `);

        const result = insertUser.run(name, email, hashedPassword, gender);

        const insertManager = Database.prepare('INSERT INTO manager (id) VALUES (?)');
        insertManager.run(result.lastInsertRowid);

        console.log('\n✅ Manager account created successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`👤 Name: ${name}`);
        console.log(`🆔 User ID: ${result.lastInsertRowid}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
};

// CLI commands
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case 'create-manager':
        createManager();
        break;
    case 'list-managers':
        const managers = Database.prepare(`
            SELECT u.userid, u.name, u.email, u.created_at
            FROM users u
            JOIN manager m ON u.userid = m.id
        `).all();
        console.log('📋 Existing Managers:');
        managers.forEach(manager => {
            console.log(`  ${manager.userid}: ${manager.name} (${manager.email}) - ${manager.created_at}`);
        });
        break;
    default:
        console.log('Pet Care Service Admin CLI');
        console.log('Commands:');
        console.log('  create-manager    Create a new manager account');
        console.log('  list-managers     List all manager accounts');
        console.log('\nUsage: node admin-cli.js <command>');
}
