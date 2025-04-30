const Family = require('../models/Family');
const User = require('../models/User');
const HealthProfile = require('../models/healthModel');

class FamilyService {
    // 创建家庭
    async createFamily(name, creatorId) {
        try {
            console.log('创建家庭服务 - 开始检查用户是否已加入其他家庭');
            // 检查用户是否已经加入其他家庭
            const existingFamily = await Family.findByUserId(creatorId);
            console.log('创建家庭服务 - 检查结果:', existingFamily);
            
            if (existingFamily) {
                console.log('创建家庭服务 - 错误: 用户已加入其他家庭');
                throw new Error('用户已经加入其他家庭');
            }

            console.log('创建家庭服务 - 开始创建新家庭');
            const family = new Family(name, creatorId);
            console.log('创建家庭服务 - 新家庭对象:', family);
            
            console.log('创建家庭服务 - 开始保存家庭');
            const savedFamily = await family.save();
            console.log('创建家庭服务 - 保存结果:', savedFamily);
            
            return savedFamily;
        } catch (error) {
            console.error('创建家庭服务 - 错误:', error);
            throw error;
        }
    }

    // 加入家庭
    async joinFamily(inviteCode, userId) {
        try {
            // 检查用户是否已经加入其他家庭
            const existingFamily = await Family.findByUserId(userId);
            if (existingFamily) {
                throw new Error('用户已经加入其他家庭');
            }

            // 查找家庭
            const family = await Family.findByInviteCode(inviteCode);
            if (!family) {
                throw new Error('邀请码无效');
            }

            // 添加成员
            const updatedFamily = await Family.addMember(family.id, userId);
            return updatedFamily;
        } catch (error) {
            throw error;
        }
    }

    // 获取家庭信息
    async getFamilyInfo(userId) {
        try {
            console.log('获取家庭信息 - 开始查找用户家庭');
            console.log('获取家庭信息 - 用户ID:', userId);
            
            const family = await Family.findByUserId(userId);
            console.log('获取家庭信息 - 家庭查询结果:', family);
            
            if (!family) {
                console.log('获取家庭信息 - 用户未加入任何家庭');
                return null;
            }

            // 获取所有成员的用户信息
            console.log('获取家庭信息 - 开始获取成员信息');
            const membersWithInfo = await Promise.all(
                family.members.map(async (member) => {
                    console.log('获取家庭信息 - 获取成员信息:', member.userId);
                    const user = await User.findById(member.userId);
                    console.log('获取家庭信息 - 成员信息查询结果:', user);
                    return {
                        ...member,
                        username: user ? user.username : '未知用户',
                        email: user ? user.email : '未知邮箱'
                    };
                })
            );

            const result = {
                ...family,
                members: membersWithInfo
            };
            console.log('获取家庭信息 - 最终返回结果:', result);
            return result;
        } catch (error) {
            console.error('获取家庭信息 - 错误:', error);
            throw error;
        }
    }

    // 移除家庭成员
    async removeMember(familyId, userId) {
        try {
            console.log('FamilyService - removeMember - 开始:', { familyId, userId });
            
            // 查找家庭
            const family = await Family.findById(familyId);
            if (!family) {
                console.log('FamilyService - removeMember - 家庭不存在');
                return { success: false, message: '家庭不存在' };
            }

            // 检查用户是否是家庭成员
            const memberIndex = family.members.findIndex(m => m.userId === userId);
            if (memberIndex === -1) {
                console.log('FamilyService - removeMember - 用户不是家庭成员');
                return { success: false, message: '用户不是家庭成员' };
            }

            // 如果是最后一个成员，删除家庭
            if (family.members.length === 1) {
                console.log('FamilyService - removeMember - 删除最后一个成员，家庭将被删除');
                await Family.delete(familyId);
                return { success: true, message: '家庭已删除' };
            }

            // 如果是管理员，需要转移管理员权限
            if (family.members[memberIndex].role === 'admin') {
                console.log('FamilyService - removeMember - 管理员退出，需要转移权限');
                // 找到第一个非管理员成员
                const newAdminIndex = family.members.findIndex(m => m.role !== 'admin' && m.userId !== userId);
                if (newAdminIndex !== -1) {
                    family.members[newAdminIndex].role = 'admin';
                }
            }

            // 直接从 members 数组中删除用户
            family.members = family.members.filter(m => m.userId !== userId);

            // 更新家庭信息
            await Family.update(familyId, family);
            console.log('FamilyService - removeMember - 完成');
            return { success: true, message: '成功退出家庭' };
        } catch (error) {
            console.error('FamilyService - removeMember - 错误:', error);
            throw error;
        }
    }

    // 更新成员角色
    async updateMemberRole(familyId, userId, newRole, adminId) {
        try {
            // 检查操作者是否是管理员
            const family = await Family.findByUserId(adminId);
            if (!family || family.id !== familyId) {
                throw new Error('无权操作');
            }

            const admin = family.members.find(m => m.userId === adminId);
            if (!admin || admin.role !== 'admin') {
                throw new Error('只有管理员可以更新成员角色');
            }

            // 更新角色
            const updatedFamily = await Family.updateMemberRole(familyId, userId, newRole);
            return updatedFamily;
        } catch (error) {
            throw error;
        }
    }

    // 获取家庭成员健康标签
    async getFamilyHealthTags(familyId) {
        try {
            console.log('获取家庭成员健康标签 - 开始:', familyId);

            // 获取家庭信息
            const family = await Family.findById(familyId);
            if (!family) {
                throw new Error('家庭不存在');
            }

            // 获取所有成员的用户信息
            const membersWithInfo = await Promise.all(
                family.members.map(async (member) => {
                    console.log('获取成员健康标签 - 开始处理成员:', member.userId);
                    
                    const user = await User.findById(member.userId);
                    console.log('获取成员健康标签 - 用户信息:', user);
                    
                    const healthProfile = await HealthProfile.findByUserId(member.userId);
                    console.log('获取成员健康标签 - 健康档案:', healthProfile);
                    
                    // 如果没有健康档案，创建一个空的
                    if (!healthProfile) {
                        console.log('获取成员健康标签 - 成员没有健康档案，创建新档案');
                        const newHealthProfile = await HealthProfile.create({
                            userId: member.userId,
                            basicInfo: {},
                            healthConditions: {},
                            lifestyle: {},
                            dietaryGoals: {}
                        });
                        return {
                            userId: member.userId,
                            username: user ? user.username : '未知用户',
                            healthTags: newHealthProfile.healthTags || []
                        };
                    }

                    // 确保健康标签存在
                    const healthTags = healthProfile.healthTags || [];
                    console.log('获取成员健康标签 - 健康标签:', healthTags);
                    
                    return {
                        userId: member.userId,
                        username: user ? user.username : '未知用户',
                        healthTags: healthTags
                    };
                })
            );

            console.log('获取家庭成员健康标签 - 成功:', membersWithInfo);
            return membersWithInfo;
        } catch (error) {
            console.error('获取家庭成员健康标签失败:', error);
            throw error;
        }
    }
}

module.exports = new FamilyService(); 