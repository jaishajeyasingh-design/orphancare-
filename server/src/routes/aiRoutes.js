const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

router.post('/analyze-needs', protect, async (req, res) => {
  try {
    const { childId, rawData } = req.body;
    const result = await aiService.analyzeChildNeeds(childId, rawData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/match', protect, async (req, res) => {
  try {
    const { childId } = req.body;
    const result = await aiService.runMatching(childId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/development-plan', protect, async (req, res) => {
  try {
    const { childId } = req.body;
    const result = await aiService.generateDevelopmentPlan(childId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
