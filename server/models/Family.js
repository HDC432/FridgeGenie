const { familiesContainer } = require('../config/database');

class Family {
    constructor(name, creatorId) {
        console.log('Family constructor - Parameters:', { name, creatorId });
        this.name = name;
        this.creatorId = creatorId;
        this.members = [{
            userId: creatorId,
            role: 'admin',
            status: 'active',
            joinedAt: new Date()
        }];
        this.inviteCode = this.generateInviteCode();
        this.createdAt = new Date();
        console.log('Family constructor - Created object:', this);
    }

    // Generate invite code
    generateInviteCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Save family
    async save() {
        try {
            console.log('Saving family - Starting:', this);
            const { resource } = await familiesContainer.items.create(this);
            console.log('Saving family - Completed:', resource);
            return resource;
        } catch (error) {
            console.error('Error saving family:', error);
            throw error;
        }
    }

    // Find family (by ID)
    static async findById(id) {
        try {
            console.log('Finding family - By ID:', id);
            const { resource } = await familiesContainer.item(id, id).read();
            console.log('Finding family - Query result:', resource);
            return resource;
        } catch (error) {
            console.error('Error finding family:', error);
            throw error;
        }
    }

    // Find family (by user ID)
    static async findByUserId(userId) {
        try {
            console.log('Finding family - By user ID:', userId);
            const { resources } = await familiesContainer.items.query({
                query: "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, {userId: @userId}, true)",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('Finding family - Query result:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('Error finding family:', error);
            throw error;
        }
    }

    // Find family (by invite code)
    static async findByInviteCode(inviteCode) {
        try {
            console.log('Finding family - By invite code:', inviteCode);
            const { resources } = await familiesContainer.items.query({
                query: "SELECT * FROM c WHERE c.inviteCode = @inviteCode",
                parameters: [{ name: "@inviteCode", value: inviteCode }]
            }).fetchAll();
            console.log('Finding family - Query result:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('Error finding family:', error);
            throw error;
        }
    }

    // Delete family
    static async delete(id) {
        try {
            console.log('Deleting family - Starting:', id);
            await familiesContainer.item(id, id).delete();
            console.log('Deleting family - Completed');
            return true;
        } catch (error) {
            console.error('Error deleting family:', error);
            throw error;
        }
    }

    // Update family information
    static async update(id, data) {
        try {
            console.log('Updating family - Starting:', { id, data });
            const { resource } = await familiesContainer.item(id, id).replace(data);
            console.log('Updating family - Completed:', resource);
            return resource;
        } catch (error) {
            console.error('Error updating family:', error);
            throw error;
        }
    }

    // Add member
    static async addMember(familyId, userId) {
        try {
            console.log('Adding member - Starting:', { familyId, userId });
            const family = await Family.findById(familyId);
            
            if (!family) {
                throw new Error('Family does not exist');
            }

            // Check if user is already a member
            const isMember = family.members.some(member => member.userId === userId);
            if (isMember) {
                throw new Error('User is already a family member');
            }

            // Add new member
            family.members.push({
                userId,
                role: 'member',
                status: 'active',
                joinedAt: new Date()
            });

            // Update family information
            const updatedFamily = await Family.update(familyId, family);
            console.log('Adding member - Completed:', updatedFamily);
            return updatedFamily;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    }
}

module.exports = Family; 