import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { generateAvatarText, generateAvatarColor } from '../utils/avatarUtils';
import { API_URL } from '../config/constants';
import authService from '../services/authService';
import theme from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

// 统一的提示方法
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
};

// 统一的确认方法
const showConfirm = (title, message, onConfirm) => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(message);
    if (confirmed) {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  }
};

const FamilyScreen = () => {
  const { user, setUser } = useAuth();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    console.log('FamilyScreen - 组件挂载');
    if (user) {
      fetchFamilyInfo();
    }
  }, [user]);

  const fetchFamilyInfo = async () => {
    try {
      console.log('FamilyScreen - 开始获取家庭信息');
      const token = await authService.getToken();
      console.log('FamilyScreen - 获取到的token:', token);

      const response = await fetch(`${API_URL}/families`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('FamilyScreen - 家庭信息响应状态:', response.status);
      const data = await response.json();
      console.log('FamilyScreen - 家庭信息响应数据:', data);

      if (response.ok && data.data) {
        console.log('FamilyScreen - 设置家庭信息:', data.data);
        setFamily(data.data);
      } else {
        console.log('FamilyScreen - 获取家庭信息失败:', data.message);
        setFamily(null);
      }
    } catch (error) {
      console.error('FamilyScreen - 获取家庭信息失败:', error);
      setFamily(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      showAlert('错误', '请输入家庭名称');
      return;
    }

    try {
      console.log('FamilyScreen - 开始创建家庭');
      setLoading(true);
      const token = await authService.getToken();
      console.log('FamilyScreen - 创建家庭使用的token:', token);

      const requestBody = { name: familyName };
      console.log('FamilyScreen - 创建家庭请求体:', requestBody);

      const response = await fetch(`${API_URL}/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('FamilyScreen - 创建家庭响应状态:', response.status);
      const data = await response.json();
      console.log('FamilyScreen - 创建家庭响应数据:', data);

      if (response.ok) {
        setFamily(data.data);
        showAlert('成功', '家庭创建成功！');
      } else {
        if (data.message === '用户已经加入其他家庭') {
          showAlert('错误', '您已经加入了一个家庭，请先退出当前家庭再创建新家庭');
        } else {
          showAlert('错误', data.message || '创建家庭失败');
        }
      }
    } catch (error) {
      console.error('FamilyScreen - 创建家庭失败:', error);
      showAlert('错误', '创建家庭失败');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      showAlert('错误', '请输入邀请码');
      return;
    }

    try {
      console.log('FamilyScreen - 开始加入家庭');
      setLoading(true);
      const token = await authService.getToken();
      console.log('FamilyScreen - 加入家庭使用的token:', token);

      const requestBody = { inviteCode };
      console.log('FamilyScreen - 加入家庭请求体:', requestBody);

      const response = await fetch(`${API_URL}/families/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('FamilyScreen - 加入家庭响应状态:', response.status);
      const data = await response.json();
      console.log('FamilyScreen - 加入家庭响应数据:', data);

      if (response.ok) {
        setFamily(data.data);
        const updatedUser = { ...user, familyId: data.data.id };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        showAlert('成功', '成功加入家庭！');
      } else {
        showAlert('错误', data.message || '加入家庭失败');
      }
    } catch (error) {
      console.error('FamilyScreen - 加入家庭失败:', error);
      showAlert('错误', '加入家庭失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!family) return;

    // 找到要移除的成员
    const memberToRemove = family.members.find(m => m.userId === memberId);
    if (!memberToRemove) return;

    showConfirm('确认移除', `确定要移除成员 ${memberToRemove.username} 吗？`, async () => {
      try {
        console.log('FamilyScreen - 开始移除成员:', memberId);
        setLoading(true);
        const token = await authService.getToken();
        console.log('FamilyScreen - 移除成员使用的token:', token);

        const response = await fetch(`${API_URL}/families/${family.id}/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('FamilyScreen - 移除成员响应状态:', response.status);
        const data = await response.json();
        console.log('FamilyScreen - 移除成员响应数据:', data);

        if (response.ok) {
          // 重新获取家庭信息
          const familyResponse = await fetch(`${API_URL}/families`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const familyData = await familyResponse.json();
          console.log('FamilyScreen - 重新获取家庭信息:', familyData);

          if (familyResponse.ok && familyData.data) {
            setFamily(familyData.data);
            showAlert('成功', '成员已移除');
          } else {
            // 如果没有获取到家庭信息，说明家庭已被删除
            setFamily(null);
            const updatedUser = { ...user, familyId: null };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showAlert('成功', '家庭已删除');
          }
        } else {
          showAlert('错误', data.message || '移除成员失败');
        }
      } catch (error) {
        console.error('FamilyScreen - 移除成员失败:', error);
        showAlert('错误', '移除成员失败');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleLeaveFamily = async () => {
    try {
      const token = await authService.getToken();
      const response = await axios.post(
        `${API_URL}/families/${user.familyId}/leave`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // 更新用户状态
        await authService.updateUser({ familyId: null });
        // 显示成功消息
        if (Platform.OS === 'web') {
          window.alert('已成功退出家庭');
        } else {
          Alert.alert('成功', '已成功退出家庭');
        }
        // 刷新页面
        loadFamilyInfo();
      }
    } catch (error) {
      console.error('退出家庭失败:', error);
      if (Platform.OS === 'web') {
        window.alert('退出家庭失败，请重试');
      } else {
        Alert.alert('错误', '退出家庭失败，请重试');
      }
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.username}</Text>
        <Text style={styles.memberRole}>
          {item.role === 'admin' ? '管理员' : '成员'}
        </Text>
      </View>
      {user.id === item.id ? (
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm('确定要退出家庭吗？')) {
                handleLeaveFamily();
              }
            } else {
              Alert.alert(
                '确认退出',
                '确定要退出家庭吗？',
                [
                  { text: '取消', style: 'cancel' },
                  { text: '退出', style: 'destructive', onPress: handleLeaveFamily }
                ]
              );
            }
          }}
        >
          <Text style={styles.leaveButtonText}>退出家庭</Text>
        </TouchableOpacity>
      ) : user.role === 'admin' && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm(`确定要移除成员 ${item.username} 吗？`)) {
                handleRemoveMember(item.id);
              }
            } else {
              Alert.alert(
                '确认移除',
                `确定要移除成员 ${item.username} 吗？`,
                [
                  { text: '取消', style: 'cancel' },
                  { text: '移除', style: 'destructive', onPress: () => handleRemoveMember(item.id) }
                ]
              );
            }
          }}
        >
          <Text style={styles.removeButtonText}>移除</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {family ? (
        // 已加入家庭
        <View style={styles.section}>
          <View style={styles.familyHeader}>
            <Text style={styles.familyName}>{family.name}</Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCodeLabel}>邀请码:</Text>
              <Text style={styles.inviteCode}>{family.inviteCode}</Text>
            </View>
          </View>

          <View style={styles.membersSection}>
            <Text style={styles.membersTitle}>家庭成员</Text>
            {family?.members?.map((member) => (
              <View key={member.userId} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <View style={[styles.avatar, { backgroundColor: generateAvatarColor(member.username) }]}>
                    <Text style={styles.avatarText}>
                      {generateAvatarText(member.username)}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.username}</Text>
                    <Text style={styles.memberRole}>
                      {member.role === 'admin' ? '管理员' : '成员'}
                      {member.userId === user.id && ' (我)'}
                    </Text>
                  </View>
                </View>
                {member.userId !== user.id && family.members.some(m => m.userId === user.id && m.role === 'admin') && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMember(member.userId)}
                  >
                    <Ionicons name="remove-circle" size={24} color={COLORS.DANGER} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveFamily}
          >
            <Text style={styles.leaveButtonText}>退出家庭</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 未加入家庭
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>创建家庭</Text>
            <TextInput
              style={styles.input}
              placeholder="输入家庭名称"
              value={familyName}
              onChangeText={setFamilyName}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateFamily}
            >
              <Text style={styles.buttonText}>创建新家庭</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>加入家庭</Text>
            <TextInput
              style={styles.input}
              placeholder="输入邀请码"
              value={inviteCode}
              onChangeText={setInviteCode}
            />
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinFamily}
            >
              <Text style={styles.buttonText}>加入家庭</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.CONTAINER,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: SPACING.LARGE,
    flexGrow: 1,
  },
  familyHeader: {
    marginBottom: SPACING.LARGE,
    paddingBottom: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  familyName: {
    fontSize: FONT_SIZE.XXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  inviteCodeLabel: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginRight: SPACING.SMALL,
  },
  inviteCode: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.PRIMARY,
  },
  membersSection: {
    marginBottom: SPACING.LARGE,
  },
  membersTitle: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  avatarText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  memberRole: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  removeButton: {
    padding: SPACING.SMALL,
  },
  input: {
    ...COMMON_STYLES.INPUT,
    marginBottom: SPACING.LARGE,
  },
  createButton: {
    ...COMMON_STYLES.BUTTON,
    backgroundColor: COLORS.PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  joinButton: {
    ...COMMON_STYLES.BUTTON,
    backgroundColor: COLORS.PRIMARY,
  },
  buttonText: {
    ...COMMON_STYLES.BUTTON_TEXT,
  },
  leaveButton: {
    ...COMMON_STYLES.BUTTON,
    backgroundColor: COLORS.PRIMARY,
    marginTop: SPACING.LARGE,
  },
  leaveButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
  removeButtonText: {
    color: COLORS.DANGER,
    fontSize: FONT_SIZE.SMALL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
});

export default FamilyScreen; 