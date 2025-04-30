import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

const UserMenu = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  if (!visible || !user) {
    return null;
  }

  const handleNavigation = (screen) => {
    console.log(`Navigating to ${screen}`);
    onClose();
    if (screen === 'HealthProfile') {
      navigation.navigate('HealthProfile');
    } else {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out');
    onClose();
    await logout();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <View style={styles.header}>
                <View style={styles.avatarContainer}>
                  <UserAvatar user={user} size={40} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.menuItems}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('UserProfile')}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="person-outline" size={20} color="#1F2B40" />
                  </View>
                  <Text style={styles.menuItemText}>个人信息</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('Family')}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="people-outline" size={20} color="#1F2B40" />
                  </View>
                  <Text style={styles.menuItemText}>我的家庭</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('FavoriteRecipes')}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="heart-outline" size={20} color="#1F2B40" />
                  </View>
                  <Text style={styles.menuItemText}>菜谱收藏</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('RecommendedItems')}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="cart-outline" size={20} color="#1F2B40" />
                  </View>
                  <Text style={styles.menuItemText}>推荐购买</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleNavigation('HealthProfile')}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="medkit-outline" size={20} color="#1F2B40" />
                  </View>
                  <Text style={styles.menuItemText}>健康信息</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name="log-out-outline" size={20} color="#F44336" />
                  </View>
                  <Text style={[styles.menuItemText, styles.logoutText]}>退出登录</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  menuContainer: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    top: 60,
    right: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2B40',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  menuItemActive: {
    backgroundColor: '#F5F7FA',
  },
  menuItemIcon: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    color: '#1F2B40',
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#F5F7FA',
    marginTop: 8,
  },
  logoutText: {
    color: '#F44336',
  },
});

export default UserMenu; 