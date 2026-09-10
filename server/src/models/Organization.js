const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
