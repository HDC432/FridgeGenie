import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

/**
 * UserProfileScreen component displays the user's profile information and provides navigation
 * to various user-related features like family management, health profile, and favorite recipes.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @returns {React.ReactElement} Rendered component
 */
const UserProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  /**
   * Handles the logout confirmation process
   * Shows different confirmation dialogs based on platform (web/mobile)
   */
  const handleLogout = () => {
    console.log('Logout button pressed');
    
    if (Platform.OS === 'web') {
      // Use window.confirm for web platform
      if (window.confirm('Are you sure you want to logout?')) {
        console.log('Logout confirmed');
        handleLogoutAction();
      }
    } else {
      // Use Alert.alert for mobile platforms
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: handleLogoutAction,
          },
        ]
      );
    }
  };

  /**
   * Executes the logout action and handles navigation
   * @async
   */
  const handleLogoutAction = async () => {
    console.log('Logout confirmed');
    try {
      await logout();
      console.log('Logout successful');
      // Navigate to login screen after logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
      if (Platform.OS === 'web') {
        window.alert('Logout failed, please try again');
      } else {
        Alert.alert('Error', 'Logout failed, please try again');
      }
    }
  };

  /**
   * Menu items configuration for the profile screen
   * @type {Array<{title: string, icon: string, onPress: Function}>}
   */
  const menuItems = [
    {
      title: 'My Family',
      icon: 'people-outline',
      onPress: () => navigation.navigate('Family'),
    },
    {
      title: 'Health Profile',
      icon: 'medkit-outline',
      onPress: () => navigation.navigate('HealthProfile'),
    },
    {
      title: 'Favorite Recipes',
      icon: 'heart-outline',
      onPress: () => navigation.navigate('FavoriteRecipes'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={24} color={COLORS.TEXT_PRIMARY} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={COLORS.DANGER} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.XLARGE,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  avatarContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  username: {
    fontSize: FONT_SIZE.XLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.TINY,
  },
  email: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  menuContainer: {
    backgroundColor: COLORS.BACKGROUND,
    marginTop: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    overflow: 'hidden',
    ...SHADOW_STYLE.SMALL,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.MEDIUM,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.XLARGE,
    padding: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOW_STYLE.SMALL,
  },
  logoutText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.DANGER,
    marginLeft: SPACING.SMALL,
  },
});

export default UserProfileScreen; 