const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Donor = require('../models/Donor');

router.get('/', protect, async (req, res) => {
  try {
    const donors = await Donor.find().populate('user', 'name email');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
