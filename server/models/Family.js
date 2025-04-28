const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Cosmos DB 配置
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database('fridgegenie-db');
const container = database.container('families');

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
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        console.log('生成邀请码:', code);
        return code;
    }

    // 保存家庭
    async save() {
        try {
            console.log('保存家庭 - 开始保存到数据库');
            const { resource } = await container.items.create(this);
            console.log('保存家庭 - 保存成功:', resource);
            return resource;
        } catch (error) {
            console.error('保存家庭 - 错误:', error);
            throw error;
        }
    }

    // 查找家庭（通过邀请码）
    static async findByInviteCode(inviteCode) {
        try {
            console.log('查找家庭 - 通过邀请码:', inviteCode);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.inviteCode = @inviteCode",
                parameters: [{ name: "@inviteCode", value: inviteCode }]
            }).fetchAll();
            console.log('查找家庭 - 查询结果:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('查找家庭 - 错误:', error);
            throw error;
        }
    }

    // 查找用户所在的家庭
    static async findByUserId(userId) {
        try {
            console.log('查找家庭 - 通过用户ID:', userId);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, {userId: @userId}, true)",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('查找家庭 - 查询结果:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('查找家庭 - 错误:', error);
            throw error;
        }
    }

    // 添加家庭成员
    static async addMember(familyId, userId, role = 'member') {
        try {
            console.log('添加成员 - 参数:', { familyId, userId, role });
            const family = await container.item(familyId).read();
            console.log('添加成员 - 读取家庭:', family);
            
            if (!family.resource) {
                throw new Error('家庭不存在');
            }

            // 检查用户是否已经是家庭成员
            const isMember = family.resource.members.some(m => m.userId === userId);
            if (isMember) {
                throw new Error('用户已经是家庭成员');
            }

            // 添加新成员
            family.resource.members.push({
                userId,
                role,
                status: 'active',
                joinedAt: new Date()
            });

            console.log('添加成员 - 更新后的家庭:', family.resource);
            await container.item(familyId).replace(family.resource);
            return family.resource;
        } catch (error) {
            console.error('添加成员 - 错误:', error);
            throw error;
        }
    }

    // 移除家庭成员
    static async removeMember(familyId, userId) {
        try {
            console.log('移除成员 - 参数:', { familyId, userId });
            const family = await container.item(familyId).read();
            console.log('移除成员 - 读取家庭:', family);
            
            if (!family.resource) {
                throw new Error('家庭不存在');
            }

            // 检查是否是管理员
            const member = family.resource.members.find(m => m.userId === userId);
            if (member && member.role === 'admin') {
                throw new Error('不能移除管理员');
            }

            // 移除成员
            family.resource.members = family.resource.members.filter(m => m.userId !== userId);
            console.log('移除成员 - 更新后的家庭:', family.resource);
            await container.item(familyId).replace(family.resource);
            return family.resource;
        } catch (error) {
            console.error('移除成员 - 错误:', error);
            throw error;
        }
    }

    // 更新成员角色
    static async updateMemberRole(familyId, userId, newRole) {
        try {
            console.log('更新角色 - 参数:', { familyId, userId, newRole });
            const family = await container.item(familyId).read();
            console.log('更新角色 - 读取家庭:', family);
            
            if (!family.resource) {
                throw new Error('家庭不存在');
            }

            const member = family.resource.members.find(m => m.userId === userId);
            if (!member) {
                throw new Error('成员不存在');
            }

            member.role = newRole;
            console.log('更新角色 - 更新后的家庭:', family.resource);
            await container.item(familyId).replace(family.resource);
            return family.resource;
        } catch (error) {
            console.error('更新角色 - 错误:', error);
            throw error;
        }
    }
}

module.exports = Family; 