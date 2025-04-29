const HealthProfile = require('../models/healthModel');

class HealthController {
    // 更新健康档案
    async updateHealthProfile(req, res) {
        try {
            console.log('开始更新健康档案，请求数据:', req.body);
            const userId = req.user.id; // 直接从 req.user 中获取 id
            console.log('用户ID:', userId);
            
            if (!userId) {
                console.log('用户ID未定义');
                return res.status(400).json({ message: '用户ID未定义' });
            }

            const healthData = req.body;
            console.log('健康数据:', healthData);

            // 验证必填字段
            if (!healthData) {
                console.log('健康数据为空');
                return res.status(400).json({ message: '健康数据不能为空' });
            }

            // 创建或更新健康档案
            console.log('创建健康档案对象');
            const healthProfile = new HealthProfile(userId, healthData);
            console.log('健康档案对象创建成功:', healthProfile);
            
            console.log('开始保存健康档案');
            const savedProfile = await healthProfile.save();
            console.log('健康档案保存成功:', savedProfile);

            res.status(200).json({
                message: '健康档案更新成功',
                data: savedProfile.healthProfile
            });
        } catch (error) {
            console.error('更新健康档案失败，详细错误:', error);
            console.error('错误堆栈:', error.stack);
            res.status(500).json({ 
                message: '更新健康档案失败',
                error: error.message 
            });
        }
    }

    // 获取健康档案
    async getHealthProfile(req, res) {
        try {
            console.log('开始获取健康档案，用户信息:', req.user);
            const userId = req.user.id; // 直接从 req.user 中获取 id
            console.log('用户ID:', userId);

            if (!userId) {
                console.log('用户ID未定义');
                return res.status(400).json({ message: '用户ID未定义' });
            }

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
            console.error('获取健康档案失败，详细错误:', error);
            console.error('错误堆栈:', error.stack);
            res.status(500).json({ 
                message: '获取健康档案失败',
                error: error.message 
            });
        }
    }
}

module.exports = new HealthController(); 