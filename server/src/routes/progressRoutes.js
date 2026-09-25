const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const progressService = require('../services/progressService');

// GET /api/progress - List all progress records
router.get('/', protect, async (req, res) => {
  try {
    const list = await progressService.getAllProgress();
    res.json(list);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// POST /api/progress - Create new progress record
router.post('/', protect, async (req, res) => {
  try {
    const progress = await progressService.createProgress(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Progress recorded successfully.',
      data: progress
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/progress/child/:childId - Get progress records for a child
router.get('/child/:childId', protect, async (req, res) => {
  try {
    const records = await progressService.getProgressByChild(req.params.childId);
    res.json(records);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/progress/:id - Get single progress record
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await progressService.getProgressById(req.params.id);
    res.json(record);
  } catch (error) {
    const statusCode = error.statusCode || 404;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// PUT /api/progress/:id - Update progress record
router.put('/:id', protect, async (req, res) => {
  try {
    const updated = await progressService.updateProgress(req.params.id, req.body, req.user);
    res.json({
      success: true,
      message: 'Progress updated successfully.',
      data: updated
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// DELETE /api/progress/:id - Delete progress record
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await progressService.deleteProgress(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

module.exports = router;
