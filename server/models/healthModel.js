const { usersContainer } = require('../config/database');

class HealthProfile {
    constructor(userId, healthData) {
        this.id = userId;
        this.userId = userId;
        this.allergies = healthData.allergies || [];
        this.dietaryRestrictions = healthData.dietaryRestrictions || [];
        this.healthConditions = healthData.healthConditions || [];
        this.medications = healthData.medications || [];
        this.bloodType = healthData.bloodType || '';
        this.emergencyContact = healthData.emergencyContact || {};
        this.lastUpdated = new Date().toISOString();
    }

    async save() {
        try {
            const { resource } = await usersContainer.items.upsert({
                id: this.userId,
                healthProfile: {
                    allergies: this.allergies,
                    dietaryRestrictions: this.dietaryRestrictions,
                    healthConditions: this.healthConditions,
                    medications: this.medications,
                    bloodType: this.bloodType,
                    emergencyContact: this.emergencyContact,
                    lastUpdated: this.lastUpdated
                }
            });
            return resource;
        } catch (error) {
            console.error('保存健康档案失败:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const { resource } = await usersContainer.items.read(userId);
            return resource?.healthProfile || null;
        } catch (error) {
            console.error('获取健康档案失败:', error);
            throw error;
        }
    }
}

module.exports = HealthProfile; 