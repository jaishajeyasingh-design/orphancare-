const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifySession } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifySession);

module.exports = router;
