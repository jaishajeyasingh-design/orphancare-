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

// Existing Routes
const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const adopterRoutes = require('./routes/adopterRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');

// Expanded Modular API Routes
const userRoutes = require('./routes/userRoutes');
const childRoutes = require('./routes/childRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const donorRoutes = require('./routes/donorRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const matchRoutes = require('./routes/matchRoutes');
const developmentRoutes = require('./routes/developmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const impactRoutes = require('./routes/impactRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Basic Route
app.get('/', (req, res) => {
    res.send('OrphanCare AI API Gateway is running...');
});

// Existing Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/adopter', adopterRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Modular OrphanCare AI Endpoint Registrations
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/development', developmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
