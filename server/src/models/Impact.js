const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema({
  metricName: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String },
  timeframe: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Impact', impactSchema);
