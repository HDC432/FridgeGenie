const userService = require('../services/userService');

const auth = async (req, res, next) => {
  try {
    console.log('Auth Middleware - 开始处理请求');
    console.log('Auth Middleware - 请求头:', req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth Middleware - 提取的token:', token);
    
    if (!token) {
      console.log('Auth Middleware - 未提供token');
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    console.log('Auth Middleware - 开始验证token');
    const decoded = userService.verifyToken(token);
    console.log('Auth Middleware - token验证结果:', decoded);
    
    req.user = decoded;
    console.log('Auth Middleware - 设置用户信息:', req.user);
    
    next();
  } catch (error) {
    console.error('Auth Middleware - 错误:', error);
    res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

module.exports = auth; 