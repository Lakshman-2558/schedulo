require('dotenv').config();
const mongoose = require('mongoose');
const { findUserForLogin } = require('../utils/userHelper');

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedulo', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');
        console.log('🔍 Testing login for Employee ID: FAC001\n');

        // Test finding user
        const userResult = await findUserForLogin('FAC001');

        if (!userResult || !userResult.user) {
            console.log('❌ User not found!');
            console.log('   This means the faculty is not in the database or not in the correct collection.');
        } else {
            console.log('✅ User found!');
            console.log('   Name:', userResult.user.name);
            console.log('   Email:', userResult.user.email);
            console.log('   Employee ID:', userResult.user.employeeId);
            console.log('   Role:', userResult.role);
            console.log('   Model:', userResult.model.modelName);
            console.log('   Has password:', !!userResult.user.password);
            console.log('   Is Active:', userResult.user.isActive);

            // Test password comparison
            console.log('\n🔐 Testing password comparison...');
            const isMatch = await userResult.user.comparePassword('password123');
            console.log('   Password "password123" matches:', isMatch);
        }

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testLogin();
