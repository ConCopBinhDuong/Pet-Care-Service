import db from './src/Database_sqlite.js';

console.log('🔍 Checking database state after service submission');

try {
    // Check all services
    console.log('\n1. All services in database:');
    const allServices = db.prepare('SELECT * FROM service ORDER BY serviceid').all();
    console.log('Total services:', allServices.length);
    allServices.forEach(service => {
        console.log(`  ID: ${service.serviceid}, Name: ${service.name}, Status: ${service.status}, Provider: ${service.providerid}`);
    });

    // Check service types
    console.log('\n2. Service types:');
    const serviceTypes = db.prepare('SELECT * FROM servicetype').all();
    serviceTypes.forEach(type => {
        console.log(`  ID: ${type.typeid}, Type: ${type.type}`);
    });

    // Check time slots for the new service
    console.log('\n3. Time slots for service ID 4:');
    const timeSlots = db.prepare('SELECT * FROM timeslot WHERE serviceid = 4').all();
    timeSlots.forEach(slot => {
        console.log(`  Service: ${slot.serviceid}, Slot: ${slot.slot}`);
    });

    // Check users and their roles
    console.log('\n4. Users and roles:');
    const users = db.prepare('SELECT userid, name, email, role FROM users').all();
    users.forEach(user => {
        console.log(`  ID: ${user.userid}, Name: ${user.name}, Role: ${user.role}`);
    });

} catch (error) {
    console.error('❌ Database check failed:', error);
}
