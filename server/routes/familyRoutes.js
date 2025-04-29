const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const auth = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 创建家庭
router.post('/', familyController.createFamily);

// 加入家庭
router.post('/join', familyController.joinFamily);

// 获取家庭信息
router.get('/', familyController.getFamilyInfo);

// 移除家庭成员
router.delete('/:familyId/members/:userId', familyController.removeMember);

// 更新成员角色
router.put('/:familyId/members/:userId/role', familyController.updateMemberRole);

// 退出家庭
router.delete('/:familyId/leave', (req, res, next) => {
  console.log('FamilyRoutes - 收到退出家庭请求:', {
    method: req.method,
    url: req.url,
    params: req.params,
    user: req.user
  });
  next();
}, familyController.leaveFamily.bind(familyController));

module.exports = router; 