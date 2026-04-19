const { Payment } = require('../models/MiscModels');
const User = require('../models/User');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a payment (e.g. manual donation entry by admin)
// @route   POST /api/payments
// @access  Private
const addPayment = async (req, res) => {
    try {
        const { amount, type, donorName } = req.body;
        
        if (!amount || !type) {
            return res.status(400).json({ message: 'Amount and type are required' });
        }

        const userId = req.user._id;
        
        const payment = new Payment({
            userId,
            amount: Number(amount),
            type, // 'Donation', 'Sponsorship', 'Fee'
            status: 'Completed',
            transactionId: `TXN-${Date.now()}`
        });

        const createdPayment = await payment.save();
        // Populate user info for immediate display
        const populatedPayment = await Payment.findById(createdPayment._id).populate('userId', 'name email');

        res.status(201).json(populatedPayment);
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(400).json({ message: 'Invalid payment data', error: error.message });
    }
};

module.exports = {
    getPayments,
    addPayment
};
