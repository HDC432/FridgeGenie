const User = require('../models/User');
const Family = require('../models/Family');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { usersContainer } = require('../config/database');

class UserService {
  // 用户注册
  async register(userData) {
    try {
      const { username, email, password, inviteCode } = userData;
      
      // 检查用户是否已存在
      const existingUser = await User.findByEmail(email) || await User.findByUsername(username);
      
      if (existingUser) {
        throw new Error('用户名或邮箱已被注册');
      }

      let familyId = null;

      // 如果有邀请码，查找对应的家庭
      if (inviteCode) {
        const family = await Family.findByInviteCode(inviteCode);
        if (!family) {
          throw new Error('邀请码无效');
        }
        familyId = family.id;
      }

      // 创建新用户
      const user = new User(username, email, password, familyId);
      const savedUser = await user.save();
      
      // 如果没有邀请码，创建新家庭并将用户设置为管理员
      if (!inviteCode) {
        console.log('UserService - 开始创建新家庭');
        const family = new Family(username + '的家庭', savedUser.id);
        console.log('UserService - 新家庭对象:', family);
        const savedFamily = await family.save();
        console.log('UserService - 保存家庭结果:', savedFamily);
        await User.updateFamilyId(savedUser.id, savedFamily.id);
        familyId = savedFamily.id;
      } else {
        // 如果有邀请码，将用户添加为普通成员
        await Family.addMember(familyId, savedUser.id);
      }
      
      // 生成 JWT token
      const token = this.generateToken(savedUser);
      
      return {
        user: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          familyId: familyId
        },
        token
      };
    } catch (error) {
      console.error('注册服务错误:', error);
      throw error;
    }
  }

  // 用户登录
  async login(credentials) {
    try {
      const { email, password } = credentials;
      console.log('登录服务 - 查找用户:', email);
      
      // 添加虚拟测试用户功能 - 如果是测试账户，直接返回登录成功
      if (email === 'test@example.com' && password === 'password123') {
        console.log('登录服务 - 使用测试账户登录');
        const testUser = {
          id: 'test-user-id-12345',
          username: '测试用户',
          email: 'test@example.com',
          familyId: 'test-family-id-12345',
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        // 生成 JWT token
        const token = this.generateToken(testUser);
        console.log('登录服务 - 生成测试用户 token 成功');
        
        return {
          user: testUser,
          token
        };
      }
      
      // 正常用户登录流程
      const user = await User.findByEmail(email);
      console.log('登录服务 - 用户查询结果:', user);
      
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证密码
      console.log('登录服务 - 开始验证密码');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('登录服务 - 密码验证结果:', isMatch);
      
      if (!isMatch) {
        throw new Error('密码错误');
      }

      // 更新最后登录时间
      await User.updateLastLogin(user.id);

      // 如果用户没有 familyId，尝试查找用户的家庭
      let familyId = user.familyId;
      if (!familyId) {
        console.log('登录服务 - 用户没有 familyId，尝试查找家庭');
        const family = await Family.findByUserId(user.id);
        if (family) {
          console.log('登录服务 - 找到用户的家庭:', family);
          familyId = family.id;
          // 更新用户的 familyId
          await User.updateFamilyId(user.id, familyId);
        }
      }

      // 生成 JWT token
      const token = this.generateToken(user);
      console.log('登录服务 - 生成 token 成功');

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          familyId: familyId,
          createdAt: user.createdAt,
          lastLogin: new Date()
        },
        token
      };
    } catch (error) {
      console.error('登录服务错误:', error);
      throw error;
    }
  }

  // 生成 JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // 验证 token
  verifyToken(token) {
    try {
      // 检查是否为测试用户的 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 如果是测试用户，确保返回完整信息
      if (decoded.id === 'test-user-id-12345' && decoded.email === 'test@example.com') {
        console.log('验证令牌 - 识别为测试用户');
        return {
          id: 'test-user-id-12345',
          email: 'test@example.com'
        };
      }
      
      return decoded;
    } catch (error) {
      throw new Error('无效的 token');
    }
  }

  async getUserById(id) {
    try {
      // 如果是测试用户ID，返回测试用户信息
      if (id === 'test-user-id-12345') {
        console.log('获取用户信息 - 返回测试用户信息');
        return {
          id: 'test-user-id-12345',
          username: '测试用户',
          email: 'test@example.com',
          familyId: 'test-family-id-12345',
          createdAt: new Date(),
          lastLogin: new Date()
        };
      }
      
      return await User.findById(id);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 