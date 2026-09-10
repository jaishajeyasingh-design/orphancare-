const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Scholarship', 'Mentorship', 'Educational', 'Medical', 'Equipment'], required: true },
  description: { type: String, required: true },
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Open', 'Assigned', 'Completed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
