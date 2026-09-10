const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String }],
  availabilityHoursPerWeek: { type: Number, default: 2 },
  assignedMentorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }]
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
