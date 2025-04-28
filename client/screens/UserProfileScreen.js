import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const UserProfileScreen = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      icon: 'person',
      label: '个人信息',
      value: user?.username,
    },
    {
      icon: 'email',
      label: '邮箱',
      value: user?.email,
    },
    {
      icon: 'calendar-today',
      label: '注册时间',
      value: new Date(user?.createdAt).toLocaleDateString(),
    },
    {
      icon: 'access-time',
      label: '最后登录',
      value: new Date(user?.lastLogin).toLocaleDateString(),
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
        {menuItems.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name={item.icon} size={24} color="#666" />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Text style={styles.menuItemValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  menuItemValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default UserProfileScreen; 