const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiConfidenceScore: { type: Number, default: 0 },
  aiRecommendationReason: { type: String },
  status: { type: String, enum: ['Pending_Admin_Review', 'Approved', 'Rejected'], default: 'Pending_Admin_Review' }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
