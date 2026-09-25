const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment } = require('../models/MiscModels');

// Helper to check if keys exist or if running in test mock mode
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

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Valid amount greater than zero is required' });
        }

        if (isMock) {
            console.log('Razorpay is in MOCK MODE. Simulating Order creation.');
            return res.json({
                mock: true,
                id: `order_mock_${Date.now()}`,
                amount: Math.round(Number(amount) * 100),
                currency,
                key: 'rzp_test_mock'
            });
        }

        const options = {
            amount: Math.round(Number(amount) * 100), // Razorpay expects paise/cents
            currency,
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);
        
        // Return order and the public key for frontend checkout initialization
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
            type = 'Donation'
        } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Valid payment amount is required for verification' });
        }

        const txnId = razorpay_payment_id || `MOCK-PAY-${Date.now()}`;

        // Idempotency check: prevent duplicate payment recording
        const existing = await Payment.findOne({ transactionId: txnId });
        if (existing) {
            const populated = await Payment.findById(existing._id).populate('userId', 'name email');
            return res.json({ status: 'ok', message: 'Payment already verified and recorded', data: populated });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        
        // Test / Mock verification check
        if (!secret || secret === 'rzp_test_secret_mock' || isMock) {
            console.log('MOCK VERIFICATION: Signature check simulated.');
            const payment = new Payment({
                userId: req.user._id,
                amount: Number(amount),
                type,
                transactionId: txnId,
                status: 'Completed'
            });
            await payment.save();
            const populated = await Payment.findById(payment._id).populate('userId', 'name email');
            return res.json({ status: 'ok', message: 'Payment verified and recorded (Mock Mode)', data: populated });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Order ID, Payment ID, and Signature are required for verification' });
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Signature is valid: record payment in database
            const payment = new Payment({
                userId: req.user._id,
                amount: Number(amount),
                type,
                transactionId: razorpay_payment_id,
                status: 'Completed'
            });
            await payment.save();
            const populated = await Payment.findById(payment._id).populate('userId', 'name email');
            
            res.json({ status: 'ok', message: 'Payment verified and recorded successfully', data: populated });
        } else {
            res.status(400).json({ message: 'Invalid payment signature verification' });
        }
    } catch (error) {
        console.error('Razorpay Verification Error:', error);
        res.status(500).json({ message: 'Internal Server Error during verification', error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };
