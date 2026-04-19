const { VolunteerApplication, VolunteerActivity } = require('../models/MiscModels');

// @desc    Get volunteer applications
// @route   GET /api/volunteers/applications
// @access  Private (Admin)
const getVolunteerApplications = async (req, res) => {
    try {
        const applications = await VolunteerApplication.find()
            .populate('userId', 'name email')
            .populate('activityId', 'title date')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update volunteer application status
// @route   PUT /api/volunteers/applications/:id/status
// @access  Private (Admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const application = await VolunteerApplication.findById(req.params.id);
        
        if (application) {
            application.status = req.body.status || application.status;
            const updatedApplication = await application.save();
            res.json(updatedApplication);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
};

// @desc    Seed some dummy applications if none exist (Helper for UI)
// @route   POST /api/volunteers/seed
// @access  Private (Admin)
const seedVolunteers = async (req, res) => {
    try {
        const count = await VolunteerApplication.countDocuments();
        if (count === 0) {
            // Create a dummy activity
            const activity = new VolunteerActivity({
                title: 'Weekend Reading Session',
                date: new Date(Date.now() + 86400000),
                status: 'Upcoming'
            });
            await activity.save();

            // Create a dummy application
            const application = new VolunteerApplication({
                userId: req.user._id, // Assuming seeded by current logged in admin
                activityId: activity._id,
                status: 'Pending'
            });
            await application.save();

            res.json({ message: 'Seeded successfully' });
        } else {
            res.json({ message: 'Data already exists', count });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error seeding', error: error.message });
    }
};

// @desc    Get all active volunteer activities
// @route   GET /api/volunteers/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        const activities = await VolunteerActivity.find({ status: 'Upcoming' }).sort({ date: 1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get applications for logged in volunteer
// @route   GET /api/volunteers/my-applications
// @access  Private (Volunteer)
const getMyApplications = async (req, res) => {
    try {
        const applications = await VolunteerApplication.find({ userId: req.user._id })
            .populate('activityId', 'title date description')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Apply for an activity
// @route   POST /api/volunteers/apply
// @access  Private (Volunteer)
const applyForActivity = async (req, res) => {
    try {
        const { activityId } = req.body;
        
        const existing = await VolunteerApplication.findOne({ userId: req.user._id, activityId });
        if (existing) {
            return res.status(400).json({ message: 'Already applied for this activity' });
        }

        const application = new VolunteerApplication({
            userId: req.user._id,
            activityId,
            status: 'Pending'
        });

        await application.save();
        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getVolunteerApplications,
    updateApplicationStatus,
    seedVolunteers,
    getActivities,
    getMyApplications,
    applyForActivity
};
