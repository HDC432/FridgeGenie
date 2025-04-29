const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// 更新健康档案
router.put('/profile', auth, healthController.updateHealthProfile);

// 获取健康档案
router.get('/profile', auth, healthController.getHealthProfile);

module.exports = router; 