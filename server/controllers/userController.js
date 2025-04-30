const userService = require('../services/userService');

class UserController {
  // User registration
  async register(req, res) {
    try {
      const { username, email, password, inviteCode } = req.body;
      
      // Validate request data
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Validate invite code format (if provided)
      if (inviteCode && !/^[A-Z0-9]{6}$/.test(inviteCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid invite code format'
        });
      }

      const result = await userService.register({ username, email, password, inviteCode });
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      console.log('Login request body:', req.body);
      const { email, password } = req.body;
      
      // Validate request data
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      console.log('Starting user verification:', email);
      const result = await userService.login({ email, password });
      console.log('Login successful:', result);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user information
  async getCurrentUser(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authentication token provided'
        });
      }

      const decoded = userService.verifyToken(token);
      
      // Get complete user information from database
      const user = await userService.getUserById(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
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
      console.error('Error getting user information:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController(); 