const express = require('express');
const router = express.Router();
const { getPayments, addPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPayments)
    .post(protect, addPayment);

module.exports = router;
