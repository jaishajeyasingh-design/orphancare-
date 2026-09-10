const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const opportunityService = require('../services/opportunityService');

router.get('/', protect, async (req, res) => {
  try {
    const list = await opportunityService.getOpportunities();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const created = await opportunityService.createOpportunity(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
