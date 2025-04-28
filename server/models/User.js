const { usersContainer } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(username, email, password, familyId = null) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.familyId = familyId;
        this.createdAt = new Date();
        this.lastLogin = null;
    }

    // 保存用户
    async save() {
        try {
            console.log('保存用户 - 开始:', this);
            // 加密密码
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            
            const { resource } = await usersContainer.items.create(this);
            console.log('保存用户 - 完成:', resource);
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

    // 查找用户（通过ID）
    static async findById(userId) {
        try {
            console.log('查找用户 - 通过用户ID:', userId);
            const { resources } = await usersContainer.items.query({
                query: "SELECT * FROM c WHERE c.id = @userId",
                parameters: [{ name: "@userId", value: userId }]
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
            const { resources } = await usersContainer.items.query({
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

    // 查找用户（通过用户名）
    static async findByUsername(username) {
        try {
            console.log('查找用户 - 通过用户名:', username);
            const { resources } = await usersContainer.items.query({
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

    // 更新最后登录时间
    static async updateLastLogin(userId) {
        try {
            console.log('更新最后登录时间 - 用户ID:', userId);
            
            // 首先检查用户是否存在
            const user = await User.findById(userId);
            if (!user) {
                console.error('更新最后登录时间错误: 用户不存在');
                throw new Error('用户不存在');
            }

            // 使用 replace 操作而不是 patch
            const { resource } = await usersContainer.item(userId, userId).replace({
                ...user,
                lastLogin: new Date()
            });
            
            console.log('更新最后登录时间 - 完成:', resource);
            return resource;
        } catch (error) {
            console.error('更新最后登录时间错误:', error);
            throw error;
        }
    }

    // 更新用户家庭ID
    static async updateFamilyId(userId, familyId) {
        try {
            console.log('更新用户家庭ID - 用户ID:', userId, '家庭ID:', familyId);
            
            // 首先检查用户是否存在
            const user = await User.findById(userId);
            if (!user) {
                console.error('更新用户家庭ID错误: 用户不存在');
                throw new Error('用户不存在');
            }

            // 使用 replace 操作而不是 patch
            const { resource } = await usersContainer.item(userId, userId).replace({
                ...user,
                familyId: familyId
            });
            
            console.log('更新用户家庭ID - 完成:', resource);
            return resource;
        } catch (error) {
            console.error('更新用户家庭ID错误:', error);
            throw error;
        }
    }
}

module.exports = User; 