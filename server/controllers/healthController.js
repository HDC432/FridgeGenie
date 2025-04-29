const HealthProfile = require('../models/healthModel');

class HealthController {
    // 更新健康档案
    async updateHealthProfile(req, res) {
        try {
            const { userId } = req.user;
            const healthData = req.body;

            // 验证必填字段
            if (!healthData) {
                return res.status(400).json({ message: '健康数据不能为空' });
            }

            // 创建或更新健康档案
            const healthProfile = new HealthProfile(userId, healthData);
            const savedProfile = await healthProfile.save();

            res.status(200).json({
                message: '健康档案更新成功',
                data: savedProfile
            });
        } catch (error) {
            console.error('更新健康档案失败:', error);
            res.status(500).json({ message: '更新健康档案失败' });
        }
    }

    // 获取健康档案
    async getHealthProfile(req, res) {
        try {
            const { userId } = req.user;

            // 查询健康档案
            const healthProfile = await HealthProfile.findByUserId(userId);

            if (!healthProfile) {
                return res.status(404).json({ message: '未找到健康档案' });
            }

            res.status(200).json({
                message: '获取健康档案成功',
                data: healthProfile
            });
        } catch (error) {
            console.error('获取健康档案失败:', error);
            res.status(500).json({ message: '获取健康档案失败' });
        }
    }
}

module.exports = new HealthController(); 