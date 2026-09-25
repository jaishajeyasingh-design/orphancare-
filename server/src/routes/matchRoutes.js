const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const matchingService = require('../services/matchingService');

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.child) filter.child = req.query.child;

    const list = await matchingService.getMatches(filter);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/trigger', protect, async (req, res) => {
  try {
    const { childId } = req.body;
    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId is required in request body.' });
    }
    const result = await matchingService.triggerAIMatch(childId);
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const match = await matchingService.getMatchById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match record not found.' });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/approve', protect, authorize('Admin'), async (req, res) => {
  try {
    const approvedMatch = await matchingService.approveMatch(req.params.id);
    res.json({
      success: true,
      message: 'Match approved successfully. Opportunity status updated to Assigned.',
      data: approvedMatch
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

router.put('/:id/reject', protect, authorize('Admin'), async (req, res) => {
  try {
    const rejectedMatch = await matchingService.rejectMatch(req.params.id);
    res.json({
      success: true,
      message: 'Match rejected by Admin.',
      data: rejectedMatch
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

module.exports = router;
