const HealthProfile = require('../models/healthModel');

class HealthController {
    static async updateHealthProfile(req, res) {
        try {
            const userId = req.user.id;
            if (!userId) {
                return res.status(400).json({ 
                    success: false,
                    message: 'User ID cannot be empty' 
                });
            }

            const data = req.body;
            const updatedProfile = await HealthProfile.update(userId, data);
            res.json({
                success: true,
                message: 'Health profile updated successfully',
                data: updatedProfile
            });
        } catch (error) {
            console.error('Failed to update health profile:', error);
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
                    message: 'User ID cannot be empty' 
                });
            }

            const profile = await HealthProfile.findByUserId(userId);
            if (!profile) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Health profile not found' 
                });
            }

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Failed to get health profile:', error);
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
                    message: 'User ID cannot be empty' 
                });
            }

            const data = { ...req.body, userId };
            const profile = await HealthProfile.create(data);
            res.status(201).json({
                success: true,
                message: 'Health profile created successfully',
                data: profile
            });
        } catch (error) {
            console.error('Failed to create health profile:', error);
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
                    message: 'User ID cannot be empty' 
                });
            }

            await HealthProfile.delete(userId);
            res.status(204).send();
        } catch (error) {
            console.error('Failed to delete health profile:', error);
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }
}

module.exports = HealthController; 