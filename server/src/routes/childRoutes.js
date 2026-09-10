const express = require('express');
const router = express.Router();
const childService = require('../services/childService');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const children = await childService.getChildren();
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const child = await childService.createChild(req.body);
    res.status(201).json(child);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const child = await childService.getChildById(req.params.id);
    if (!child) return res.status(404).json({ message: 'Child record not found.' });
    res.json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
