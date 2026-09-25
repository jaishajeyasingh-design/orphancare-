const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Scholarship', 'Mentorship', 'Educational', 'Medical', 'Equipment'], required: true },
  description: { type: String, required: true },
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  status: { type: String, enum: ['Open', 'Assigned', 'Completed'], default: 'Open' },
  // Matching & Eligibility fields
  supportCategories: [{ type: String }],
  requiredSkills: [{ type: String }],
  targetInterests: [{ type: String }],
  eligibility: {
    minAge: { type: Number },
    maxAge: { type: Number },
    educationLevel: { type: String },
    notes: { type: String }
  },
  availability: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
