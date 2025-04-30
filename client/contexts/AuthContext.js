import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          // 保存用户信息到 AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      // 清除可能无效的数据
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData.user);
    // 保存用户信息到 AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData.user));
    return userData;
  };

  const register = async (username, email, password) => {
    const userData = await authService.register(username, email, password);
    setUser(userData.user);
    // 保存用户信息到 AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData.user));
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    // 清除用户信息
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 