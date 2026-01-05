const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const facultyCredentialsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: 'faculty',
        enum: ['faculty']
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
    campus: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resetOTP: {
        type: String
    },
    resetOTPExpires: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'facultycredentials' // Collection for faculty login credentials
});

// Hash password before saving
facultyCredentialsSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
facultyCredentialsSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('FacultyCredentials', facultyCredentialsSchema);
