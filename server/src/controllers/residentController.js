const Resident = require('../models/Resident');

// @desc    Get all active residents
// @route   GET /api/residents
// @access  Private
const getResidents = async (req, res) => {
    try {
        const query = req.query.category ? { category: req.query.category } : {};
        const residents = await Resident.find(query).populate('guardianId', 'name email phone');
        res.json(residents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new resident
// @route   POST /api/residents
// @access  Private/Admin
const addResident = async (req, res) => {
    try {
        const { name, age, category, healthCondition, educationStatus, adoptionEligibility, guardianEmail, guardianName, monthlyFee } = req.body;

        let guardianId = req.body.guardianId;

        // Auto-create Guardian if missing and category is Paid Elderly
        if (category === 'Paid Elderly' && !guardianId && guardianEmail) {
            const User = require('../models/User');
            let guardian = await User.findOne({ email: guardianEmail });
            if (!guardian) {
                // Generate a random password for them
                const generatedPassword = Math.random().toString(36).slice(-8);
                guardian = await User.create({
                    name: guardianName || 'Guardian of ' + name,
                    email: guardianEmail,
                    password: generatedPassword,
                    role: 'Guardian'
                });
                
                // TODO: Here we'd use Nodemailer to send `generatedPassword` to `guardianEmail`
                console.log(`[EMAIL MOCK] Guardian account created! Email: ${guardianEmail}, Temp Password: ${generatedPassword}`);
            }
            guardianId = guardian._id;
        }

        const resident = new Resident({
            name,
            age,
            category,
            healthCondition,
            educationStatus,
            adoptionEligibility,
            guardianId,
            monthlyFee
        });

        const createdResident = await resident.save();
        res.status(201).json(createdResident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update resident
// @route   PUT /api/residents/:id
// @access  Private/Admin
const updateResident = async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);

        if (resident) {
            resident.name = req.body.name || resident.name;
            resident.age = req.body.age || resident.age;
            resident.category = req.body.category || resident.category;
            resident.healthCondition = req.body.healthCondition || resident.healthCondition;
            resident.educationStatus = req.body.educationStatus || resident.educationStatus;
            resident.adoptionEligibility = req.body.adoptionEligibility !== undefined ? req.body.adoptionEligibility : resident.adoptionEligibility;
            resident.guardianId = req.body.guardianId || resident.guardianId;
            resident.monthlyFee = req.body.monthlyFee || resident.monthlyFee;
            resident.status = req.body.status || resident.status; // Used to mark as deceased/adopted

            const updatedResident = await resident.save();
            res.json(updatedResident);
        } else {
            res.status(404).json({ message: 'Resident not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get residents assigned to logged-in Guardian
// @route   GET /api/residents/my-wards
// @access  Private/Guardian
const getMyWards = async (req, res) => {
    try {
        const residents = await Resident.find({ guardianId: req.user._id });
        res.json(residents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getResidents,
    addResident,
    updateResident,
    getMyWards
};
