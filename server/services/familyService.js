const Family = require('../models/Family');
const User = require('../models/User');

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
        console.log('FamilyService - 开始移除成员:', { familyId, userId });
        try {
            console.log('FamilyService - 开始查找家庭');
            const family = await Family.findById(familyId);
            console.log('FamilyService - 查找到的家庭:', family);
            
            if (!family) {
                console.log('FamilyService - 家庭不存在');
                throw new Error('家庭不存在');
            }

            console.log('FamilyService - 开始查找成员');
            const memberIndex = family.members.findIndex(m => m.userId === userId);
            console.log('FamilyService - 成员索引:', memberIndex);
            
            if (memberIndex === -1) {
                console.log('FamilyService - 成员不存在');
                throw new Error('成员不存在');
            }

            // 如果是最后一个成员，删除整个家庭
            if (family.members.length === 1) {
                console.log('FamilyService - 最后一个成员，准备删除家庭');
                await Family.deleteById(familyId);
                console.log('FamilyService - 家庭已删除');
                return null;
            }

            // 如果是管理员，需要将管理员权限转移给其他成员
            if (family.members[memberIndex].role === 'admin') {
                console.log('FamilyService - 退出的是管理员，准备转移权限');
                const otherMembers = family.members.filter(m => m.userId !== userId);
                if (otherMembers.length > 0) {
                    console.log('FamilyService - 将管理员权限转移给:', otherMembers[0].userId);
                    otherMembers[0].role = 'admin';
                }
            }

            console.log('FamilyService - 准备移除成员');
            family.members = family.members.filter(m => m.userId !== userId);
            console.log('FamilyService - 开始保存更新后的家庭信息');
            await family.save();
            console.log('FamilyService - 家庭信息已更新');
            return family;
        } catch (error) {
            console.error('FamilyService - 移除成员失败:', error);
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
}

module.exports = new FamilyService(); 