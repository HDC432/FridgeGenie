import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

class AuthService {
  // User registration
  async register(username, email, password) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token
      await this.setToken(data.data.token);
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // User login
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user info
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  // Get current user info
  async getCurrentUser() {
    try {
      // First try to get user info from local storage
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // If not in local storage, get from server
      const token = await this.getToken();
      if (!token) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user info');
      }

      // Save to local storage
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      // If failed to get, clear local storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Save token
  async setToken(token) {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  // Get token
  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  // Check if logged in
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService(); 