const express = require('express');
const router = express.Router();
const {
    getVolunteerApplications,
    updateApplicationStatus,
    seedVolunteers,
    getActivities,
    getMyApplications,
    applyForActivity,
    createActivity,
    submitVolunteerRequest,
    getMyVolunteerRequests,
    getOrgVolunteerRequests,
    getVolunteerRequestById,
    updateVolunteerRequestStatus
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Legacy Activity Drive Routes
router.route('/activities')
    .get(protect, getActivities)
    .post(protect, authorize('Admin', 'Organization'), createActivity);

router.route('/my-applications')
    .get(protect, authorize('Volunteer'), getMyApplications);

router.route('/apply')
    .post(protect, authorize('Volunteer'), applyForActivity);

router.route('/applications')
    .get(protect, authorize('Admin', 'Organization'), getVolunteerApplications);

router.route('/applications/:id/status')
    .put(protect, authorize('Admin', 'Organization'), updateApplicationStatus);

router.route('/seed')
    .post(protect, authorize('Admin', 'Organization'), seedVolunteers);

// New Volunteer Request Workflow Routes
router.route('/requests')
    .post(protect, authorize('Volunteer'), submitVolunteerRequest);

router.route('/my-requests')
    .get(protect, authorize('Volunteer'), getMyVolunteerRequests);

router.route('/org-requests')
    .get(protect, authorize('Admin', 'Organization'), getOrgVolunteerRequests);

router.route('/requests/:id')
    .get(protect, getVolunteerRequestById);

router.route('/requests/:id/status')
    .put(protect, authorize('Admin', 'Organization'), updateVolunteerRequestStatus);

module.exports = router;
