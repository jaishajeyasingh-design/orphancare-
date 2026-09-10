const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const DevelopmentPlan = require('../models/DevelopmentPlan');

router.get('/', protect, async (req, res) => {
  try {
    const plans = await DevelopmentPlan.find().populate('child');
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
