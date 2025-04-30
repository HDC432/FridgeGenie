import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import BottomNav from '../components/BottomNav';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

const UserProfileScreen = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      icon: 'person',
      label: 'Personal Info',
      value: user?.username,
    },
    {
      icon: 'mail',
      label: 'Email',
      value: user?.email,
    },
    {
      icon: 'calendar',
      label: 'Registration Date',
      value: new Date(user?.createdAt).toLocaleDateString(),
    },
    {
      icon: 'time',
      label: 'Last Login',
      value: new Date(user?.lastLogin).toLocaleDateString(),
    },
  ];

  return (
    <View style={{flex: 1, justifyContent: 'space-between'}}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
        </View>

        <View style={styles.content}>
          {menuItems.map((item, index) => (
            <View key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color={COLORS.PRIMARY} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuItemValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.CONTAINER,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.XXLARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.CIRCLE,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    ...SHADOW_STYLE.MEDIUM,
  },
  avatarText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.XXXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  username: {
    fontSize: FONT_SIZE.XXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  content: {
    padding: SPACING.LARGE,
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: FONT_SIZE.MEDIUM,
    marginLeft: SPACING.LARGE,
    color: COLORS.TEXT_PRIMARY,
  },
  menuItemValue: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default UserProfileScreen; 