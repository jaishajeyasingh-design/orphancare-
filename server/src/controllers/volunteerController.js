const { VolunteerApplication, VolunteerActivity, VolunteerRequest } = require('../models/MiscModels');
const Opportunity = require('../models/Opportunity');

// @desc    Get volunteer applications (Legacy)
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

// @desc    Update volunteer application status (Legacy)
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

// @desc    Get applications for logged in volunteer (Legacy)
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

// @desc    Apply for an activity (Legacy)
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

// @desc    Create a volunteer activity (Admin)
// @route   POST /api/volunteers/activities
// @access  Private (Admin)
const createActivity = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and date are required' });
        }

        const activity = new VolunteerActivity({
            title,
            description,
            date: new Date(date),
            status: 'Upcoming'
        });

        const createdActivity = await activity.save();
        res.status(201).json(createdActivity);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ==================================================
// NEW VOLUNTEER REQUEST WORKFLOW CONTROLLER METHODS
// ==================================================

// @desc    Submit a volunteering request for a published opportunity
// @route   POST /api/volunteers/requests
// @access  Private (Volunteer)
const submitVolunteerRequest = async (req, res) => {
    try {
        const { opportunityId, message } = req.body;
        if (!opportunityId) {
            return res.status(400).json({ message: 'Opportunity ID is required.' });
        }

        const opportunity = await Opportunity.findById(opportunityId).populate('organization');
        if (!opportunity) {
            return res.status(404).json({ message: 'Volunteering opportunity not found.' });
        }

        const organizationId = opportunity.organization?._id || opportunity.organization || req.body.organizationId;
        if (!organizationId) {
            return res.status(400).json({ message: 'Opportunity is not linked to a valid organization.' });
        }

        // Check for duplicate active request server-side
        const existing = await VolunteerRequest.findOne({
            volunteer: req.user._id,
            opportunity: opportunityId,
            status: { $in: ['Pending', 'Approved'] }
        });

        if (existing) {
            return res.status(400).json({ message: 'You already have an active request for this volunteering opportunity.' });
        }

        const request = new VolunteerRequest({
            volunteer: req.user._id, // FORCE identity from JWT token
            organization: organizationId,
            opportunity: opportunityId,
            child: opportunity.child || req.body.childId || undefined,
            message: message || '',
            status: 'Pending'
        });

        const createdRequest = await request.save();
        const populatedRequest = await VolunteerRequest.findById(createdRequest._id)
            .populate('opportunity', 'title type description availability supportCategories requiredSkills')
            .populate('organization', 'name email phone address')
            .populate('child', 'anonymizedCode age educationLevel');

        res.status(201).json(populatedRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get submitted requests for logged-in volunteer
// @route   GET /api/volunteers/my-requests
// @access  Private (Volunteer)
const getMyVolunteerRequests = async (req, res) => {
    try {
        const requests = await VolunteerRequest.find({ volunteer: req.user._id })
            .populate('opportunity', 'title type description availability supportCategories requiredSkills')
            .populate('organization', 'name email phone address')
            .populate('child', 'anonymizedCode age educationLevel')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get volunteer requests for Admin's organization
// @route   GET /api/volunteers/org-requests
// @access  Private (Admin / Organization)
const getOrgVolunteerRequests = async (req, res) => {
    try {
        const filter = {};
        if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization) {
            filter.organization = req.user.organization;
        } else if (req.query.organization) {
            filter.organization = req.query.organization;
        }

        const requests = await VolunteerRequest.find(filter)
            .populate('volunteer', 'name email phone role')
            .populate('opportunity', 'title type description availability supportCategories requiredSkills')
            .populate('organization', 'name email phone address')
            .populate('child', 'anonymizedCode age educationLevel')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get volunteer request by ID with isolation checks
// @route   GET /api/volunteers/requests/:id
// @access  Private (Volunteer / Admin / Organization)
const getVolunteerRequestById = async (req, res) => {
    try {
        const request = await VolunteerRequest.findById(req.params.id)
            .populate('volunteer', 'name email phone role')
            .populate('opportunity', 'title type description availability supportCategories requiredSkills')
            .populate('organization', 'name email phone address')
            .populate('child', 'anonymizedCode age educationLevel');

        if (!request) {
            return res.status(404).json({ message: 'Volunteer request not found.' });
        }

        // Privacy & Isolation checks
        if (req.user.role === 'Volunteer') {
            const vId = request.volunteer?._id ? request.volunteer._id.toString() : request.volunteer.toString();
            if (vId !== req.user._id.toString()) {
                return res.status(404).json({ message: 'Volunteer request not found.' });
            }
        } else if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization) {
            const userOrg = req.user.organization._id ? req.user.organization._id.toString() : req.user.organization.toString();
            const reqOrg = request.organization?._id ? request.organization._id.toString() : request.organization.toString();
            if (userOrg !== reqOrg) {
                return res.status(404).json({ message: 'Volunteer request not found.' });
            }
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Approve / Reject / Complete / Cancel volunteer request status
// @route   PUT /api/volunteers/requests/:id/status
// @access  Private (Admin / Organization)
const updateVolunteerRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const request = await VolunteerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Volunteer request not found.' });
        }

        // Check organization isolation
        if ((req.user.role === 'Admin' || req.user.role === 'Organization') && req.user.organization) {
            const userOrg = req.user.organization._id ? req.user.organization._id.toString() : req.user.organization.toString();
            const reqOrg = request.organization?._id ? request.organization._id.toString() : request.organization.toString();
            if (userOrg !== reqOrg) {
                return res.status(404).json({ message: 'Volunteer request not found.' });
            }
        }

        request.status = status;
        await request.save();

        const updatedRequest = await VolunteerRequest.findById(request._id)
            .populate('volunteer', 'name email phone role')
            .populate('opportunity', 'title type description availability supportCategories requiredSkills')
            .populate('organization', 'name email phone address')
            .populate('child', 'anonymizedCode age educationLevel');

        res.json(updatedRequest);
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
    applyForActivity,
    createActivity,
    submitVolunteerRequest,
    getMyVolunteerRequests,
    getOrgVolunteerRequests,
    getVolunteerRequestById,
    updateVolunteerRequestStatus
};


