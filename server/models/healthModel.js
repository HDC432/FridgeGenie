const { healthProfilesContainer } = require('../config/database');

class HealthProfile {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.userId = data.userId;
        this.basicInfo = {
            height: data.basicInfo?.height || null,
            weight: data.basicInfo?.weight || null,
            age: data.basicInfo?.age || null,
            gender: data.basicInfo?.gender || null,
            bloodType: data.basicInfo?.bloodType || null,
        };
        this.healthConditions = {
            hasDiabetes: data.healthConditions?.hasDiabetes || false,
            hasHypertension: data.healthConditions?.hasHypertension || false,
            hasHeartDisease: data.healthConditions?.hasHeartDisease || false,
            hasKidneyDisease: data.healthConditions?.hasKidneyDisease || false,
            hasAllergies: data.healthConditions?.hasAllergies || [],
        };
        this.lifestyle = {
            isVegetarian: data.lifestyle?.isVegetarian || false,
            isVegan: data.lifestyle?.isVegan || false,
            isGlutenFree: data.lifestyle?.isGlutenFree || false,
            isLactoseFree: data.lifestyle?.isLactoseFree || false,
            activityLevel: data.lifestyle?.activityLevel || 'moderate',
        };
        this.dietaryGoals = {
            weightGoal: data.dietaryGoals?.weightGoal || 'maintain',
            calorieGoal: data.dietaryGoals?.calorieGoal || null,
            proteinGoal: data.dietaryGoals?.proteinGoal || null,
            carbGoal: data.dietaryGoals?.carbGoal || null,
            fatGoal: data.dietaryGoals?.fatGoal || null,
        };
        this.healthTags = this.generateHealthTags();
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    // Generate health tags
    generateHealthTags() {
        const tags = [];
        
        // Generate tags based on basic health information
        if (this.basicInfo.height && this.basicInfo.weight) {
            const bmi = this.calculateBMI();
            if (bmi >= 30) {
                tags.push('weight loss');
            } else if (bmi >= 25) {
                tags.push('weight loss');
            } else if (bmi >= 18.5) {
                tags.push('weight maintenance');
            } else {
                tags.push('muscle gain');
            }
        }

        // Generate tags based on health conditions
        if (this.healthConditions.hasDiabetes) {
            tags.push('blood sugar control');
        }
        if (this.healthConditions.hasHypertension) {
            tags.push('blood pressure control');
        }
        if (this.healthConditions.hasHeartDisease) {
            tags.push('heart health');
        }
        if (this.healthConditions.hasKidneyDisease) {
            tags.push('kidney health');
        }
        if (this.healthConditions.hasAllergies.length > 0) {
            tags.push('allergies');
        }

        // Generate tags based on lifestyle
        if (this.lifestyle.isVegetarian) {
            tags.push('vegetarian');
        }
        if (this.lifestyle.isVegan) {
            tags.push('vegan');
        }
        if (this.lifestyle.isGlutenFree) {
            tags.push('gluten-free');
        }
        if (this.lifestyle.isLactoseFree) {
            tags.push('lactose-free');
        }

        // Generate tags based on activity level
        switch (this.lifestyle.activityLevel) {
            case 'sedentary':
                tags.push('sedentary');
                break;
            case 'light':
                tags.push('lightly active');
                break;
            case 'moderate':
                tags.push('moderately active');
                break;
            case 'active':
                tags.push('active');
                break;
            case 'very_active':
                tags.push('very active');
                break;
        }

        // Generate tags based on dietary goals
        switch (this.dietaryGoals.weightGoal) {
            case 'lose':
                tags.push('weight loss');
                break;
            case 'gain':
                tags.push('muscle gain');
                break;
            case 'maintain':
                tags.push('weight maintenance');
                break;
        }

        // Add specific nutrition goal tags if they exist
        if (this.dietaryGoals.calorieGoal) {
            tags.push(`calorie goal: ${this.dietaryGoals.calorieGoal}kcal`);
        }
        if (this.dietaryGoals.proteinGoal) {
            tags.push(`protein goal: ${this.dietaryGoals.proteinGoal}g`);
        }
        if (this.dietaryGoals.carbGoal) {
            tags.push(`carb goal: ${this.dietaryGoals.carbGoal}g`);
        }
        if (this.dietaryGoals.fatGoal) {
            tags.push(`fat goal: ${this.dietaryGoals.fatGoal}g`);
        }

        return tags;
    }

    // Calculate BMI
    calculateBMI() {
        if (!this.basicInfo.height || !this.basicInfo.weight) return null;
        const heightInMeters = this.basicInfo.height / 100;
        return this.basicInfo.weight / (heightInMeters * heightInMeters);
    }

    static async findByUserId(userId) {
        try {
            console.log('Querying health profile - Starting:', userId);
            const { resources } = await healthProfilesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            
            if (!resources || resources.length === 0) {
                console.log('Querying health profile - Not found:', userId);
                return null;
            }
            
            console.log('Querying health profile - Found:', resources[0]);
            return new HealthProfile(resources[0]);
        } catch (error) {
            console.error('Failed to query health profile:', error);
            throw error;
        }
    }

    static async create(data) {
        try {
            console.log('Creating health profile - Starting:', data);
            const profile = new HealthProfile(data);
            // Ensure health tags are generated
            profile.healthTags = profile.generateHealthTags();
            const { resource } = await healthProfilesContainer.items.create(profile);
            console.log('Creating health profile - Success:', resource);
            return new HealthProfile(resource);
        } catch (error) {
            console.error('Failed to create health profile:', error);
            throw error;
        }
    }

    static async update(userId, data) {
        try {
            console.log('Updating health profile - Starting:', { userId, data });
            let profile = await this.findByUserId(userId);
            
            if (!profile) {
                // If no existing profile, create new one
                console.log('No existing health profile found, creating new one');
                return await this.create({ ...data, userId });
            }

            // Merge existing data with new data
            const updatedData = {
                ...profile,
                basicInfo: {
                    ...profile.basicInfo,
                    ...data.basicInfo
                },
                healthConditions: {
                    ...profile.healthConditions,
                    ...data.healthConditions
                },
                lifestyle: {
                    ...profile.lifestyle,
                    ...data.lifestyle
                },
                dietaryGoals: {
                    ...profile.dietaryGoals,
                    ...data.dietaryGoals
                },
                updatedAt: new Date().toISOString()
            };
            
            // Create new profile instance with merged data
            const newProfile = new HealthProfile(updatedData);
            
            // Update in database
            const { resource } = await healthProfilesContainer.items.upsert(newProfile);
            console.log('Health profile update successful:', resource);
            
            return new HealthProfile(resource);
        } catch (error) {
            console.error('Health profile update failed:', error);
            throw error;
        }
    }

    static async delete(userId) {
        try {
            console.log('Deleting health profile - Starting:', userId);
            const profile = await this.findByUserId(userId);
            if (!profile) {
                throw new Error('Health profile does not exist');
            }

            await healthProfilesContainer.item(profile.id).delete();
            console.log('Deleting health profile - Success:', userId);
            return true;
        } catch (error) {
            console.error('Failed to delete health profile:', error);
            throw error;
        }
    }
}

module.exports = HealthProfile; 