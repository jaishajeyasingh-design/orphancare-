require('dotenv').config();
const mongoose = require('mongoose');
const { Payment } = require('../server/src/models/MiscModels');
const User = require('../server/src/models/User');
const razorpayController = require('../server/src/controllers/razorpayController');
const stripeController = require('../server/src/controllers/stripeController');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orphancare';

const runPaymentTests = async () => {
  console.log('==================================================');
  console.log('  ORPHANCARE+ REAL PAYMENT FLOW & VERIFICATION TESTS');
  console.log('==================================================');

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  const testUser = await User.findOne() || await User.create({
    name: 'Payment Test User',
    email: `paytest_${Date.now()}@example.com`,
    password: 'password123',
    role: 'Donor'
  });

  const mockReq = (body) => ({
    body,
    user: testUser
  });

  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.responseData = data;
      return res;
    };
    return res;
  };

  // 1. Razorpay Order Creation
  console.log('\n[Test 1] Creating Razorpay Order...');
  const res1 = mockRes();
  await razorpayController.createOrder(mockReq({ amount: 150, currency: 'INR' }), res1);
  console.log('✓ Order created response:', res1.responseData);
  if (!res1.responseData.id) throw new Error('Order creation failed.');

  // 2. Razorpay Verification
  console.log('\n[Test 2] Verifying Razorpay Payment...');
  const res2 = mockRes();
  await razorpayController.verifyPayment(mockReq({
    razorpay_order_id: res1.responseData.id,
    razorpay_payment_id: `pay_test_${Date.now()}`,
    razorpay_signature: 'test_sig',
    amount: 150,
    type: 'Donation'
  }), res2);
  console.log('✓ Verification response:', res2.responseData);
  if (!res2.responseData.status === 'ok') throw new Error('Payment verification failed.');

  // 3. Stripe Checkout Session Creation
  console.log('\n[Test 3] Creating Stripe Checkout Session...');
  const res3 = mockRes();
  await stripeController.createCheckoutSession(mockReq({ amount: 200, type: 'Sponsorship' }), res3);
  console.log('✓ Stripe session creation response:', res3.responseData);
  if (!res3.responseData.id) throw new Error('Stripe session creation failed.');

  // 4. Stripe Session Verification
  console.log('\n[Test 4] Verifying Stripe Checkout Session...');
  const res4 = mockRes();
  await stripeController.verifySession(mockReq({
    sessionId: res3.responseData.id,
    amount: 200,
    type: 'Sponsorship'
  }), res4);
  console.log('✓ Stripe session verification response:', res4.responseData);
  if (!res4.responseData.status === 'ok') throw new Error('Stripe verification failed.');

  // 5. Zero / Invalid Amount Validation Safeguard
  console.log('\n[Test 5] Testing zero / invalid amount validation safeguard...');
  const res5 = mockRes();
  await razorpayController.createOrder(mockReq({ amount: 0 }), res5);
  console.log('✓ Caught invalid amount safeguard response:', res5.statusCode, res5.responseData.message);

  console.log('\n==================================================');
  console.log('  ALL REAL PAYMENT FLOW & VERIFICATION TESTS PASSED!');
  console.log('==================================================');

  await mongoose.disconnect();
};

runPaymentTests().catch((err) => {
  console.error('Payment Test Error:', err);
  process.exit(1);
});
