const { familiesContainer } = require('../config/database');

/**
 * Family model class for managing family data and operations
 * @class Family
 */
class Family {
    /**
     * Creates a new Family instance
     * @param {string} name - The name of the family
     * @param {string} creatorId - The ID of the user creating the family
     */
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

    /**
     * Generates a unique invite code for the family
     * @returns {string} A 6-character uppercase alphanumeric code
     */
    generateInviteCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    /**
     * Saves the current family instance to the database
     * @async
     * @returns {Promise<Object>} The saved family object
     * @throws {Error} If save operation fails
     */
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

    /**
     * Finds a family by its ID
     * @static
     * @async
     * @param {string} id - The ID of the family to find
     * @returns {Promise<Object>} The found family object
     * @throws {Error} If family not found or query fails
     */
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

    /**
     * Finds a family by a user's ID
     * @static
     * @async
     * @param {string} userId - The ID of the user to search for
     * @returns {Promise<Object>} The found family object
     * @throws {Error} If family not found or query fails
     */
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

    /**
     * Finds a family by its invite code
     * @static
     * @async
     * @param {string} inviteCode - The invite code to search for
     * @returns {Promise<Object>} The found family object
     * @throws {Error} If family not found or query fails
     */
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

    /**
     * Deletes a family from the database
     * @static
     * @async
     * @param {string} id - The ID of the family to delete
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {Error} If deletion fails
     */
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

    /**
     * Updates a family's information
     * @static
     * @async
     * @param {string} id - The ID of the family to update
     * @param {Object} data - The updated family data
     * @returns {Promise<Object>} The updated family object
     * @throws {Error} If update fails
     */
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

    /**
     * Adds a new member to the family
     * @static
     * @async
     * @param {string} familyId - The ID of the family
     * @param {string} userId - The ID of the user to add
     * @returns {Promise<Object>} The updated family object
     * @throws {Error} If family doesn't exist, user is already a member, or update fails
     */
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