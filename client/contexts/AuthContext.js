/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Manages authentication state and provides authentication methods to children
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Authentication provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Checks if the user is authenticated and loads user data if authenticated
   * @returns {Promise<void>}
   */
  const checkAuth = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          // Save user data to AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Clear potentially invalid data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticates a user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data and authentication token
   * @throws {Error} If login fails or server response is invalid
   */
  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    if (!userData || !userData.user) {
      throw new Error('Login failed: Invalid server response');
    }
    setUser(userData.user);
    // Save user data to AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData.user));
    return userData;
  };

  /**
   * Registers a new user
   * @param {string} username - User's username
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data and authentication token
   */
  const register = async (username, email, password) => {
    const userData = await authService.register(username, email, password);
    setUser(userData.user);
    // Save user data to AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData.user));
    return userData;
  };

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    // Clear user data
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

/**
 * Custom hook to use the authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 