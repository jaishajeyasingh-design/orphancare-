const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const opportunityService = require('../services/opportunityService');

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.sponsor) filter.sponsor = req.query.sponsor;

    if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization) {
      filter.organization = req.user.organization;
    } else if (req.query.organization) {
      filter.organization = req.query.organization;
    }

    const list = await opportunityService.getOpportunities(filter);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('Admin', 'Organization', 'Donor', 'Volunteer'), async (req, res) => {
  try {
    const created = await opportunityService.createOpportunity(req.body, req.user);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const opportunity = await opportunityService.getOpportunityById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('Admin', 'Organization', 'Donor', 'Volunteer'), async (req, res) => {
  try {
    const existing = await opportunityService.getOpportunityById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Opportunity not found.' });

    if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization && existing.organization) {
      const uOrg = req.user.organization._id ? req.user.organization._id.toString() : req.user.organization.toString();
      const oOrg = existing.organization._id ? existing.organization._id.toString() : existing.organization.toString();
      if (uOrg !== oOrg) {
        return res.status(404).json({ message: 'Opportunity not found.' });
      }
    }

    const updated = await opportunityService.updateOpportunity(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('Admin', 'Organization'), async (req, res) => {
  try {
    const existing = await opportunityService.getOpportunityById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Opportunity not found.' });

    if (req.user.organization && existing.organization) {
      const uOrg = req.user.organization._id ? req.user.organization._id.toString() : req.user.organization.toString();
      const oOrg = existing.organization._id ? existing.organization._id.toString() : existing.organization.toString();
      if (uOrg !== oOrg) {
        return res.status(404).json({ message: 'Opportunity not found.' });
      }
    }

    const deleted = await opportunityService.deleteOpportunity(req.params.id);
    res.json({ message: 'Opportunity deleted successfully.', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
