const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Progress = require('../models/Progress');

router.get('/', protect, async (req, res) => {
  try {
    const list = await Progress.find().populate('child').populate('loggedBy', 'name');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
