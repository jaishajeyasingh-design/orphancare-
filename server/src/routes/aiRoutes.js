const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

router.post('/analyze-needs', protect, async (req, res) => {
  try {
    const { childId } = req.body;
    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId is required in request body.' });
    }
    const result = await aiService.analyzeChildNeeds(childId);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const clientMessage = error.statusCode === 404 ? error.message : 'Unable to analyze child needs';
    res.status(statusCode).json({
      success: false,
      message: clientMessage
    });
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
    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId is required in request body.' });
    }
    const developmentService = require('../services/developmentService');
    const plan = await developmentService.generatePlanForChild(childId);
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

module.exports = router;
