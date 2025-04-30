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

    // 生成健康标签
    generateHealthTags() {
        const tags = [];
        
        // 根据基本健康信息生成标签
        if (this.basicInfo.height && this.basicInfo.weight) {
            const bmi = this.calculateBMI();
            if (bmi >= 30) {
                tags.push('减脂需求');
            } else if (bmi >= 25) {
                tags.push('减脂需求');
            } else if (bmi >= 18.5) {
                tags.push('维持体重');
            } else {
                tags.push('增肌需求');
            }
        }

        // 根据健康状况生成标签
        if (this.healthConditions.hasDiabetes) {
            tags.push('控制血糖');
        }
        if (this.healthConditions.hasHypertension) {
            tags.push('控制血压');
        }
        if (this.healthConditions.hasHeartDisease) {
            tags.push('注意心脏健康');
        }
        if (this.healthConditions.hasKidneyDisease) {
            tags.push('注意肾脏健康');
        }
        if (this.healthConditions.hasAllergies.length > 0) {
            tags.push(`过敏: ${this.healthConditions.hasAllergies.join(', ')}`);
        }

        // 根据生活方式生成标签
        if (this.lifestyle.isVegetarian) {
            tags.push('素食');
        }
        if (this.lifestyle.isVegan) {
            tags.push('纯素');
        }
        if (this.lifestyle.isGlutenFree) {
            tags.push('无麸质');
        }
        if (this.lifestyle.isLactoseFree) {
            tags.push('无乳糖');
        }

        // 根据活动水平生成标签
        switch (this.lifestyle.activityLevel) {
            case 'sedentary':
                tags.push('久坐');
                break;
            case 'light':
                tags.push('轻度活动');
                break;
            case 'moderate':
                tags.push('中度活动');
                break;
            case 'active':
                tags.push('活跃');
                break;
            case 'very_active':
                tags.push('非常活跃');
                break;
        }

        // 根据饮食目标生成标签
        switch (this.dietaryGoals.weightGoal) {
            case 'lose':
                tags.push('减脂需求');
                break;
            case 'gain':
                tags.push('增肌需求');
                break;
            case 'maintain':
                tags.push('维持体重');
                break;
        }

        // 如果有具体的营养目标，添加相应标签
        if (this.dietaryGoals.calorieGoal) {
            tags.push(`目标卡路里: ${this.dietaryGoals.calorieGoal}kcal`);
        }
        if (this.dietaryGoals.proteinGoal) {
            tags.push(`目标蛋白质: ${this.dietaryGoals.proteinGoal}g`);
        }
        if (this.dietaryGoals.carbGoal) {
            tags.push(`目标碳水: ${this.dietaryGoals.carbGoal}g`);
        }
        if (this.dietaryGoals.fatGoal) {
            tags.push(`目标脂肪: ${this.dietaryGoals.fatGoal}g`);
        }

        return tags;
    }

    // 计算BMI
    calculateBMI() {
        if (!this.basicInfo.height || !this.basicInfo.weight) return null;
        const heightInMeters = this.basicInfo.height / 100;
        return this.basicInfo.weight / (heightInMeters * heightInMeters);
    }

    static async findByUserId(userId) {
        try {
            console.log('查询健康档案 - 开始:', userId);
            const { resources } = await healthProfilesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            
            if (!resources || resources.length === 0) {
                console.log('查询健康档案 - 未找到:', userId);
                return null;
            }
            
            console.log('查询健康档案 - 找到:', resources[0]);
            return new HealthProfile(resources[0]);
        } catch (error) {
            console.error('查询健康档案失败:', error);
            throw error;
        }
    }

    static async create(data) {
        try {
            console.log('创建健康档案 - 开始:', data);
            const profile = new HealthProfile(data);
            // 确保生成健康标签
            profile.healthTags = profile.generateHealthTags();
            const { resource } = await healthProfilesContainer.items.create(profile);
            console.log('创建健康档案 - 成功:', resource);
            return new HealthProfile(resource);
        } catch (error) {
            console.error('创建健康档案失败:', error);
            throw error;
        }
    }

    static async update(userId, data) {
        try {
            console.log('更新健康档案 - 开始:', { userId, data });
            let profile = await this.findByUserId(userId);
            
            if (!profile) {
                // 如果找不到健康档案，则创建新的
                console.log('未找到现有健康档案，创建新的健康档案');
                return await this.create({ ...data, userId });
            }

            // 更新现有健康档案
            const updatedProfile = {
                ...profile,
                ...data,
                updatedAt: new Date().toISOString()
            };
            
            // 重新生成健康标签
            const newProfile = new HealthProfile(updatedProfile);
            newProfile.healthTags = newProfile.generateHealthTags();

            const { resource } = await healthProfilesContainer.items.upsert(newProfile);
            console.log('更新健康档案 - 成功:', resource);
            return new HealthProfile(resource);
        } catch (error) {
            console.error('更新健康档案失败:', error);
            throw error;
        }
    }

    static async delete(userId) {
        try {
            console.log('删除健康档案 - 开始:', userId);
            const profile = await this.findByUserId(userId);
            if (!profile) {
                throw new Error('健康档案不存在');
            }

            await healthProfilesContainer.item(profile.id).delete();
            console.log('删除健康档案 - 成功:', userId);
            return true;
        } catch (error) {
            console.error('删除健康档案失败:', error);
            throw error;
        }
    }
}

module.exports = HealthProfile; 