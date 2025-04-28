import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

class AuthService {
  // 用户注册
  async register(username, email, password) {
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      // 保存 token
      await this.setToken(data.data.token);
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // 用户登录
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 保存 token
      await this.setToken(data.data.token);
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      // 首先尝试从本地存储获取用户信息
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // 如果本地没有，则从服务器获取
      const token = await this.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '获取用户信息失败');
      }

      // 保存到本地存储
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      // 如果获取失败，清除本地存储
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      throw error;
    }
  }

  // 登出
  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  // 保存 token
  async setToken(token) {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('保存 token 失败:', error);
    }
  }

  // 获取 token
  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('获取 token 失败:', error);
      return null;
    }
  }

  // 检查是否已登录
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