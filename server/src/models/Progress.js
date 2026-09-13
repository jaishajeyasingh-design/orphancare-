const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Academic', 'Health', 'Skill', 'Behavioral'], required: true },
  notes: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  developmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'DevelopmentPlan' },
  goalIndex: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
