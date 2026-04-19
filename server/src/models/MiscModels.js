const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['Food', 'Medical', 'Education', 'Donation'], required: true },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Active', 'Fulfilled'], default: 'Active' }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Donation', 'Sponsorship', 'Fee'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // Can be Resident ID, Requirement ID
    transactionId: { type: String },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }
}, { timestamps: true });

const volunteerActivitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' }
}, { timestamps: true });

const volunteerApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'VolunteerActivity', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const adoptionRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true }, // The Child
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    notes: { type: String }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date },
    expectedReturnDate: { type: Date },
    type: { type: String, enum: ['Present', 'Absence', 'Medical Leave'], default: 'Present' }
}, { timestamps: true });

module.exports = {
    Requirement: mongoose.model('Requirement', requirementSchema),
    Payment: mongoose.model('Payment', paymentSchema),
    VolunteerActivity: mongoose.model('VolunteerActivity', volunteerActivitySchema),
    VolunteerApplication: mongoose.model('VolunteerApplication', volunteerApplicationSchema),
    AdoptionRequest: mongoose.model('AdoptionRequest', adoptionRequestSchema),
    Attendance: mongoose.model('Attendance', attendanceSchema)
};
