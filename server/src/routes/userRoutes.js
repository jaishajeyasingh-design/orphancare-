const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
