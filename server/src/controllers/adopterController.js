const Resident = require('../models/Resident');
const { AdoptionRequest } = require('../models/MiscModels');

// @desc    Get all children available for adoption
// @route   GET /api/adopter/children
// @access  Private (Adopter)
const getAvailableChildren = async (req, res) => {
    try {
        // Fetch residents who are children, active, and eligible for adoption
        const children = await Resident.find({
            category: 'Orphan Child',
            status: 'Active',
            adoptionEligibility: true
        });
        res.json(children);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Submit an adoption request
// @route   POST /api/adopter/adoption-request
// @access  Private (Adopter)
const submitAdoptionRequest = async (req, res) => {
    try {
        const { child_id, reason, family_details } = req.body;

        if (!child_id || !reason) {
            return res.status(400).json({ message: 'Please provide child ID and reason' });
        }

        // Check if child exists and is eligible
        const child = await Resident.findById(child_id);
        if (!child || child.category !== 'Orphan Child') {
            return res.status(404).json({ message: 'Child not found or not available for adoption' });
        }

        // Check if already requested
        const existingRequest = await AdoptionRequest.findOne({
            userId: req.user._id,
            residentId: child_id,
            status: 'Pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this child' });
        }

        const adoptionRequest = new AdoptionRequest({
            userId: req.user._id,
            residentId: child_id,
            notes: `Reason: ${reason}. Family Details: ${family_details || 'N/A'}`
        });

        const createdRequest = await adoptionRequest.save();
        res.status(201).json(createdRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get my adoption requests
// @route   GET /api/adopter/my-requests
// @access  Private (Adopter)
const getMyRequests = async (req, res) => {
    try {
        const requests = await AdoptionRequest.find({ userId: req.user._id })
            .populate('residentId', 'name age gender healthCondition status')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all adoption requests for Admin
// @route   GET /api/adopter/admin/requests
// @access  Private (Admin)
const getAllAdoptionRequests = async (req, res) => {
    try {
        const requests = await AdoptionRequest.find()
            .populate('userId', 'name email phone')
            .populate('residentId', 'name age category status adoptionEligibility')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update adoption request status (Admin)
// @route   PUT /api/adopter/admin/requests/:id/status
// @access  Private (Admin)
const updateAdoptionRequestStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const request = await AdoptionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Adoption request not found' });
        }

        request.status = status || request.status;
        await request.save();

        if (status === 'Approved' && request.residentId) {
            // Update child resident status to Adopted and set adoptionEligibility to false
            await Resident.findByIdAndUpdate(request.residentId, {
                status: 'Adopted',
                adoptionEligibility: false
            });
        }

        const updatedRequest = await AdoptionRequest.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('residentId', 'name age status adoptionEligibility');

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAvailableChildren,
    submitAdoptionRequest,
    getMyRequests,
    getAllAdoptionRequests,
    updateAdoptionRequestStatus
};

