const familyService = require('../services/familyService');
const Family = require('../models/Family');
const User = require('../models/User');
const HealthProfile = require('../models/healthModel');

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
            const { familyId } = req.params;
            const userId = req.user.id;
            
            console.log('FamilyController - leaveFamily - 开始处理请求');
            console.log('FamilyController - leaveFamily - 请求参数:', { familyId, userId });
            console.log('FamilyController - leaveFamily - 用户信息:', req.user);
            
            console.log('FamilyController - leaveFamily - 开始调用 familyService.removeMember');
            const result = await familyService.removeMember(familyId, userId);
            console.log('FamilyController - leaveFamily - 服务返回结果:', result);
            
            if (!result.success) {
                console.log('FamilyController - leaveFamily - 操作失败:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
            
            console.log('FamilyController - leaveFamily - 操作成功');
            res.status(200).json({
                success: true,
                data: null,
                message: result.message
            });
        } catch (error) {
            console.error('FamilyController - leaveFamily - 错误:', error);
            res.status(500).json({
                success: false,
                message: '退出家庭失败'
            });
        }
    }

    // 获取家庭成员的健康标签
    async getFamilyHealthTags(req, res) {
        try {
            const { familyId } = req.params;
            console.log('获取家庭成员健康标签 - 开始:', familyId);

            const healthTags = await familyService.getFamilyHealthTags(familyId);

            console.log('获取家庭成员健康标签 - 成功:', healthTags);
            res.json({
                success: true,
                message: '获取家庭成员健康标签成功',
                data: healthTags
            });
        } catch (error) {
            console.error('获取家庭成员健康标签失败:', error);
            res.status(500).json({
                success: false,
                message: '获取家庭成员健康标签失败',
                error: error.message
            });
        }
    }
}

module.exports = new FamilyController(); 