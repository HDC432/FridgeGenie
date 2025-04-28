const { familiesContainer } = require('../config/database');

class Family {
    constructor(name, creatorId) {
        console.log('Family 构造函数 - 参数:', { name, creatorId });
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
        console.log('Family 构造函数 - 创建的对象:', this);
    }

    // 生成邀请码
    generateInviteCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // 保存家庭
    async save() {
        try {
            console.log('保存家庭 - 开始:', this);
            const { resource } = await familiesContainer.items.create(this);
            console.log('保存家庭 - 完成:', resource);
            return resource;
        } catch (error) {
            console.error('保存家庭错误:', error);
            throw error;
        }
    }

    // 查找家庭（通过ID）
    static async findById(id) {
        try {
            console.log('查找家庭 - 通过ID:', id);
            const { resource } = await familiesContainer.item(id).read();
            console.log('查找家庭 - 查询结果:', resource);
            return resource;
        } catch (error) {
            console.error('查找家庭错误:', error);
            throw error;
        }
    }

    // 查找家庭（通过用户ID）
    static async findByUserId(userId) {
        try {
            console.log('查找家庭 - 通过用户ID:', userId);
            const { resources } = await familiesContainer.items.query({
                query: "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, {userId: @userId}, true)",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('查找家庭 - 查询结果:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('查找家庭错误:', error);
            throw error;
        }
    }

    // 查找家庭（通过邀请码）
    static async findByInviteCode(inviteCode) {
        try {
            console.log('查找家庭 - 通过邀请码:', inviteCode);
            const { resources } = await familiesContainer.items.query({
                query: "SELECT * FROM c WHERE c.inviteCode = @inviteCode",
                parameters: [{ name: "@inviteCode", value: inviteCode }]
            }).fetchAll();
            console.log('查找家庭 - 查询结果:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('查找家庭错误:', error);
            throw error;
        }
    }

    // 更新家庭
    static async update(id, updateData) {
        try {
            console.log('更新家庭 - 开始:', { id, updateData });
            const { resource } = await familiesContainer.item(id).replace(updateData);
            console.log('更新家庭 - 完成:', resource);
            return resource;
        } catch (error) {
            console.error('更新家庭错误:', error);
            throw error;
        }
    }

    // 删除家庭
    static async delete(id) {
        try {
            console.log('删除家庭 - 开始:', id);
            await familiesContainer.item(id).delete();
            console.log('删除家庭 - 完成');
            return true;
        } catch (error) {
            console.error('删除家庭错误:', error);
            throw error;
        }
    }

    // 添加成员
    static async addMember(familyId, userId) {
        try {
            console.log('添加成员 - 开始:', { familyId, userId });
            const family = await Family.findById(familyId);
            
            if (!family) {
                throw new Error('家庭不存在');
            }

            // 检查用户是否已经是成员
            const isMember = family.members.some(member => member.userId === userId);
            if (isMember) {
                throw new Error('用户已经是家庭成员');
            }

            // 添加新成员
            family.members.push({
                userId,
                role: 'member',
                status: 'active',
                joinedAt: new Date()
            });

            // 更新家庭信息
            const updatedFamily = await Family.update(familyId, family);
            console.log('添加成员 - 完成:', updatedFamily);
            return updatedFamily;
        } catch (error) {
            console.error('添加成员错误:', error);
            throw error;
        }
    }
}

module.exports = Family; 