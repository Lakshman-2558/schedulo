require('dotenv').config();
const mongoose = require('mongoose');
const FacultyCredentials = require('../models/FacultyCredentials');
const Hod = require('../models/Hod');
const Admin = require('../models/Admin');

async function checkFacultyUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedulo', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');

        // Check all collections
        console.log('=== FACULTY CREDENTIALS COLLECTION ===');
        const faculties = await FacultyCredentials.find({}).select('-password');
        console.log(`Total Faculty: ${faculties.length}`);
        if (faculties.length > 0) {
            console.log('\nFaculty Members:');
            faculties.forEach((faculty, index) => {
                console.log(`${index + 1}. ${faculty.name}`);
                console.log(`   Email: ${faculty.email}`);
                console.log(`   Employee ID: ${faculty.employeeId}`);
                console.log(`   Subject: ${faculty.subject}`);
                console.log(`   Department: ${faculty.department}`);
                console.log(`   Campus: ${faculty.campus}`);
                console.log(`   Active: ${faculty.isActive}`);
                console.log('');
            });
        }

        console.log('\n=== HOD COLLECTION ===');
        const hods = await Hod.find({}).select('-password');
        console.log(`Total HODs: ${hods.length}`);
        if (hods.length > 0) {
            console.log('\nHODs:');
            hods.forEach((hod, index) => {
                console.log(`${index + 1}. ${hod.name}`);
                console.log(`   Email: ${hod.email}`);
                console.log(`   Employee ID: ${hod.employeeId}`);
                console.log(`   Department: ${hod.department}`);
                console.log(`   Campus: ${hod.campus}`);
                console.log(`   Active: ${hod.isActive}`);
                console.log('');
            });
        }

        console.log('\n=== ADMIN COLLECTION ===');
        const admins = await Admin.find({}).select('-password');
        console.log(`Total Admins: ${admins.length}`);
        if (admins.length > 0) {
            console.log('\nAdmins:');
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.name}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Employee ID: ${admin.employeeId || 'N/A'}`);
                console.log(`   Active: ${admin.isActive}`);
                console.log('');
            });
        }

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkFacultyUsers();
