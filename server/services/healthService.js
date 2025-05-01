const HealthProfile = require('../models/HealthProfile');

class HealthService {
    // Create or update health profile
    async updateHealthProfile(userId, healthData) {
        try {
            console.log('HealthService - Starting to update health profile:', { userId, healthData });
            
            const healthProfile = new HealthProfile(userId, healthData);
            const result = await healthProfile.save();
            
            console.log('HealthService - Health profile updated successfully:', result);
            return {
                success: true,
                data: result.healthProfile
            };
        } catch (error) {
            console.error('HealthService - Failed to update health profile:', error);
            throw error;
        }
    }

    // Get health profile
    async getHealthProfile(userId) {
        try {
            console.log('HealthService - Starting to get health profile:', userId);
            
            const healthProfile = await HealthProfile.findByUserId(userId);
            
            if (!healthProfile) {
                console.log('HealthService - Health profile not found');
                return {
                    success: false,
                    message: 'Health profile not found'
                };
            }
            
            console.log('HealthService - Successfully retrieved health profile:', healthProfile);
            return {
                success: true,
                data: healthProfile
            };
        } catch (error) {
            console.error('HealthService - Failed to get health profile:', error);
            throw error;
        }
    }
}

module.exports = new HealthService(); 