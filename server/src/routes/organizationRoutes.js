const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Organization = require('../models/Organization');

router.get('/', protect, async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
