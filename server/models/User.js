const { usersContainer } = require('../config/database');
const bcrypt = require('bcryptjs');
const HealthProfile = require('./healthModel');

class User {
    constructor(username, email, password, familyId = null) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.familyId = familyId;
        this.createdAt = new Date();
        this.lastLogin = null;
    }

    static async create(data) {
        try {
            console.log('Creating user - Starting:', data);
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const user = new User(data.username, data.email, hashedPassword, data.familyId);
            const { resource } = await usersContainer.items.create(user);
            console.log('Creating user - Success:', resource);

            // Automatically create health profile
            try {
                console.log('Starting to create default health profile');
                const defaultHealthProfile = {
                    userId: resource.id,
                    basicInfo: {
                        height: null,
                        weight: null,
                        age: null,
                        gender: null,
                        bloodType: null
                    },
                    healthConditions: {
                        hasDiabetes: false,
                        hasHypertension: false,
                        hasHeartDisease: false,
                        hasKidneyDisease: false,
                        hasAllergies: []
                    },
                    lifestyle: {
                        isVegetarian: false,
                        isVegan: false,
                        isGlutenFree: false,
                        isLactoseFree: false,
                        activityLevel: 'moderate'
                    },
                    dietaryGoals: {
                        weightGoal: 'maintain',
                        calorieGoal: null,
                        proteinGoal: null,
                        carbGoal: null,
                        fatGoal: null
                    }
                };
                await HealthProfile.create(defaultHealthProfile);
                console.log('Default health profile created successfully');
            } catch (error) {
                console.error('Failed to create default health profile:', error);
                // Even if health profile creation fails, it doesn't affect user creation
            }

            return resource;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    // Save user
    async save() {
        try {
            console.log('Saving user - Starting:', this);
            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            
            const { resource } = await usersContainer.items.create(this);
            console.log('Saving user - Completed:', resource);
            return resource;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }

    // Verify password
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Find user (by ID)
    static async findById(userId) {
        try {
            console.log('Finding user - By user ID:', userId);
            const { resources } = await usersContainer.items.query({
                query: "SELECT * FROM c WHERE c.id = @userId",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('Finding user - Query result:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    // Find user (by email)
    static async findByEmail(email) {
        try {
            console.log('Finding user - By email:', email);
            const { resources } = await usersContainer.items.query({
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: email }]
            }).fetchAll();
            console.log('Finding user - Query result:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    // Find user (by username)
    static async findByUsername(username) {
        try {
            console.log('Finding user - By username:', username);
            const { resources } = await usersContainer.items.query({
                query: "SELECT * FROM c WHERE c.username = @username",
                parameters: [{ name: "@username", value: username }]
            }).fetchAll();
            console.log('Finding user - Query result:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    // Update last login time
    static async updateLastLogin(userId) {
        try {
            console.log('Updating last login time - User ID:', userId);
            
            // First check if user exists
            const user = await User.findById(userId);
            if (!user) {
                console.error('Error updating last login time: User does not exist');
                throw new Error('User does not exist');
            }

            // Use replace operation instead of patch
            const { resource } = await usersContainer.item(userId, userId).replace({
                ...user,
                lastLogin: new Date()
            });
            
            console.log('Updating last login time - Completed:', resource);
            return resource;
        } catch (error) {
            console.error('Error updating last login time:', error);
            throw error;
        }
    }

    // Update user family ID
    static async updateFamilyId(userId, familyId) {
        try {
            console.log('Updating user family ID - User ID:', userId, 'Family ID:', familyId);
            
            // First check if user exists
            const user = await User.findById(userId);
            if (!user) {
                console.error('Error updating user family ID: User does not exist');
                throw new Error('User does not exist');
            }

            // Use replace operation instead of patch
            const { resource } = await usersContainer.item(userId, userId).replace({
                ...user,
                familyId: familyId
            });
            
            console.log('Updating user family ID - Completed:', resource);
            return resource;
        } catch (error) {
            console.error('Error updating user family ID:', error);
            throw error;
        }
    }
}

module.exports = User; 