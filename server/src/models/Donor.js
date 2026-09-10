const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supportInterests: [{ type: String }],
  totalDonated: { type: Number, default: 0 },
  sponsoredChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }]
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
