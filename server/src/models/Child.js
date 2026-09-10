const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  anonymizedCode: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  interests: [{ type: String }],
  skills: [{ type: String }],
  needs: [{
    category: { type: String, enum: ['Education', 'Healthcare', 'Mentorship', 'Nutrition', 'Other'] },
    description: String,
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' }
  }],
  status: { type: String, enum: ['Active', 'Matched', 'Graduated'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Child', childSchema);
