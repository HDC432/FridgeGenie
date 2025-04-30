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

// Unified alert method
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
};

// Unified confirmation method
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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
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
    if (user) {
      fetchFamilyInfo();
    }
  }, [user]);

  const fetchFamilyInfo = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_URL}/families`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setFamily(data.data);
      } else {
        setFamily(null);
      }
    } catch (error) {
      setFamily(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      showAlert('Error', 'Please enter family name');
      return;
    }

    try {
      setLoading(true);
      const token = await authService.getToken();
      const requestBody = { name: familyName };

      const response = await fetch(`${API_URL}/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setFamily(data.data);
        showAlert('Success', 'Family created successfully!');
      } else {
        if (data.message === 'User already joined another family') {
          showAlert('Error', 'You have already joined a family, please exit the current family before creating a new one');
        } else {
          showAlert('Error', data.message || 'Family creation failed');
        }
      }
    } catch (error) {
      showAlert('Error', 'Family creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      showAlert('Error', 'Please enter invite code');
      return;
    }

    try {
      setLoading(true);
      const token = await authService.getToken();
      const requestBody = { inviteCode };

      const response = await fetch(`${API_URL}/families/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setFamily(data.data);
        const updatedUser = { ...user, familyId: data.data.id };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        showAlert('Success', 'Successfully joined family!');
      } else {
        showAlert('Error', data.message || 'Family joining failed');
      }
    } catch (error) {
      showAlert('Error', 'Family joining failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!family) return;

    const memberToRemove = family.members.find(m => m.userId === memberId);
    if (!memberToRemove) return;

    showConfirm('Confirm Remove', `Are you sure you want to remove member ${memberToRemove.username}?`, async () => {
      try {
        setLoading(true);
        const token = await authService.getToken();

        const response = await fetch(`${API_URL}/families/${family.id}/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const familyResponse = await fetch(`${API_URL}/families`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const familyData = await familyResponse.json();

          if (familyResponse.ok && familyData.data) {
            setFamily(familyData.data);
            showAlert('Success', 'Member removed');
          } else {
            setFamily(null);
            const updatedUser = { ...user, familyId: null };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showAlert('Success', 'Family deleted');
          }
        } else {
          showAlert('Error', data.message || 'Member removal failed');
        }
      } catch (error) {
        showAlert('Error', 'Member removal failed');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleLeaveFamily = async () => {
    try {
      const token = await authService.getToken();
      const response = await axios.delete(
        `${API_URL}/families/${user.familyId}/leave`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await authService.updateUser({ familyId: null });
        if (Platform.OS === 'web') {
          window.alert('Successfully left family');
        } else {
          Alert.alert('Success', 'Successfully left family');
        }
        loadFamilyInfo();
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to leave family, please try again');
      } else {
        Alert.alert('Error', 'Family leaving failed, please try again');
      }
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.username}</Text>
        <Text style={styles.memberRole}>
          {item.role === 'admin' ? 'Admin' : 'Member'}
        </Text>
      </View>
      {user.id === item.id ? (
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm('Are you sure you want to leave the family?')) {
                handleLeaveFamily();
              }
            } else {
              Alert.alert(
                'Confirm Leave',
                'Are you sure you want to leave the family?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Leave', style: 'destructive', onPress: handleLeaveFamily }
                ]
              );
            }
          }}
        >
          <Text style={styles.leaveButtonText}>Leave Family</Text>
        </TouchableOpacity>
      ) : user.role === 'admin' && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm(`Are you sure you want to remove member ${item.username}?`)) {
                handleRemoveMember(item.id);
              }
            } else {
              Alert.alert(
                'Confirm Remove',
                `Are you sure you want to remove member ${item.username}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => handleRemoveMember(item.id) }
                ]
              );
            }
          }}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
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
        // Joined family
        <View style={styles.section}>
          <View style={styles.familyHeader}>
            <Text style={styles.familyName}>{family.name}</Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCodeLabel}>Invite Code:</Text>
              <Text style={styles.inviteCode}>{family.inviteCode}</Text>
            </View>
          </View>

          <View style={styles.membersSection}>
            <Text style={styles.membersTitle}>Family Members</Text>
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
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                      {member.userId === user.id && ' (Me)'}
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
            <Text style={styles.leaveButtonText}>Leave Family</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Not joined family
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create Family</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter family name"
              value={familyName}
              onChangeText={setFamilyName}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateFamily}
            >
              <Text style={styles.buttonText}>Create New Family</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Join Family</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
            />
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinFamily}
            >
              <Text style={styles.buttonText}>Join Family</Text>
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