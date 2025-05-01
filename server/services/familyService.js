const Family = require('../models/Family');
const User = require('../models/User');
const HealthProfile = require('../models/healthModel');

class FamilyService {
    // Create family
    async createFamily(name, creatorId) {
        try {
            console.log('Create family service - Starting to check if user has joined other families');
            // Check if user has already joined another family
            const existingFamily = await Family.findByUserId(creatorId);
            console.log('Create family service - Check result:', existingFamily);
            
            if (existingFamily) {
                console.log('Create family service - Error: User has already joined another family');
                throw new Error('User has already joined another family');
            }

            console.log('Create family service - Starting to create new family');
            const family = new Family(name, creatorId);
            console.log('Create family service - New family object:', family);
            
            console.log('Create family service - Starting to save family');
            const savedFamily = await family.save();
            console.log('Create family service - Save result:', savedFamily);
            
            return savedFamily;
        } catch (error) {
            console.error('Create family service - Error:', error);
            throw error;
        }
    }

    // Join family
    async joinFamily(inviteCode, userId) {
        try {
            // Check if user has already joined another family
            const existingFamily = await Family.findByUserId(userId);
            if (existingFamily) {
                throw new Error('User has already joined another family');
            }

            // Find family
            const family = await Family.findByInviteCode(inviteCode);
            if (!family) {
                throw new Error('Invalid invite code');
            }

            // Add member
            const updatedFamily = await Family.addMember(family.id, userId);
            
            // Update user's familyId
            await User.updateFamilyId(userId, family.id);
            
            return updatedFamily;
        } catch (error) {
            throw error;
        }
    }

    // Get family information
    async getFamilyInfo(userId) {
        try {
            console.log('Get family info - Starting to find user\'s family');
            console.log('Get family info - User ID:', userId);
            
            const family = await Family.findByUserId(userId);
            console.log('Get family info - Family query result:', family);
            
            if (!family) {
                console.log('Get family info - User has not joined any family');
                return null;
            }

            // Get user information for all members
            console.log('Get family info - Starting to get member information');
            const membersWithInfo = await Promise.all(
                family.members.map(async (member) => {
                    console.log('Get family info - Getting member info:', member.userId);
                    const user = await User.findById(member.userId);
                    console.log('Get family info - Member info query result:', user);
                    return {
                        ...member,
                        username: user ? user.username : 'Unknown User',
                        email: user ? user.email : 'Unknown Email'
                    };
                })
            );

            const result = {
                ...family,
                members: membersWithInfo
            };
            console.log('Get family info - Final return result:', result);
            return result;
        } catch (error) {
            console.error('Get family info - Error:', error);
            throw error;
        }
    }

    // Remove family member
    async removeMember(familyId, userId, adminId) {
        try {
            console.log('FamilyService - removeMember - Starting:', { familyId, userId, adminId });
            
            // Find family
            const family = await Family.findById(familyId);
            if (!family) {
                console.log('FamilyService - removeMember - Family does not exist');
                return { success: false, message: 'Family does not exist' };
            }

            // If admin is removing other member, check permissions
            if (adminId && adminId !== userId) {
                const admin = family.members.find(m => m.userId === adminId);
                if (!admin || admin.role !== 'admin') {
                    console.log('FamilyService - removeMember - Operator is not admin');
                    return { success: false, message: 'Only admin can remove members' };
                }
            }

            // Check if user is a family member
            const memberIndex = family.members.findIndex(m => m.userId === userId);
            if (memberIndex === -1) {
                console.log('FamilyService - removeMember - User is not a family member');
                return { success: false, message: 'User is not a family member' };
            }

            // If last member, delete family
            if (family.members.length === 1) {
                console.log('FamilyService - removeMember - Removing last member, family will be deleted');
                await Family.delete(familyId);
                // Update user's familyId to null
                await User.updateFamilyId(userId, null);
                return { success: true, message: 'Family has been deleted' };
            }

            // If admin is leaving, transfer admin rights and creatorId
            if (family.members[memberIndex].role === 'admin') {
                console.log('FamilyService - removeMember - Admin leaving, need to transfer rights');
                // Find first non-admin member
                const newAdminIndex = family.members.findIndex(m => m.role !== 'admin' && m.userId !== userId);
                if (newAdminIndex !== -1) {
                    family.members[newAdminIndex].role = 'admin';
                    // Update creatorId to new admin's ID
                    family.creatorId = family.members[newAdminIndex].userId;
                }
            }

            // Remove user directly from members array
            family.members = family.members.filter(m => m.userId !== userId);

            // Update family information
            await Family.update(familyId, family);
            
            // Update user's familyId to null
            await User.updateFamilyId(userId, null);
            
            console.log('FamilyService - removeMember - Completed');
            return { success: true, message: 'Successfully removed member' };
        } catch (error) {
            console.error('FamilyService - removeMember - Error:', error);
            throw error;
        }
    }

    // Update member role
    async updateMemberRole(familyId, userId, newRole, adminId) {
        try {
            // Check if operator is admin
            const family = await Family.findByUserId(adminId);
            if (!family || family.id !== familyId) {
                throw new Error('No permission to operate');
            }

            const admin = family.members.find(m => m.userId === adminId);
            if (!admin || admin.role !== 'admin') {
                throw new Error('Only admin can update member roles');
            }

            // Update role
            const updatedFamily = await Family.updateMemberRole(familyId, userId, newRole);
            return updatedFamily;
        } catch (error) {
            throw error;
        }
    }

    // Get family members health tags
    async getFamilyHealthTags(familyId) {
        try {
            console.log('Get family members health tags - Starting:', familyId);

            // Get family information
            const family = await Family.findById(familyId);
            if (!family) {
                throw new Error('Family does not exist');
            }

            // Get user information for all members
            const membersWithInfo = await Promise.all(
                family.members.map(async (member) => {
                    console.log('Get member health tags - Starting to process member:', member.userId);
                    
                    const user = await User.findById(member.userId);
                    console.log('Get member health tags - User info:', user);
                    
                    const healthProfile = await HealthProfile.findByUserId(member.userId);
                    console.log('Get member health tags - Health profile:', healthProfile);
                    
                    // If no health profile, create an empty one
                    if (!healthProfile) {
                        console.log('Get member health tags - Member has no health profile, creating new profile');
                        const newHealthProfile = await HealthProfile.create({
                            userId: member.userId,
                            basicInfo: {},
                            healthConditions: {},
                            lifestyle: {},
                            dietaryGoals: {}
                        });
                        return {
                            userId: member.userId,
                            username: user ? user.username : 'Unknown User',
                            healthTags: newHealthProfile.healthTags || []
                        };
                    }

                    // Ensure health tags exist
                    const healthTags = healthProfile.healthTags || [];
                    console.log('Get member health tags - Health tags:', healthTags);
                    
                    return {
                        userId: member.userId,
                        username: user ? user.username : 'Unknown User',
                        healthTags: healthTags
                    };
                })
            );

            console.log('Get family members health tags - Success:', membersWithInfo);
            return membersWithInfo;
        } catch (error) {
            console.error('Failed to get family members health tags:', error);
            throw error;
        }
    }
}

module.exports = new FamilyService(); 