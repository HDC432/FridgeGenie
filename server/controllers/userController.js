const userService = require('../services/userService');

class UserController {
  // 用户注册
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // 验证请求数据
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: '请提供所有必需的字段'
        });
      }

      const result = await userService.register({ username, email, password });
      
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
      
      res.status(200).json({
        success: true,
        data: {
          id: decoded.id,
          email: decoded.email
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