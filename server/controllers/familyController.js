const familyService = require('../services/familyService');

class FamilyController {
    // 创建家庭
    async createFamily(req, res) {
        try {
            console.log('创建家庭 - 请求体:', req.body);
            console.log('创建家庭 - 用户ID:', req.user.id);
            
            const { name } = req.body;
            const userId = req.user.id;

            if (!name) {
                console.log('创建家庭 - 错误: 缺少家庭名称');
                return res.status(400).json({
                    success: false,
                    message: '请提供家庭名称'
                });
            }

            console.log('创建家庭 - 开始调用服务');
            const family = await familyService.createFamily(name, userId);
            console.log('创建家庭 - 服务返回结果:', family);
            
            res.status(201).json({
                success: true,
                data: family
            });
        } catch (error) {
            console.error('创建家庭 - 错误:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // 加入家庭
    async joinFamily(req, res) {
        try {
            const { inviteCode } = req.body;
            const userId = req.user.id;

            if (!inviteCode) {
                return res.status(400).json({
                    success: false,
                    message: '请提供邀请码'
                });
            }

            const family = await familyService.joinFamily(inviteCode, userId);
            
            res.status(200).json({
                success: true,
                data: family
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // 获取家庭信息
    async getFamilyInfo(req, res) {
        try {
            console.log('获取家庭信息 - 开始处理请求');
            const userId = req.user.id;
            console.log('获取家庭信息 - 用户ID:', userId);
            
            const family = await familyService.getFamilyInfo(userId);
            console.log('获取家庭信息 - 查询结果:', family);
            
            res.status(200).json({
                success: true,
                data: family
            });
        } catch (error) {
            console.error('获取家庭信息 - 错误:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // 移除家庭成员
    async removeMember(req, res) {
        try {
            const { familyId, userId } = req.params;
            const adminId = req.user.id;

            const family = await familyService.removeMember(familyId, userId, adminId);
            
            res.status(200).json({
                success: true,
                data: family
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // 更新成员角色
    async updateMemberRole(req, res) {
        try {
            const { familyId, userId } = req.params;
            const { role } = req.body;
            const adminId = req.user.id;

            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: '请提供新的角色'
                });
            }

            const family = await familyService.updateMemberRole(familyId, userId, role, adminId);
            
            res.status(200).json({
                success: true,
                data: family
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async leaveFamily(req, res) {
        try {
            console.log('FamilyController - 开始处理退出家庭请求');
            console.log('FamilyController - 请求参数:', req.params);
            console.log('FamilyController - 用户信息:', req.user);
            
            const { familyId } = req.params;
            const userId = req.user.id;
            console.log('FamilyController - 退出家庭参数:', { familyId, userId });

            console.log('FamilyController - 开始调用familyService.removeMember');
            const family = await familyService.removeMember(familyId, userId);
            console.log('FamilyController - 退出家庭结果:', family);

            if (!family) {
                console.log('FamilyController - 家庭已被删除');
                return res.status(200).json({
                    success: true,
                    message: '已退出家庭',
                    data: null
                });
            }

            console.log('FamilyController - 返回更新后的家庭信息');
            res.json({
                success: true,
                message: '已退出家庭',
                data: family
            });
        } catch (error) {
            console.error('FamilyController - 退出家庭失败:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new FamilyController(); 