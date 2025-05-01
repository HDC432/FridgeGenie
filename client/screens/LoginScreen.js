/**
 * @fileoverview LoginScreen component for user authentication
 * @module LoginScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, COMMON_STYLES } = theme;

/**
 * LoginScreen component for user authentication
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen navigation
 * @returns {JSX.Element} Rendered component
 */
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  /**
   * Handles the login process
   * @async
   */
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const userData = await login(email, password);
      
      if (userData) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setError('Login failed. Please check your email and password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image 
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>FridgeGenie</Text>
        <Text style={styles.tagline}>Smart fridge management to reduce food waste</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.SECONDARY} />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.orLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-facebook" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Sign Up Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.CONTAINER,
    padding: SPACING.XXLARGE,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XXXLARGE,
  },
  logoCircle: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: FONT_SIZE.XXXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  tagline: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: SPACING.XLARGE,
  },
  label: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  input: {
    ...COMMON_STYLES.INPUT,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.XXLARGE,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  loginButton: {
    ...COMMON_STYLES.BUTTON,
    marginBottom: SPACING.LARGE,
  },
  loginButtonText: {
    ...COMMON_STYLES.BUTTON_TEXT,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.XLARGE,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.DIVIDER,
  },
  orText: {
    marginHorizontal: SPACING.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.SMALL,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.XXXLARGE,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.SMALL,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  registerLink: {
    fontSize: FONT_SIZE.SMALL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.TINY,
  },
  errorText: {
    color: COLORS.DANGER,
    fontSize: FONT_SIZE.SMALL,
    marginTop: SPACING.TINY,
    marginBottom: SPACING.LARGE,
  },
});

export default LoginScreen; 