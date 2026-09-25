const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const impactService = require('../services/impactService');

// GET /api/impact/summary - Real-time aggregate impact dashboard metrics
router.get('/summary', protect, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    const summary = await impactService.getImpactSummary(timeframe);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/impact/metrics - Preserved legacy/saved impact metrics endpoint
router.get('/metrics', protect, async (req, res) => {
  try {
    const metrics = await impactService.getSavedMetrics();
    res.json(metrics);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// POST /api/impact/metrics - Admin logged impact metric
router.post('/metrics', protect, authorize('Admin'), async (req, res) => {
  try {
    const metric = await impactService.saveMetric(req.body);
    res.status(201).json({
      success: true,
      data: metric
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

// GET /api/impact - Root compatibility route returning summary
router.get('/', protect, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    const summary = await impactService.getImpactSummary(timeframe);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

module.exports = router;
