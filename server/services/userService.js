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
      
      // 查找用户
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

      // 生成 JWT token
      const token = this.generateToken(user);
      console.log('登录服务 - 生成 token 成功');

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          familyId: user.familyId,
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
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('无效的 token');
    }
  }

  async getUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 