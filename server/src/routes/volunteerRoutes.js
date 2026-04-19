const express = require('express');
const router = express.Router();
const { getVolunteerApplications, updateApplicationStatus, seedVolunteers, getActivities, getMyApplications, applyForActivity } = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/activities')
    .get(protect, getActivities); // Both Admin and Volunteer can view

router.route('/my-applications')
    .get(protect, authorize('Volunteer'), getMyApplications);

router.route('/apply')
    .post(protect, authorize('Volunteer'), applyForActivity);

router.route('/applications')
    .get(protect, authorize('Admin'), getVolunteerApplications);

router.route('/applications/:id/status')
    .put(protect, authorize('Admin'), updateApplicationStatus);

router.route('/seed')
    .post(protect, authorize('Admin'), seedVolunteers);

module.exports = router;
