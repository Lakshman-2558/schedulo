const mongoose = require('mongoose');

const facultyUploadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        trim: true
    },
    subjects: [{
        type: String,
        trim: true
    }],
    campus: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    availability: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        timeSlots: [{
            start: String,
            end: String
        }]
    }],
    maxHoursPerDay: {
        type: Number,
        default: 6
    },
    isActive: {
        type: Boolean,
        default: true
    },
    uploadedViaExcel: {
        type: Boolean,
        default: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'facultyuploads' // Collection for faculty uploaded via CSV/Excel
});

module.exports = mongoose.model('FacultyUpload', facultyUploadSchema);
