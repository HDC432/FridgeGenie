const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create family
router.post('/', familyController.createFamily);

// Join family
router.post('/join', familyController.joinFamily);

// Get family information
router.get('/', familyController.getFamilyInfo);

// Get family members
router.get('/:familyId/members', familyController.getFamilyMembers);

// Remove family member
router.delete('/:familyId/members/:userId', familyController.removeMember);

// Update member role
router.put('/:familyId/members/:userId/role', familyController.updateMemberRole);

// Leave family
router.delete('/:familyId/leave', (req, res, next) => {
  console.log('FamilyRoutes - Received leave family request:', {
    method: req.method,
    url: req.url,
    params: req.params,
    user: req.user
  });
  next();
}, familyController.leaveFamily.bind(familyController));

// Get family members health tags
router.get('/:familyId/health-tags', familyController.getFamilyHealthTags);

module.exports = router; 