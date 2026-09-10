const mongoose = require('mongoose');

const developmentPlanSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  title: { type: String, required: true },
  goals: [{
    description: String,
    targetDate: Date,
    status: { type: String, enum: ['Pending', 'In_Progress', 'Achieved'], default: 'Pending' }
  }],
  createdViaAI: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DevelopmentPlan', developmentPlanSchema);
