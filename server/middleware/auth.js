const userService = require('../services/userService');

const auth = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Starting request processing');
    console.log('Auth Middleware - Request headers:', req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth Middleware - Extracted token:', token);
    
    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    console.log('Auth Middleware - Starting token verification');
    const decoded = userService.verifyToken(token);
    console.log('Auth Middleware - Token verification result:', decoded);
    
    req.user = decoded;
    console.log('Auth Middleware - Setting user info:', req.user);
    
    next();
  } catch (error) {
    console.error('Auth Middleware - Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
};

module.exports = auth; 