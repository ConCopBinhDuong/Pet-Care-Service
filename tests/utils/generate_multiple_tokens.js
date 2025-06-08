import jwt from 'jsonwebtoken';

// JWT Secret from .env
const JWT_SECRET = "pet_care_service!@#$%^&*()_+";

// Generate multiple test tokens for different users
const generateTestTokens = () => {
    console.log('=== JWT TOKEN GENERATOR FOR PET CARE SERVICE ===\n');
    
    // User 1: Pet Owner with ID 1
    const petOwner1Token = jwt.sign(
        { 
            id: 1, 
            email: 'petowner1@example.com',
            role: 'Pet owner',
            name: 'John Doe'
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    // User 2: Pet Owner with ID 2  
    const petOwner2Token = jwt.sign(
        { 
            id: 2, 
            email: 'petowner2@example.com',
            role: 'Pet owner',
            name: 'Jane Smith'
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    // User 3: Pet Owner with ID 3
    const petOwner3Token = jwt.sign(
        { 
            id: 3, 
            email: 'petowner3@example.com',
            role: 'Pet owner',
            name: 'Bob Johnson'
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    // User 4: Veterinarian (for testing access control)
    const veterinarianToken = jwt.sign(
        { 
            id: 4, 
            email: 'vet@example.com',
            role: 'Service provider',
            name: 'Dr. Wilson'
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    // User 5: Invalid role (for testing)
    const invalidRoleToken = jwt.sign(
        { 
            id: 5, 
            email: 'invalid@example.com',
            role: 'Manager',
            name: 'Admin User'
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );

    console.log('Pet Owner 1 (ID: 1) JWT Token:');
    console.log(petOwner1Token);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('Pet Owner 2 (ID: 2) JWT Token:');
    console.log(petOwner2Token);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('Pet Owner 3 (ID: 3) JWT Token:');
    console.log(petOwner3Token);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('Veterinarian (ID: 4) JWT Token (should be rejected - Service provider role):');
    console.log(veterinarianToken);
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('Manager (ID: 5) JWT Token (should be rejected - Manager role):');
    console.log(invalidRoleToken);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Return tokens for updating test files
    return {
        petOwner1Token,
        petOwner2Token,
        petOwner3Token,
        veterinarianToken,
        invalidRoleToken
    };
};

// Generate tokens and save to variables
const tokens = generateTestTokens();

console.log('USAGE INSTRUCTIONS:');
console.log('1. Copy the desired token from above');
console.log('2. Use in Authorization header as: Bearer <token>');
console.log('3. Pet Owner tokens should work for /api/pets endpoints');
console.log('4. Service Provider and Manager tokens should be rejected');
console.log('\nTokens are valid for 24 hours from generation time.');
console.log('\nNOTE: Roles used match the database format:');
console.log('- "Pet owner" (with space and capital P)');
console.log('- "Service provider" (with space and capital S)');
console.log('- "Manager" (capital M)');

export default tokens;
