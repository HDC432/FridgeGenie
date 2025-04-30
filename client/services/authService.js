import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

class AuthService {
  // 用户注册
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
      console.log('开始登录流程...');
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('登录响应数据:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 检查返回的数据结构
      if (!data.data || !data.data.token || !data.data.user) {
        console.error('服务器返回的数据格式不正确:', data);
        throw new Error('服务器返回的数据格式不正确');
      }

      // 检查用户对象中的 familyId
      console.log('用户对象:', data.data.user);
      if (!data.data.user.familyId) {
        console.warn('用户对象中缺少 familyId');
      } else {
        console.log('用户 familyId:', data.data.user.familyId);
      }

      // 保存 token 和用户信息
      await this.setToken(data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      
      // 如果用户有 familyId，也单独保存
      if (data.data.user.familyId) {
        console.log('保存 familyId 到本地存储:', data.data.user.familyId);
        await AsyncStorage.setItem('familyId', data.data.user.familyId);
      }
      
      return data.data;
    } catch (error) {
      console.error('登录错误:', error);
      // 确保清除可能的部分数据
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('familyId');
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

      const response = await fetch(`${API_URL}/users/me`, {
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
      const token = await this.getToken();
      if (token) {
        // 调用后端的登出接口
        await fetch(`${API_URL}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 无论后端请求是否成功，都清除本地数据
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('familyId'),
        AsyncStorage.removeItem('lastLogin'),
      ]);
    }
  }

  // 保存 token
  async setToken(token) {
    if (!token) {
      console.error('尝试保存空的 token');
      return;
    }
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('保存 token 失败:', error);
      throw error;
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