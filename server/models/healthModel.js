const { usersContainer } = require('../config/database');

class HealthProfile {
    constructor(userId, data) {
        console.log('创建健康档案对象，用户ID:', userId);
        console.log('健康数据:', data);
        this.userId = userId;
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
        console.log('健康档案对象创建完成:', this);
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

    // 获取健康档案
    static async findByUserId(userId) {
        try {
            console.log('开始查询健康档案，用户ID:', userId);
            const { resource } = await usersContainer.item(userId, userId).read();
            console.log('查询结果:', resource);
            return resource?.healthProfile || null;
        } catch (error) {
            console.error('获取健康档案失败，详细错误:', error);
            console.error('错误堆栈:', error.stack);
            throw error;
        }
    }

    // 保存健康档案
    async save() {
        try {
            console.log('开始保存健康档案到数据库');
            const document = {
                id: this.userId,
                partitionKey: this.userId,
                healthProfile: {
                    basicInfo: this.basicInfo,
                    healthConditions: this.healthConditions,
                    lifestyle: this.lifestyle,
                    dietaryGoals: this.dietaryGoals,
                    healthTags: this.healthTags,
                    updatedAt: new Date().toISOString()
                }
            };
            console.log('要保存的文档:', document);
            
            const { resource } = await usersContainer.items.upsert(document);
            console.log('保存成功，返回的资源:', resource);
            return resource;
        } catch (error) {
            console.error('保存健康档案失败，详细错误:', error);
            console.error('错误堆栈:', error.stack);
            throw error;
        }
    }
}

module.exports = HealthProfile; 