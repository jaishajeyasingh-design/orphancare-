const express = require('express');
const router = express.Router();
const { 
    getAvailableChildren, 
    submitAdoptionRequest, 
    getMyRequests,
    getAllAdoptionRequests,
    updateAdoptionRequestStatus
} = require('../controllers/adopterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Adopter endpoints
router.get('/children', authorize('Adopter', 'Admin'), getAvailableChildren);
router.post('/adoption-request', authorize('Adopter'), submitAdoptionRequest);
router.get('/my-requests', authorize('Adopter', 'Admin'), getMyRequests);

// Admin endpoints
router.get('/admin/requests', authorize('Admin'), getAllAdoptionRequests);
router.put('/admin/requests/:id/status', authorize('Admin'), updateAdoptionRequestStatus);

module.exports = router;

