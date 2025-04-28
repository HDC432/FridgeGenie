const userService = require('../services/userService');

class UserController {
  // 用户注册
  async register(req, res) {
    try {
      const { username, email, password, inviteCode } = req.body;
      
      // 验证请求数据
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: '请提供所有必需的字段'
        });
      }

      // 验证邀请码格式（如果提供）
      if (inviteCode && !/^[A-Z0-9]{6}$/.test(inviteCode)) {
        return res.status(400).json({
          success: false,
          message: '邀请码格式不正确'
        });
      }

      const result = await userService.register({ username, email, password, inviteCode });
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      console.log('登录请求体:', req.body);
      const { email, password } = req.body;
      
      // 验证请求数据
      if (!email || !password) {
        console.log('缺少邮箱或密码');
        return res.status(400).json({
          success: false,
          message: '请提供邮箱和密码'
        });
      }

      console.log('开始验证用户:', email);
      const result = await userService.login({ email, password });
      console.log('登录成功:', result);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: '未提供认证令牌'
        });
      }

      const decoded = userService.verifyToken(token);
      
      // 从数据库获取完整的用户信息
      const user = await userService.getUserById(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          familyId: user.familyId,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController(); 