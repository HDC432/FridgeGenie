const familyService = require('../services/familyService');
const Family = require('../models/Family');
const User = require('../models/User');
const HealthProfile = require('../models/healthModel');

class FamilyController {
    // Create family
    async createFamily(req, res) {
        try {
            console.log('Create family - Request body:', req.body);
            console.log('Create family - User ID:', req.user.id);
            
            const { name } = req.body;
            const userId = req.user.id;

            if (!name) {
                console.log('Create family - Error: Missing family name');
                return res.status(400).json({
                    success: false,
                    message: 'Please provide family name'
                });
            }

            console.log('Create family - Starting service call');
            const family = await familyService.createFamily(name, userId);
            console.log('Create family - Service response:', family);
            
            res.status(201).json({
                success: true,
                data: family
            });
        } catch (error) {
            console.error('Create family - Error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Join family
    async joinFamily(req, res) {
        try {
            const { inviteCode } = req.body;
            const userId = req.user.id;

            if (!inviteCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide invite code'
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

    // Get family information
    async getFamilyInfo(req, res) {
        try {
            console.log('Get family info - Starting request processing');
            const userId = req.user.id;
            console.log('Get family info - User ID:', userId);
            
            const family = await familyService.getFamilyInfo(userId);
            console.log('Get family info - Query result:', family);
            
            res.status(200).json({
                success: true,
                data: family
            });
        } catch (error) {
            console.error('Get family info - Error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Remove family member
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

    // Update member role
    async updateMemberRole(req, res) {
        try {
            const { familyId, userId } = req.params;
            const { role } = req.body;
            const adminId = req.user.id;

            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide new role'
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
            
            console.log('FamilyController - leaveFamily - Starting request processing');
            console.log('FamilyController - leaveFamily - Request parameters:', { familyId, userId });
            console.log('FamilyController - leaveFamily - User info:', req.user);
            
            console.log('FamilyController - leaveFamily - Starting familyService.removeMember call');
            const result = await familyService.removeMember(familyId, userId);
            console.log('FamilyController - leaveFamily - Service response:', result);
            
            if (!result.success) {
                console.log('FamilyController - leaveFamily - Operation failed:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
            
            console.log('FamilyController - leaveFamily - Operation successful');
            res.status(200).json({
                success: true,
                data: null,
                message: result.message
            });
        } catch (error) {
            console.error('FamilyController - leaveFamily - Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to leave family'
            });
        }
    }

    // Get family members' health tags
    async getFamilyHealthTags(req, res) {
        try {
            const { familyId } = req.params;
            console.log('Get family health tags - Starting:', familyId);

            const healthTags = await familyService.getFamilyHealthTags(familyId);

            console.log('Get family health tags - Success:', healthTags);
            res.json({
                success: true,
                message: 'Successfully retrieved family health tags',
                data: healthTags
            });
        } catch (error) {
            console.error('Failed to get family health tags:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get family health tags',
                error: error.message
            });
        }
    }

    // Get family members
    async getFamilyMembers(req, res) {
        try {
            const { familyId } = req.params;
            console.log('Get family members - Starting:', familyId);

            // Get family information
            const family = await Family.findById(familyId);
            if (!family) {
                throw new Error('Family not found');
            }

            // Get user information for all members
            const membersWithInfo = await Promise.all(
                family.members.map(async (member) => {
                    const user = await User.findById(member.userId);
                    return {
                        ...member,
                        username: user ? user.username : 'Unknown user',
                        email: user ? user.email : 'Unknown email'
                    };
                })
            );

            console.log('Get family members - Success:', membersWithInfo);
            res.json({
                success: true,
                message: 'Successfully retrieved family members',
                data: membersWithInfo
            });
        } catch (error) {
            console.error('Failed to get family members:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get family members',
                error: error.message
            });
        }
    }
}

module.exports = new FamilyController(); 