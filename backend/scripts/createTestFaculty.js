require('dotenv').config();
const mongoose = require('mongoose');
const FacultyCredentials = require('../models/FacultyCredentials');

async function createTestFaculty() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedulo', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');

        // Check if test faculty already exists
        const existingFaculty = await FacultyCredentials.findOne({ email: 'faculty@test.com' });

        if (existingFaculty) {
            console.log('⚠️  Test faculty already exists. Deleting...');
            await FacultyCredentials.deleteOne({ email: 'faculty@test.com' });
        }

        // Create test faculty
        const faculty = await FacultyCredentials.create({
            name: 'Test Faculty',
            email: 'faculty@test.com',
            password: 'password123',
            role: 'faculty',
            employeeId: 'FAC001',
            department: 'CSE',
            subject: 'Data Structures',
            subjects: ['Data Structures', 'Algorithms'],
            campus: 'Main Campus',
            phone: '1234567890',
            isActive: true
        });

        console.log('✅ Test faculty created successfully!');
        console.log('📧 Email:', faculty.email);
        console.log('🔑 Password: password123');
        console.log('🆔 Employee ID:', faculty.employeeId);
        console.log('👤 Name:', faculty.name);
        console.log('🏫 Department:', faculty.department);
        console.log('📚 Subject:', faculty.subject);
        console.log('\n🔐 Login Credentials:');
        console.log('   Employee ID: FAC001');
        console.log('   Password: password123');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestFaculty();
