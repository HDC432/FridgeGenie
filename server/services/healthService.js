const HealthProfile = require('../models/HealthProfile');

/**
 * Service class for managing user health profiles and related operations
 * @class HealthService
 */
class HealthService {
    /**
     * Creates or updates a user's health profile
     * @async
     * @param {string} userId - The unique identifier of the user
     * @param {Object} healthData - The health profile data to be saved
     * @param {number} healthData.height - User's height in centimeters
     * @param {number} healthData.weight - User's weight in kilograms
     * @param {string} healthData.bloodType - User's blood type
     * @param {Array<string>} healthData.allergies - List of user's allergies
     * @param {Array<string>} healthData.dietaryRestrictions - List of user's dietary restrictions
     * @returns {Promise<Object>} Object containing success status and health profile data
     * @throws {Error} If the operation fails
     */
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

    /**
     * Retrieves a user's health profile
     * @async
     * @param {string} userId - The unique identifier of the user
     * @returns {Promise<Object>} Object containing success status and health profile data
     * @throws {Error} If the operation fails
     */
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