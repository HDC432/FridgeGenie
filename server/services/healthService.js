const HealthProfile = require('../models/healthModel');

class HealthService {
    // Create or update health profile
    async updateHealthProfile(userId, healthData) {
        try {
            console.log('HealthService - Starting health profile update:', { userId, healthData });
            
            // Use the static update method from HealthProfile model
            const updatedProfile = await HealthProfile.update(userId, healthData);
            
            console.log('HealthService - Health profile update successful:', updatedProfile);
            return {
                success: true,
                data: updatedProfile
            };
        } catch (error) {
            console.error('HealthService - Health profile update failed:', error);
            throw error;
        }
    }

    // Get health profile
    async getHealthProfile(userId) {
        try {
            console.log('HealthService - Starting health profile retrieval:', userId);
            
            const healthProfile = await HealthProfile.findByUserId(userId);
            
            if (!healthProfile) {
                console.log('HealthService - Health profile not found');
                return {
                    success: false,
                    message: 'Health profile not found'
                };
            }
            
            console.log('HealthService - Health profile retrieval successful:', healthProfile);
            return {
                success: true,
                data: healthProfile
            };
        } catch (error) {
            console.error('HealthService - Health profile retrieval failed:', error);
            throw error;
        }
    }
}

module.exports = new HealthService(); 