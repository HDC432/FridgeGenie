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
            const { resource } = await familiesContainer.items.item(id).read();
            console.log('查找家庭 - 查询结果:', resource);
            return resource;
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
            const { resource } = await familiesContainer.items.item(id).replace(updateData);
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
            await familiesContainer.items.item(id).delete();
            console.log('删除家庭 - 完成');
            return true;
        } catch (error) {
            console.error('删除家庭错误:', error);
            throw error;
        }
    }
}

module.exports = Family; 