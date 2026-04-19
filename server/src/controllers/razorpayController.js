const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment } = require('../models/MiscModels');

// Logic to check for keys or use mock
const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_mock';

let razorpayInstance;
if (!isMock) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// @desc    Create a Razorpay Order
// @route   POST /api/razorpay/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        if (isMock) {
            console.log('Razorpay is in MOCK MODE. Simulating Order creation.');
            return res.json({
                mock: true,
                id: `order_mock_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency,
                key: 'rzp_test_mock'
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise/cents
            currency,
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);
        
        // Return order and the public key for the frontend
        res.json({
            ...order,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/razorpay/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            amount,
            type
        } = req.body;

        // 1. Create the verification string
        const secret = process.env.RAZORPAY_KEY_SECRET;
        
        // If keys are missing and it's a mock request, we can still record it (or strictly fail)
        if (!secret || secret === 'rzp_test_secret_mock') {
            console.log('MOCK VERIFICATION: Skipping actual crypto check.');
            // We still record the payment to database
            const payment = new Payment({
                userId: req.user._id,
                amount: Number(amount),
                type,
                transactionId: razorpay_payment_id || `MOCK-PAY-${Date.now()}`,
                status: 'Completed'
            });
            await payment.save();
            return res.json({ status: 'ok', message: 'Payment recorded (Mock Mode)' });
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // 2. Signature is valid, record in database
            const payment = new Payment({
                userId: req.user._id,
                amount: Number(amount),
                type,
                transactionId: razorpay_payment_id,
                status: 'Completed'
            });
            await payment.save();
            
            res.json({ status: 'ok', message: 'Payment verified and recorded successfully' });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Razorpay Verification Error:', error);
        res.status(500).json({ message: 'Internal Server Error during verification', error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };
