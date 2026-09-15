const express = require('express');
const router = express.Router();
const childService = require('../services/childService');
const { protect, authorize } = require('../middleware/authMiddleware');

const sanitizeChildForVolunteer = (childDoc) => {
  if (!childDoc) return null;
  const child = typeof childDoc.toObject === 'function' ? childDoc.toObject() : { ...childDoc };
  return {
    _id: child._id,
    anonymizedCode: child.anonymizedCode,
    age: child.age,
    gender: child.gender,
    educationLevel: child.educationLevel,
    interests: child.interests || [],
    skills: child.skills || [],
    aspirations: child.aspirations || [],
    needs: (child.needs || []).map(n => ({
      _id: n._id,
      category: n.category,
      description: n.description,
      urgency: n.urgency
    })),
    status: child.status,
    organization: child.organization
  };
};

const checkOrgMatch = (userOrg, resourceOrg) => {
  if (!userOrg) return true; // Superadmin / general admin without org assignment
  if (!resourceOrg) return false;
  const uId = userOrg._id ? userOrg._id.toString() : userOrg.toString();
  const rId = resourceOrg._id ? resourceOrg._id.toString() : resourceOrg.toString();
  return uId === rId;
};

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    
    // Admin / Organization: restrict to their own organization if specified on user
    if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization) {
      filter.organization = req.user.organization;
    } else if (req.query.organization) {
      filter.organization = req.query.organization;
    }

    let children = await childService.getChildren(filter);
    
    if (req.user.role === 'Volunteer') {
      children = children.map(sanitizeChildForVolunteer);
    }
    
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('Admin', 'Organization'), async (req, res) => {
  try {
    const childData = { ...req.body };
    if (req.user.organization && !childData.organization) {
      childData.organization = req.user.organization;
    }
    const child = await childService.createChild(childData);
    res.status(201).json(child);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const child = await childService.getChildById(req.params.id);
    if (!child) return res.status(404).json({ message: 'Child record not found.' });

    if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization) {
      if (!checkOrgMatch(req.user.organization, child.organization)) {
        return res.status(404).json({ message: 'Child record not found.' });
      }
    }

    if (req.user.role === 'Volunteer') {
      return res.json(sanitizeChildForVolunteer(child));
    }

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('Admin', 'Organization'), async (req, res) => {
  try {
    const existing = await childService.getChildById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Child record not found.' });

    if (req.user.organization && !checkOrgMatch(req.user.organization, existing.organization)) {
      return res.status(404).json({ message: 'Child record not found.' });
    }

    const updatedChild = await childService.updateChild(req.params.id, req.body);
    res.json(updatedChild);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('Admin', 'Organization'), async (req, res) => {
  try {
    const existing = await childService.getChildById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Child record not found.' });

    if (req.user.organization && !checkOrgMatch(req.user.organization, existing.organization)) {
      return res.status(404).json({ message: 'Child record not found.' });
    }

    const deletedChild = await childService.deleteChild(req.params.id);
    res.json({ message: 'Child profile deleted successfully.', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
