const mongoose = require('mongoose');
const Allocation = require('../models/Allocation');
const FacultyUpload = require('../models/FacultyUpload');
const { FacultyCredentials } = require('../utils/userHelper');
require('dotenv').config();

/**
 * Migration Script: Fix Faculty References in Allocations
 * 
 * This script converts all allocation.faculty references from FacultyUpload IDs
 * to FacultyCredentials IDs by matching email addresses.
 * 
 * This ensures faculty can see their allocations when they log in.
 */

async function migrateAllocations() {
    try {
        console.log('🔄 Starting allocation migration...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedulo');
        console.log('✅ Connected to MongoDB\n');

        // Get all allocations
        const allocations = await Allocation.find({});
        console.log(`📋 Found ${allocations.length} allocation(s) to process\n`);

        let updated = 0;
        let skipped = 0;
        let errors = 0;
        const errorDetails = [];

        for (const allocation of allocations) {
            try {
                // Get FacultyUpload
                const facultyUpload = await FacultyUpload.findById(allocation.faculty);

                if (!facultyUpload) {
                    console.log(`⚠️  Allocation ${allocation._id}: FacultyUpload not found (ID: ${allocation.faculty})`);
                    skipped++;
                    continue;
                }

                // Find FacultyCredentials by email
                const facultyCredentials = await FacultyCredentials.findOne({
                    email: facultyUpload.email.toLowerCase().trim()
                });

                if (!facultyCredentials) {
                    const errorMsg = `Allocation ${allocation._id}: No credentials found for email ${facultyUpload.email} (Employee: ${facultyUpload.name})`;
                    console.log(`❌ ${errorMsg}`);
                    errorDetails.push(errorMsg);
                    errors++;
                    continue;
                }

                // Check if already using FacultyCredentials ID
                if (allocation.faculty.toString() === facultyCredentials._id.toString()) {
                    console.log(`✓  Allocation ${allocation._id}: Already using FacultyCredentials ID`);
                    skipped++;
                    continue;
                }

                // Update allocation to point to FacultyCredentials
                allocation.faculty = facultyCredentials._id;
                await allocation.save();

                console.log(`✅ Allocation ${allocation._id}: Updated ${facultyUpload.name} (${facultyUpload.email}) → FacultyCredentials ID`);
                updated++;

            } catch (error) {
                const errorMsg = `Allocation ${allocation._id}: ${error.message}`;
                console.error(`❌ ${errorMsg}`);
                errorDetails.push(errorMsg);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`Total allocations: ${allocations.length}`);
        console.log(`✅ Updated: ${updated}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log('='.repeat(60));

        if (errorDetails.length > 0) {
            console.log('\n⚠️  Error Details:');
            errorDetails.forEach((err, index) => {
                console.log(`${index + 1}. ${err}`);
            });
            console.log('\n💡 Tip: Upload faculty credentials for these faculty members first.');
        }

        if (updated > 0) {
            console.log('\n✅ Migration completed successfully!');
            console.log('Faculty should now be able to see their allocations in the dashboard.');
        } else if (errors === 0 && skipped === allocations.length) {
            console.log('\n✅ All allocations already using correct faculty references!');
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
        process.exit(0);
    }
}

// Run migration
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   Faculty Allocation Migration Script                    ║');
console.log('║   Converts FacultyUpload IDs → FacultyCredentials IDs     ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

migrateAllocations();
