const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Impact = require('../models/Impact');

router.get('/', protect, async (req, res) => {
  try {
    const metrics = await Impact.find();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
