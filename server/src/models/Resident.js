const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Orphan Child', 'Free Elderly', 'Paid Elderly'],
        required: true
    },
    healthCondition: {
        type: String,
        default: 'Healthy'
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Deceased', 'Adopted'],
        default: 'Active'
    },
    // Specific to children
    educationStatus: {
        type: String
    },
    adoptionEligibility: {
        type: Boolean,
        default: false
    },
    // Specific to paid elderly
    guardianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    monthlyFee: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
