/**
 * UserAvatar Component
 * Displays a user's avatar image or initials in a circular container
 * @param {Object} props - Component props
 * @param {Object} props.user - User object containing avatar and username information
 * @param {string} [props.user.avatar] - URL of the user's avatar image
 * @param {string} [props.user.username] - User's username for generating initials
 * @param {Function} [props.onPress] - Callback function when avatar is pressed
 * @param {number} [props.size=40] - Size of the avatar in pixels
 * @returns {JSX.Element|null} Rendered component or null if no user is provided
 */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const UserAvatar = ({ user, onPress, size = 40 }) => {
  if (!user) {
    return null;
  }

  /**
   * Generates initials from the user's username
   * @returns {string} Uppercase initials or '?' if no username is available
   */
  const getInitials = () => {
    if (!user.username) return '?';
    return user.username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View 
        style={[
          styles.avatarContainer, 
          size && { 
            width: size, 
            height: size, 
            borderRadius: size / 2 
          }
        ]}
      >
        {user.avatar ? (
          <Image
            style={[
              styles.avatarImage,
              size && { 
                width: size - 4, 
                height: size - 4, 
                borderRadius: (size - 4) / 2 
              }
            ]}
            source={{ uri: user.avatar }}
          />
        ) : (
          <Text 
            style={[
              styles.avatarInitial, 
              size && { fontSize: size / 2.5 }
            ]}
          >
            {getInitials()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Styles for the UserAvatar component
 * @type {Object}
 */
const styles = StyleSheet.create({
  avatarContainer: {
    overflow: 'hidden',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2B40',
  },
});

export default UserAvatar; 