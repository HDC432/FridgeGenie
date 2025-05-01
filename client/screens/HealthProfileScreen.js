import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import HealthEditScreen from './HealthEditScreen';

/**
 * HealthProfileScreen Component
 * Displays user's health profile information and provides editing functionality.
 * Shows health conditions, dietary restrictions, and other health-related preferences.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @returns {JSX.Element} HealthProfileScreen component
 */

const HealthProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    basicInfo: {
      height: '',
      weight: '',
      age: '',
      gender: '',
      bloodType: ''
    },
    healthConditions: {
      hasDiabetes: false,
      hasHypertension: false,
      hasHeartDisease: false,
      hasKidneyDisease: false,
      hasAllergies: []
    },
    lifestyle: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isLactoseFree: false,
      activityLevel: ''
    },
    dietaryGoals: {
      weightGoal: '',
      calorieGoal: '',
      proteinGoal: '',
      carbGoal: '',
      fatGoal: ''
    },
    healthTags: []
  });
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Options data
  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodTypeOptions = ['A', 'B', 'AB', 'O', 'Unknown'];
  const activityOptions = ['Light Activity', 'Moderate Activity', 'Heavy Activity', 'Sedentary'];
  const weightGoalOptions = ['Lose Weight', 'Gain Weight', 'Maintain Weight'];

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  /**
   * Loads user's health profile data
   * @async
   * @function loadHealthProfile
   */

  const fetchHealthProfile = async () => {
    try {
      const token = await authService.getToken();
      if (!token) {
        showMessage('Error', 'Please log in first');
        return;
      }

      const response = await axios.get(
        `${API_URL}/health/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Fetch health profile failed:', error);
      showMessage('Error', error.response?.data?.message || 'Failed to fetch health profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Open option modal
  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };
  
  // Select option
  const selectOption = (option) => {
    if (modalType === 'gender') {
      setProfile({...profile, basicInfo: {...profile.basicInfo, gender: option}});
    } else if (modalType === 'bloodType') {
      setProfile({...profile, basicInfo: {...profile.basicInfo, bloodType: option}});
    } else if (modalType === 'activity') {
      setProfile({...profile, lifestyle: {...profile.lifestyle, activityLevel: option}});
    } else if (modalType === 'weightGoal') {
      setProfile({...profile, dietaryGoals: {...profile.dietaryGoals, weightGoal: option}});
    }
    setModalVisible(false);
  };

  /**
   * Shows a message to the user
   * @param {string} title - Message title
   * @param {string} message - Message content
   */

  // Show message
  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  /**
   * Handles profile update
   * @async
   * @param {Object} updatedProfile - Updated profile data
   * @function handleProfileUpdate
   */

  // Save personal information
  const saveProfile = async () => {
    try {
      const token = await authService.getToken();
      if (!token) {
        showMessage('Error', 'Please log in first');
        return;
      }

      const response = await axios.put(
        `${API_URL}/health/profile`,
        profile,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showMessage('Success', 'Health profile saved');
        setIsEditing(false);
        fetchHealthProfile(); // Refresh the profile data
      } else {
        showMessage('Error', response.data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save health profile failed:', error);
      showMessage('Error', error.response?.data?.message || 'Save failed, please try again later');
    }
  };

  const styles = StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: theme.COLORS.BACKGROUND,
      ...(Platform.OS === 'web' ? {
        height: '100vh',
        overflow: 'hidden'
      } : {})
    },
    container: {
      flex: 1,
      ...(Platform.OS === 'web' ? {
        height: 'calc(100vh - 80px)', 
        overflow: 'auto'
      } : {})
    },
    contentContainer: {
      padding: theme.SPACING.MEDIUM,
      paddingBottom: Platform.OS === 'web' ? 100 : 80,
    },
    section: {
      marginBottom: theme.SPACING.LARGE,
      backgroundColor: theme.COLORS.WHITE,
      borderRadius: theme.BORDER_RADIUS.MEDIUM,
      padding: theme.SPACING.MEDIUM,
      shadowColor: theme.COLORS.BLACK,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: theme.FONT_SIZE.LARGE,
      fontWeight: 'bold',
      marginBottom: theme.SPACING.MEDIUM,
      color: theme.COLORS.TEXT_PRIMARY,
    },
    sectionDescription: {
      fontSize: theme.FONT_SIZE.SMALL,
      color: theme.COLORS.TEXT_SECONDARY,
      marginBottom: theme.SPACING.MEDIUM,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.SPACING.SMALL,
    },
    infoLabel: {
      fontSize: theme.FONT_SIZE.MEDIUM,
      color: theme.COLORS.TEXT_SECONDARY,
    },
    infoValue: {
      fontSize: theme.FONT_SIZE.MEDIUM,
      color: theme.COLORS.TEXT_PRIMARY,
      fontWeight: '500',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.SPACING.SMALL,
    },
    tag: {
      backgroundColor: theme.COLORS.PRIMARY_LIGHT,
      paddingHorizontal: theme.SPACING.MEDIUM,
      paddingVertical: theme.SPACING.SMALL,
      borderRadius: theme.BORDER_RADIUS.SMALL,
      fontSize: theme.FONT_SIZE.SMALL,
      color: theme.COLORS.PRIMARY,
    },
    editButton: {
      backgroundColor: theme.COLORS.PRIMARY,
      padding: theme.SPACING.MEDIUM,
      borderRadius: theme.BORDER_RADIUS.SMALL,
      marginTop: theme.SPACING.LARGE,
      marginBottom: theme.SPACING.LARGE,
      width: '100%',
      ...(Platform.OS === 'web' ? {
        position: 'fixed',
        bottom: theme.SPACING.MEDIUM,
        left: theme.SPACING.MEDIUM,
        right: theme.SPACING.MEDIUM,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        height: '60px'
      } : {})
    },
    editButtonText: {
      color: theme.COLORS.WHITE,
      textAlign: 'center',
      fontSize: theme.FONT_SIZE.MEDIUM,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      maxWidth: 400,
      backgroundColor: theme.COLORS.BACKGROUND,
      borderRadius: theme.BORDER_RADIUS.MEDIUM,
      padding: theme.SPACING.LARGE,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      } : {})
    },
    modalTitle: {
      fontSize: theme.FONT_SIZE.LARGE,
      fontWeight: 'bold',
      color: theme.COLORS.SECONDARY,
      marginBottom: theme.SPACING.LARGE,
      textAlign: 'center',
    },
    modalOption: {
      paddingVertical: theme.SPACING.MEDIUM,
      borderBottomWidth: 1,
      borderBottomColor: theme.COLORS.DIVIDER,
      ...(Platform.OS === 'web' ? {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: theme.COLORS.PRIMARY_LIGHT,
        }
      } : {})
    },
    modalOptionText: {
      fontSize: theme.FONT_SIZE.MEDIUM,
      color: theme.COLORS.SECONDARY,
      textAlign: 'center',
    },
    modalCancel: {
      marginTop: theme.SPACING.LARGE,
      padding: theme.SPACING.MEDIUM,
      backgroundColor: theme.COLORS.LIGHT_GRAY,
      borderRadius: theme.BORDER_RADIUS.SMALL,
      alignItems: 'center',
      ...(Platform.OS === 'web' ? {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          opacity: 0.9,
        }
      } : {})
    },
    modalCancelText: {
      color: theme.COLORS.SECONDARY,
      fontWeight: '500',
    },
  });

  /**
   * Renders health condition section
   * @returns {JSX.Element} Health condition component
   */

  const renderViewMode = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Height:</Text>
          <Text style={styles.infoValue}>{profile?.basicInfo?.height ? `${profile.basicInfo.height} cm` : 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weight:</Text>
          <Text style={styles.infoValue}>{profile?.basicInfo?.weight ? `${profile.basicInfo.weight} kg` : 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoValue}>{profile?.basicInfo?.age || 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender:</Text>
          <Text style={styles.infoValue}>{profile?.basicInfo?.gender || 'Not set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Type:</Text>
          <Text style={styles.infoValue}>{profile?.basicInfo?.bloodType || 'Not set'}</Text>
        </View>
      </View>

      {/* Health Conditions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Conditions</Text>
        <View style={styles.tagsContainer}>
          {profile?.healthConditions?.hasDiabetes && <Text style={styles.tag}>Diabetes</Text>}
          {profile?.healthConditions?.hasHypertension && <Text style={styles.tag}>Hypertension</Text>}
          {profile?.healthConditions?.hasHeartDisease && <Text style={styles.tag}>Heart Disease</Text>}
          {profile?.healthConditions?.hasKidneyDisease && <Text style={styles.tag}>Kidney Disease</Text>}
        </View>
      </View>

      {/* Lifestyle Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <View style={styles.tagsContainer}>
          {profile?.lifestyle?.isVegetarian && <Text style={styles.tag}>Vegetarian</Text>}
          {profile?.lifestyle?.isVegan && <Text style={styles.tag}>Vegan</Text>}
          {profile?.lifestyle?.isGlutenFree && <Text style={styles.tag}>Gluten-Free</Text>}
          {profile?.lifestyle?.isLactoseFree && <Text style={styles.tag}>Lactose-Free</Text>}
          {profile?.lifestyle?.activityLevel && <Text style={styles.tag}>{profile.lifestyle.activityLevel}</Text>}
        </View>
      </View>

      {/* Diet Goals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Goals</Text>
        <View style={styles.tagsContainer}>
          {profile?.dietaryGoals?.weightGoal && <Text style={styles.tag}>{profile.dietaryGoals.weightGoal}</Text>}
          {profile?.dietaryGoals?.calorieGoal && <Text style={styles.tag}>{profile.dietaryGoals.calorieGoal} kcal</Text>}
          {profile?.dietaryGoals?.proteinGoal && <Text style={styles.tag}>{profile.dietaryGoals.proteinGoal}g Protein</Text>}
          {profile?.dietaryGoals?.carbGoal && <Text style={styles.tag}>{profile.dietaryGoals.carbGoal}g Carbs</Text>}
          {profile?.dietaryGoals?.fatGoal && <Text style={styles.tag}>{profile.dietaryGoals.fatGoal}g Fat</Text>}
        </View>
      </View>

      {/* Health Tags Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Tags</Text>
        <Text style={styles.sectionDescription}>Based on your health profile, we've generated these tags to personalize your experience:</Text>
        <View style={styles.tagsContainer}>
          {profile?.healthConditions?.hasAllergies?.length > 0 && (
            <Text style={styles.tag}>Allergies: {profile.healthConditions.hasAllergies.join(', ')}</Text>
          )}
          {profile?.healthTags?.map((tag, index) => (
            <Text key={index} style={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => setIsEditing(true)}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  /**
   * Renders dietary restriction section
   * @returns {JSX.Element} Dietary restriction component
   */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      {isEditing ? (
        <HealthEditScreen
          profile={profile}
          setProfile={setProfile}
          onSave={saveProfile}
          onCancel={() => {
            setIsEditing(false);
            fetchHealthProfile();
          }}
          openModal={openModal}
        />
      ) : (
        renderViewMode()
      )}
      
      {/* Option Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'gender' ? 'Select Gender' :
               modalType === 'bloodType' ? 'Select Blood Type' :
               modalType === 'activity' ? 'Select Activity Level' :
               modalType === 'weightGoal' ? 'Select Weight Goal' : ''}
            </Text>
            
            {(modalType === 'gender' ? genderOptions :
              modalType === 'bloodType' ? bloodTypeOptions :
              modalType === 'activity' ? activityOptions :
              modalType === 'weightGoal' ? weightGoalOptions : []).map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => selectOption(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Renders health tag section
 * @returns {JSX.Element} Health tag component
 */

export default HealthProfileScreen; 