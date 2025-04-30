import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please read and agree to the terms of service');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const userData = await register(name, email, password, inviteCode);
      
      if (userData) {
        Alert.alert(
          'Registration Successful',
          'You have successfully registered, you can now log in',
          [
            {
              text: 'OK',
              onPress: () => {
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setInviteCode('');
                setAgreeTerms(false);
              },
            },
          ]
        );
      } else {
        setError('Registration failed, please try again later');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register a new account to use FridgeGenie</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoComplete="off"
          textContentType="none"
          spellCheck={false}
          autoCorrect={false}
        />
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
          autoComplete="off"
          textContentType="none"
          spellCheck={false}
          autoCorrect={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Set your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="off"
            textContentType="none"
            passwordRules="none"
            spellCheck={false}
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.passwordVisibilityBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password again"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoComplete="off"
          textContentType="none"
          passwordRules="none"
          spellCheck={false}
          autoCorrect={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Invite Code (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter invite code if you have one"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="none"
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setAgreeTerms(!agreeTerms)}
      >
        <View style={[styles.checkbox, agreeTerms && styles.checkedBox]}>
          {agreeTerms && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.termsText}>
          I have read and agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1F2B40" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2B40',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2B40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2B40',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordVisibilityBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  termsLink: {
    color: '#1F2B40',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#FFC107',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2B40',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2B40',
    marginLeft: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
});

export default RegisterScreen; 