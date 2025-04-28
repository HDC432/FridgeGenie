import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const FamilyScreen = () => {
  const { user } = useAuth();
  const [familyCode, setFamilyCode] = useState('');
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: '1',
      username: user?.username,
      role: '管理员',
      isCurrentUser: true,
    },
  ]);

  const handleJoinFamily = () => {
    if (!familyCode) {
      Alert.alert('错误', '请输入家庭码');
      return;
    }
    // TODO: 实现加入家庭的逻辑
    Alert.alert('提示', '加入家庭功能开发中');
  };

  const handleCreateFamily = () => {
    // TODO: 实现创建家庭的逻辑
    Alert.alert('提示', '创建家庭功能开发中');
  };

  const handleRemoveMember = (memberId) => {
    Alert.alert(
      '确认移除',
      '确定要移除该家庭成员吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: () => {
            // TODO: 实现移除家庭成员的逻辑
            Alert.alert('提示', '移除成员功能开发中');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我的家庭</Text>
        {familyMembers.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <View style={styles.memberInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.username}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
            {!member.isCurrentUser && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveMember(member.id)}
              >
                <MaterialIcons name="remove-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>加入家庭</Text>
        <View style={styles.joinFamily}>
          <TextInput
            style={styles.input}
            placeholder="输入家庭码"
            value={familyCode}
            onChangeText={setFamilyCode}
          />
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinFamily}
          >
            <Text style={styles.buttonText}>加入</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>创建家庭</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateFamily}
        >
          <Text style={styles.buttonText}>创建新家庭</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 5,
  },
  joinFamily: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FamilyScreen; 