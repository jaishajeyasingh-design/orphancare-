const express = require('express');
const router = express.Router();
const { 
    getAvailableChildren, 
    submitAdoptionRequest, 
    getMyRequests 
} = require('../controllers/adopterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Adopter'));

router.get('/children', getAvailableChildren);
router.post('/adoption-request', submitAdoptionRequest);
router.get('/my-requests', getMyRequests);

module.exports = router;
