const express = require('express');
const router = express.Router();
const { getResidents, addResident, updateResident, getMyWards } = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getResidents)
    .post(protect, authorize('Admin'), addResident);

router.route('/my-wards')
    .get(protect, authorize('Guardian'), getMyWards);

router.route('/:id')
    .put(protect, authorize('Admin'), updateResident);

module.exports = router;
