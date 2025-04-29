const HealthProfile = require('../models/healthModel');

class HealthController {
    static async updateHealthProfile(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({ 
                    success: false,
                    message: '用户ID不能为空' 
                });
            }

            const data = req.body;
            const updatedProfile = await HealthProfile.update(userId, data);
            res.json({
                success: true,
                message: '健康档案更新成功',
                data: updatedProfile
            });
        } catch (error) {
            console.error('更新健康档案失败:', error);
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    static async getHealthProfile(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({ 
                    success: false,
                    message: '用户ID不能为空' 
                });
            }

            const profile = await HealthProfile.findByUserId(userId);
            if (!profile) {
                return res.status(404).json({ 
                    success: false,
                    message: '健康档案不存在' 
                });
            }

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('获取健康档案失败:', error);
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    static async createHealthProfile(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({ 
                    success: false,
                    message: '用户ID不能为空' 
                });
            }

            const data = { ...req.body, userId };
            const profile = await HealthProfile.create(data);
            res.status(201).json({
                success: true,
                message: '健康档案创建成功',
                data: profile
            });
        } catch (error) {
            console.error('创建健康档案失败:', error);
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }

    static async deleteHealthProfile(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({ 
                    success: false,
                    message: '用户ID不能为空' 
                });
            }

            await HealthProfile.delete(userId);
            res.status(204).send();
        } catch (error) {
            console.error('删除健康档案失败:', error);
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }
}

module.exports = HealthController; 