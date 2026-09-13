const express = require('express');
const router = express.Router();
const childService = require('../services/childService');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.organization) filter.organization = req.query.organization;

    const children = await childService.getChildren(filter);
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('Admin', 'Organization'), async (req, res) => {
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

router.put('/:id', protect, authorize('Admin', 'Organization'), async (req, res) => {
  try {
    const updatedChild = await childService.updateChild(req.params.id, req.body);
    if (!updatedChild) return res.status(404).json({ message: 'Child record not found.' });
    res.json(updatedChild);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const deletedChild = await childService.deleteChild(req.params.id);
    if (!deletedChild) return res.status(404).json({ message: 'Child record not found.' });
    res.json({ message: 'Child profile deleted successfully.', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
