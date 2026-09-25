const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  anonymizedCode: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  interests: [{ type: String }],
  skills: [{ type: String }],
  aspirations: [{ type: String }],
  educationLevel: { type: String },
  needs: [{
    category: {
      type: String,
      set: (val) => {
        if (!val) return val;
        const normalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        return ['Education', 'Healthcare', 'Mentorship', 'Nutrition', 'Other'].includes(normalized) ? normalized : val;
      },
      enum: ['Education', 'Healthcare', 'Mentorship', 'Nutrition', 'Other']
    },
    description: String,
    urgency: {
      type: String,
      set: (val) => {
        if (!val) return val;
        const normalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        return ['Low', 'Medium', 'High', 'Critical'].includes(normalized) ? normalized : val;
      },
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    }
  }],
  status: { type: String, enum: ['Active', 'Matched', 'Graduated'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Child', childSchema);
