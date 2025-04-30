import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

const UserProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '退出',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person',
      label: '个人信息',
      value: user?.username,
    },
    {
      icon: 'mail',
      label: '邮箱',
      value: user?.email,
    },
    {
      icon: 'calendar',
      label: '注册时间',
      value: new Date(user?.createdAt).toLocaleDateString(),
    },
    {
      icon: 'time',
      label: '最后登录',
      value: new Date(user?.lastLogin).toLocaleDateString(),
    },
  ];

  const actionItems = [
    {
      icon: 'heart',
      label: '健康信息',
      screen: 'HealthProfile',
      color: COLORS.PRIMARY,
    },
    {
      icon: 'bookmark',
      label: '收藏的菜谱',
      screen: 'FavoriteRecipes',
      color: COLORS.SUCCESS,
    },
    {
      icon: 'people',
      label: '我的家庭',
      screen: 'Family',
      color: COLORS.WARNING,
    },
  ];

  return (
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能</Text>
          {actionItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.actionItemLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.actionItemLabel}>{item.label}</Text>
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
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: SPACING.XLARGE,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
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
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItemLabel: {
    fontSize: FONT_SIZE.MEDIUM,
    marginLeft: SPACING.LARGE,
    color: COLORS.TEXT_PRIMARY,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.DANGER + '10',
    padding: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginTop: SPACING.XLARGE,
    marginBottom: SPACING.XXLARGE,
  },
  logoutText: {
    color: COLORS.DANGER,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    marginLeft: SPACING.MEDIUM,
  },
});

export default UserProfileScreen; 