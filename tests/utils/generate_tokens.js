import jwt from 'jsonwebtoken';

const JWT_SECRET = "pet_care_service!@#$%^&*()_+";

// Test users with different roles
const testUsers = [
    {
        id: 1,
        role: 'Pet owner',
        name: 'John Doe',
        email: 'petowner@example.com'
    },
    {
        id: 2,
        role: 'Service provider',
        name: 'Jane Smith',
        email: 'provider@example.com'
    },
    {
        id: 3,
        role: 'Manager',
        name: 'Admin User',
        email: 'manager@example.com'
    }
];

console.log('🔑 Generating JWT Tokens for Testing');
console.log('=====================================');

testUsers.forEach(user => {
    const token = jwt.sign(
        { 
            id: user.id, 
            role: user.role,
            email: user.email 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    console.log(`\n${user.role} (${user.email}):`);
    console.log(`ID: ${user.id}`);
    console.log(`Token: ${token}`);
    console.log('-'.repeat(50));
});

// Also create tokens with longer expiration for persistent testing
console.log('\n🔐 Long-Term Testing Tokens (30 days expiration)');
console.log('================================================');

testUsers.forEach(user => {
    const token = jwt.sign(
        { 
            id: user.id, 
            role: user.role,
            email: user.email 
        }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
    );
    
    console.log(`\n${user.role}_LONG_TERM:`);
    console.log(token);
});

export { testUsers, JWT_SECRET };
