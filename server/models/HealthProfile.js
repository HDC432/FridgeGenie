const { usersContainer } = require('../config/database');

class HealthProfile {
    constructor(userId, data) {
        this.userId = userId;
        this.basicInfo = {
            height: data.height || null, // 身高(cm)
            weight: data.weight || null, // 体重(kg)
            age: data.age || null, // 年龄
            gender: data.gender || null, // 性别
            bloodType: data.bloodType || null, // 血型
        };
        this.healthConditions = {
            hasDiabetes: data.hasDiabetes || false, // 是否有糖尿病
            hasHypertension: data.hasHypertension || false, // 是否有高血压
            hasHeartDisease: data.hasHeartDisease || false, // 是否有心脏病
            hasKidneyDisease: data.hasKidneyDisease || false, // 是否有肾病
            hasAllergies: data.hasAllergies || [], // 过敏原列表
        };
        this.lifestyle = {
            isVegetarian: data.isVegetarian || false, // 是否素食
            isVegan: data.isVegan || false, // 是否纯素
            isGlutenFree: data.isGlutenFree || false, // 是否无麸质
            isLactoseFree: data.isLactoseFree || false, // 是否无乳糖
            activityLevel: data.activityLevel || 'moderate', // 活动水平：sedentary, light, moderate, active, very_active
        };
        this.dietaryGoals = {
            weightGoal: data.weightGoal || 'maintain', // 体重目标：lose, maintain, gain
            calorieGoal: data.calorieGoal || null, // 每日卡路里目标
            proteinGoal: data.proteinGoal || null, // 每日蛋白质目标(g)
            carbGoal: data.carbGoal || null, // 每日碳水目标(g)
            fatGoal: data.fatGoal || null, // 每日脂肪目标(g)
        };
        this.healthTags = this.generateHealthTags();
    }

    // 生成健康标签
    generateHealthTags() {
        const tags = [];
        
        // 根据基本健康信息生成标签
        if (this.basicInfo.height && this.basicInfo.weight) {
            const bmi = this.calculateBMI();
            if (bmi >= 25) {
                tags.push('需要减重');
            } else if (bmi < 18.5) {
                tags.push('需要增重');
            }
        }

        // 根据健康状况生成标签
        if (this.healthConditions.hasDiabetes) {
            tags.push('注意血糖');
        }
        if (this.healthConditions.hasHypertension) {
            tags.push('注意血压');
        }
        if (this.healthConditions.hasHeartDisease) {
            tags.push('注意心脏健康');
        }
        if (this.healthConditions.hasKidneyDisease) {
            tags.push('注意肾脏健康');
        }
        if (this.healthConditions.hasAllergies.length > 0) {
            tags.push('注意过敏原');
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

        // 根据饮食目标生成标签
        if (this.dietaryGoals.weightGoal === 'lose') {
            tags.push('减脂');
        } else if (this.dietaryGoals.weightGoal === 'gain') {
            tags.push('增肌');
        }

        return tags;
    }

    // 计算BMI
    calculateBMI() {
        if (!this.basicInfo.height || !this.basicInfo.weight) return null;
        const heightInMeters = this.basicInfo.height / 100;
        return this.basicInfo.weight / (heightInMeters * heightInMeters);
    }

    // 保存健康档案
    async save() {
        try {
            const { resource } = await usersContainer.items.upsert({
                id: this.userId,
                healthProfile: {
                    basicInfo: this.basicInfo,
                    healthConditions: this.healthConditions,
                    lifestyle: this.lifestyle,
                    dietaryGoals: this.dietaryGoals,
                    healthTags: this.healthTags,
                    updatedAt: new Date().toISOString()
                }
            });
            return resource;
        } catch (error) {
            console.error('保存健康档案失败:', error);
            throw error;
        }
    }

    // 获取健康档案
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