const express = require('express');
const router = express.Router();
const { getRequirements, addRequirement, updateRequirementStatus } = require('../controllers/requirementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getRequirements)         // Public or authenticated
    .post(protect, authorize('Admin'), addRequirement); // Admin only

router.route('/:id/status')
    .put(protect, authorize('Admin'), updateRequirementStatus);

module.exports = router;
