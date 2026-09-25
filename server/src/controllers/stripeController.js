const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const { Payment } = require('../models/MiscModels');

// @desc    Create a Stripe Checkout Session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { amount, type } = req.body;

        if (!amount || Number(amount) <= 0 || !type) {
            return res.status(400).json({ message: 'Valid amount greater than zero and type are required' });
        }

        const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock';

        // --- DEVELOPMENT MOCK MODE ---
        if (isMock) {
            console.log('Stripe is in MOCK MODE. Simulating Session creation.');
            return res.json({ 
                mock: true,
                id: `cs_test_mock_${Date.now()}`,
                amount: Number(amount),
                type
            });
        }
        // -----------------------------

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `OrphanCare+ ${type}`,
                            description: `Contribution for ${type} in OrphanCare+ Administrative System`,
                        },
                        unit_amount: Math.round(Number(amount) * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${frontendUrl}/donations?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/donations?canceled=true`,
            metadata: {
                userId: req.user._id.toString(),
                type: type,
                amount: String(amount)
            }
        });

        res.json({ url: session.url, id: session.id });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: 'Failed to create Stripe session', error: error.message });
    }
};

// @desc    Verify Stripe Checkout Session & Record Payment
// @route   POST /api/stripe/verify-session
// @access  Private
const verifySession = async (req, res) => {
    try {
        const { sessionId, amount, type } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required for verification' });
        }

        // Idempotency check: check if already recorded
        const existing = await Payment.findOne({ transactionId: sessionId });
        if (existing) {
            const populated = await Payment.findById(existing._id).populate('userId', 'name email');
            return res.json({ status: 'ok', message: 'Payment already verified and recorded', data: populated });
        }

        const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock';

        if (isMock) {
            const payment = new Payment({
                userId: req.user._id,
                amount: Number(amount || 100),
                type: type || 'Donation',
                transactionId: sessionId,
                status: 'Completed'
            });
            await payment.save();
            const populated = await Payment.findById(payment._id).populate('userId', 'name email');
            return res.json({ status: 'ok', message: 'Stripe Payment verified and recorded (Mock Mode)', data: populated });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session && session.payment_status === 'paid') {
            const paymentAmount = Number(session.metadata?.amount || (session.amount_total / 100));
            const paymentType = session.metadata?.type || 'Donation';
            const userId = session.metadata?.userId || req.user._id;

            const payment = new Payment({
                userId,
                amount: paymentAmount,
                type: paymentType,
                transactionId: session.payment_intent || session.id,
                status: 'Completed'
            });
            await payment.save();
            const populated = await Payment.findById(payment._id).populate('userId', 'name email');

            return res.json({ status: 'ok', message: 'Stripe Payment verified and recorded successfully', data: populated });
        } else {
            return res.status(400).json({ message: 'Stripe payment has not been completed.' });
        }
    } catch (error) {
        console.error('Stripe Verification Error:', error);
        res.status(500).json({ message: 'Failed to verify Stripe payment', error: error.message });
    }
};

module.exports = { createCheckoutSession, verifySession };
