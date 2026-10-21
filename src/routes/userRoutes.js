const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { profileUpdateValidation } = require('../middleware/validators');

router.get('/me', protect, getProfile);
router.put('/me', protect, profileUpdateValidation, updateProfile);

module.exports = router;
