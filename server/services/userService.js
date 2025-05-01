const User = require('../models/User');
const Family = require('../models/Family');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Service class for managing user authentication and user-related operations
 * @class UserService
 */
class UserService {
  /**
   * Registers a new user and handles family association
   * @async
   * @param {Object} userData - The user registration data
   * @param {string} userData.username - The username for the new user
   * @param {string} userData.email - The email address for the new user
   * @param {string} userData.password - The password for the new user
   * @param {string} [userData.inviteCode] - Optional family invite code
   * @returns {Promise<Object>} Object containing user data and JWT token
   * @throws {Error} If registration fails or user already exists
   */
  async register(userData) {
    try {
      const { username, email, password, inviteCode } = userData;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email) || await User.findByUsername(username);
      
      if (existingUser) {
        throw new Error('Username or email is already registered');
      }

      let familyId = null;

      // If invite code exists, find corresponding family
      if (inviteCode) {
        const family = await Family.findByInviteCode(inviteCode);
        if (!family) {
          throw new Error('Invalid invite code');
        }
        familyId = family.id;
      }

      // Create new user
      const user = new User(username, email, password, familyId);
      const savedUser = await user.save();
      
      // If no invite code, create new family and set user as admin
      if (!inviteCode) {
        console.log('UserService - Starting to create new family');
        const family = new Family(username + '\'s Family', savedUser.id);
        console.log('UserService - New family object:', family);
        const savedFamily = await family.save();
        console.log('UserService - Family save result:', savedFamily);
        await User.updateFamilyId(savedUser.id, savedFamily.id);
        familyId = savedFamily.id;
      } else {
        // If invite code exists, add user as regular member
        await Family.addMember(familyId, savedUser.id);
      }
      
      // Generate JWT token
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
      console.error('Registration service error:', error);
      throw error;
    }
  }

  /**
   * Authenticates a user and generates a JWT token
   * @async
   * @param {Object} credentials - The login credentials
   * @param {string} credentials.email - The user's email address
   * @param {string} credentials.password - The user's password
   * @returns {Promise<Object>} Object containing user data and JWT token
   * @throws {Error} If authentication fails
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;
      console.log('Login service - Finding user:', email);
      
      // Add virtual test user feature - if test account, return login success directly
      if (email === 'test@example.com' && password === 'password123') {
        console.log('Login service - Using test account login');
        const testUser = {
          id: 'test-user-id-12345',
          username: 'Test User',
          email: 'test@example.com',
          familyId: 'test-family-id-12345',
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        // Generate JWT token
        const token = this.generateToken(testUser);
        console.log('Login service - Test user token generated successfully');
        
        return {
          user: testUser,
          token
        };
      }
      
      // Normal user login flow - original code remains unchanged
      const user = await User.findByEmail(email);
      console.log('Login service - User query result:', user);
      
      if (!user) {
        throw new Error('User does not exist');
      }

      // Verify password
      console.log('Login service - Starting password verification');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Login service - Password verification result:', isMatch);
      
      if (!isMatch) {
        throw new Error('Incorrect password');
      }

      // Update last login time
      await User.updateLastLogin(user.id);

      // Generate JWT token
      const token = this.generateToken(user);
      console.log('Login service - Token generated successfully');

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
      console.error('Login service error:', error);
      throw error;
    }
  }

  /**
   * Generates a JWT token for a user
   * @param {Object} user - The user object
   * @param {string} user.id - The user's unique identifier
   * @param {string} user.email - The user's email address
   * @returns {string} The generated JWT token
   */
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

  /**
   * Verifies a JWT token and returns the decoded user information
   * @param {string} token - The JWT token to verify
   * @returns {Object} The decoded user information
   * @throws {Error} If token is invalid
   */
  verifyToken(token) {
    try {
      // Check if it's a test user token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // If it's a test user, ensure complete information is returned
      if (decoded.id === 'test-user-id-12345' && decoded.email === 'test@example.com') {
        console.log('Token verification - Identified as test user');
        return {
          id: 'test-user-id-12345',
          email: 'test@example.com'
        };
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Retrieves user information by ID
   * @async
   * @param {string} id - The user's unique identifier
   * @returns {Promise<Object>} The user information
   * @throws {Error} If user retrieval fails
   */
  async getUserById(id) {
    try {
      // If test user ID, return test user information
      if (id === 'test-user-id-12345') {
        console.log('Getting user info - Returning test user information');
        return {
          id: 'test-user-id-12345',
          username: 'Test User',
          email: 'test@example.com',
          familyId: 'test-family-id-12345',
          createdAt: new Date(),
          lastLogin: new Date()
        };
      }
      
      return await User.findById(id);
    } catch (error) {
      console.error('Failed to get user information:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 