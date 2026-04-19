require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const adopterRoutes = require('./routes/adopterRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');

// Basic Route
app.get('/', (req, res) => {
    res.send('OrphanCare+ API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/adopter', adopterRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/razorpay', razorpayRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
