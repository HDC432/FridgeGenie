import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, COMMON_STYLES } = theme;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
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
        setError('Login failed, please check your email and password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="snow-outline" size={64} color={COLORS.SECONDARY} />
        </View>
        <Text style={styles.appName}>FridgeGenie</Text>
        <Text style={styles.tagline}>Smartly manage your fridge, reduce food waste</Text>
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
          <Text style={styles.registerLink}>Register Now</Text>
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
    width: 120,
    height: 120,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
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