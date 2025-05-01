const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// Update health profile
router.put('/profile', auth, healthController.updateHealthProfile);

// Get health profile
router.get('/profile', auth, healthController.getHealthProfile);

module.exports = router; 