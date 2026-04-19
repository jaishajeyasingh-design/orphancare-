const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create a Stripe Checkout Session
// @route   POST /api/stripe/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { amount, type } = req.body;

        if (!amount || !type) {
            return res.status(400).json({ message: 'Amount and type are required' });
        }

        // --- DEVELOPMENT MOCK MODE ---
        // If the API key is the placeholder 'sk_test_mock', return a mock success flag
        if (process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
            console.log('Stripe is in MOCK MODE. Returning mock success flag.');
            return res.json({ 
                mock: true,
                amount,
                type
            });
        }
        // -----------------------------

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
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5174/donations?success=true&amount=${amount}&type=${type}`,
            cancel_url: `http://localhost:5174/donations?canceled=true`,
            metadata: {
                userId: req.user._id.toString(),
                type: type
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: 'Failed to create Stripe session', error: error.message });
    }
};

module.exports = { createCheckoutSession };
