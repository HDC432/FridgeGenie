const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Cosmos DB 配置
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database('fridgegenie-db');
const container = database.container('users');

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
        this.lastLogin = null;
    }

    // 保存用户
    async save() {
        try {
            console.log('保存用户 - 开始加密密码');
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            console.log('保存用户 - 密码加密完成');
            
            console.log('保存用户 - 开始创建用户记录');
            const { resource } = await container.items.create(this);
            console.log('保存用户 - 用户记录创建成功');
            return resource;
        } catch (error) {
            console.error('保存用户错误:', error);
            throw error;
        }
    }

    // 验证密码
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    // 查找用户
    static async findByUsername(username) {
        try {
            console.log('查找用户 - 通过用户名:', username);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.username = @username",
                parameters: [{ name: "@username", value: username }]
            }).fetchAll();
            console.log('查找用户 - 查询结果:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('查找用户错误:', error);
            throw error;
        }
    }

    // 查找用户（通过邮箱）
    static async findByEmail(email) {
        try {
            console.log('查找用户 - 通过邮箱:', email);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: email }]
            }).fetchAll();
            console.log('查找用户 - 查询结果:', resources[0]);
            return resources[0];
        } catch (error) {
            console.error('查找用户错误:', error);
            throw error;
        }
    }

    // 更新最后登录时间
    static async updateLastLogin(userId) {
        try {
            console.log('更新登录时间 - 用户ID:', userId);
            const { resources } = await container.items.query({
                query: "SELECT * FROM c WHERE c.id = @id",
                parameters: [{ name: "@id", value: userId }]
            }).fetchAll();

            if (!resources || resources.length === 0) {
                throw new Error('用户不存在');
            }

            const user = resources[0];
            const updatedUser = {
                ...user,
                lastLogin: new Date()
            };
            
            await container.item(userId).replace(updatedUser);
            console.log('更新登录时间 - 成功');
        } catch (error) {
            console.error('更新登录时间错误:', error);
            throw error;
        }
    }
}

module.exports = User; 