const { Requirement } = require('../models/MiscModels');

// @desc    Get all requirements
// @route   GET /api/requirements
// @access  Public
const getRequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find().sort({ createdAt: -1 });
        res.json(requirements);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a requirement
// @route   POST /api/requirements
// @access  Private (Admin)
const addRequirement = async (req, res) => {
    try {
        const { title, description, category, urgency } = req.body;
        
        const requirement = new Requirement({
            title,
            description,
            category,
            urgency: urgency || 'Medium',
            status: 'Active'
        });

        const createdRequirement = await requirement.save();
        res.status(201).json(createdRequirement);
    } catch (error) {
        res.status(400).json({ message: 'Invalid requirement data', error: error.message });
    }
};

// @desc    Update requirement status
// @route   PUT /api/requirements/:id/status
// @access  Private (Admin)
const updateRequirementStatus = async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id);
        
        if (requirement) {
            requirement.status = req.body.status || requirement.status;
            const updatedRequirement = await requirement.save();
            res.json(updatedRequirement);
        } else {
            res.status(404).json({ message: 'Requirement not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
};

module.exports = {
    getRequirements,
    addRequirement,
    updateRequirementStatus
};
