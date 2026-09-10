const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const matchingService = require('../services/matchingService');

router.get('/', protect, async (req, res) => {
  try {
    const list = await matchingService.getMatches();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/trigger', protect, async (req, res) => {
  try {
    const { childId } = req.body;
    const match = await matchingService.triggerAIMatch(childId);
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
