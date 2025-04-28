import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { generateAvatarText, generateAvatarColor } from '../utils/avatarUtils';

const UserAvatar = ({ user, onPress }) => {
  if (!user) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <MaterialIcons name="account-circle" size={40} color="#666" />
      </TouchableOpacity>
    );
  }

  const initials = generateAvatarText(user.username);
  const backgroundColor = generateAvatarColor(user.username);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.avatar, { backgroundColor }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserAvatar; 