const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const developmentService = require('../services/developmentService');

router.get('/', protect, async (req, res) => {
  try {
    const plans = await developmentService.getPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/generate/:childId', protect, async (req, res) => {
  try {
    const plan = await developmentService.generatePlanForChild(req.params.childId);
    res.status(201).json({
      success: true,
      message: 'Development plan generated successfully.',
      data: plan
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

router.get('/child/:childId', protect, async (req, res) => {
  try {
    const plan = await developmentService.getPlanByChild(req.params.childId);
    if (!plan) return res.status(404).json({ message: 'No development plan found for this child.' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/goals', protect, async (req, res) => {
  try {
    const { goalIndex, status } = req.body;
    if (goalIndex === undefined || !status) {
      return res.status(400).json({ success: false, message: 'goalIndex and status are required in request body.' });
    }
    const updatedPlan = await developmentService.updateGoalStatus(req.params.id, goalIndex, status);
    res.json({
      success: true,
      message: 'Goal status updated successfully.',
      data: updatedPlan
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

module.exports = router;
