const HealthProfile = require('../models/HealthProfile');

class HealthService {
    // 创建或更新健康档案
    async updateHealthProfile(userId, healthData) {
        try {
            console.log('HealthService - 开始更新健康档案:', { userId, healthData });
            
            const healthProfile = new HealthProfile(userId, healthData);
            const result = await healthProfile.save();
            
            console.log('HealthService - 健康档案更新成功:', result);
            return {
                success: true,
                data: result.healthProfile
            };
        } catch (error) {
            console.error('HealthService - 更新健康档案失败:', error);
            throw error;
        }
    }

    // 获取健康档案
    async getHealthProfile(userId) {
        try {
            console.log('HealthService - 开始获取健康档案:', userId);
            
            const healthProfile = await HealthProfile.findByUserId(userId);
            
            if (!healthProfile) {
                console.log('HealthService - 未找到健康档案');
                return {
                    success: false,
                    message: '未找到健康档案'
                };
            }
            
            console.log('HealthService - 获取健康档案成功:', healthProfile);
            return {
                success: true,
                data: healthProfile
            };
        } catch (error) {
            console.error('HealthService - 获取健康档案失败:', error);
            throw error;
        }
    }
}

module.exports = new HealthService(); 