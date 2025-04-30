import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

class AuthService {
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

    
      await this.setToken(data.data.token);
      return data.data;
    } catch (error) {
      throw error;
    }
  }

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

      if (!data.success || !data.data || !data.data.user || !data.data.token) {
        throw new Error('Invalid server response format');
      }
  
      await this.setToken(data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      return { user: data.data.user, token: data.data.token };
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

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

      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async setToken(token) {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

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