import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
// Temporarily comment out the env import to make UI work
// import { OPENAI_API_KEY } from '@env';

// Placeholder for development - replace with proper env setup later
const OPENAI_API_KEY = 'sk-placeholder-api-key-for-ui-development';

// Import the component-specific styles
import styles from '../styles/screens/HealthProfileScreen';

const HealthProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Options data
  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodTypeOptions = ['A', 'B', 'AB', 'O', 'Unknown'];
  const activityOptions = ['Light Activity', 'Moderate Activity', 'Heavy Activity', 'Sedentary'];
  const weightGoalOptions = ['Lose Weight', 'Gain Weight', 'Maintain Weight'];

  // Health conditions options
  const healthConditions = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'heart', label: 'Heart Disease' },
    { id: 'kidney', label: 'Kidney Disease' },
  ];

  // Diet preferences options
  const dietOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'glutenFree', label: 'Gluten-Free' },
    { id: 'lactoseFree', label: 'Lactose-Free' },
  ];

  useEffect(() => {
    fetchHealthProfile();
  }, []);

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

  // Option toggle function
  const toggleOption = (optionId, category) => {
    let currentOptions = [...profile[category]];
    
    if (currentOptions.includes(optionId)) {
      currentOptions = currentOptions.filter(id => id !== optionId);
    } else {
      currentOptions.push(optionId);
    }
    
    setProfile({
      ...profile,
      [category]: currentOptions
    });
  };

  // Check if option is selected
  const isOptionSelected = (option, category) => {
    return profile[category].includes(option);
  };
  
  // Show message
  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      // Web side uses window.alert
      window.alert(`${title}\n${message}`);
    } else {
      // Mobile side uses Alert
      Alert.alert(title, message);
    }
  };

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
          {profile?.healthConditions?.hasAllergies?.length > 0 && (
            <Text style={styles.tag}>Allergies: {profile.healthConditions.hasAllergies.join(', ')}</Text>
          )}
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
        <Text style={styles.sectionTitle}>Diet Goals</Text>
        <View style={styles.tagsContainer}>
          {profile?.dietaryGoals?.weightGoal && <Text style={styles.tag}>{profile.dietaryGoals.weightGoal}</Text>}
          {profile?.dietaryGoals?.calorieGoal && <Text style={styles.tag}>{profile.dietaryGoals.calorieGoal} kcal</Text>}
          {profile?.dietaryGoals?.proteinGoal && <Text style={styles.tag}>{profile.dietaryGoals.proteinGoal}g protein</Text>}
          {profile?.dietaryGoals?.carbGoal && <Text style={styles.tag}>{profile.dietaryGoals.carbGoal}g carbs</Text>}
          {profile?.dietaryGoals?.fatGoal && <Text style={styles.tag}>{profile.dietaryGoals.fatGoal}g fat</Text>}
        </View>
      </View>

      {/* Health Tags Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Tags</Text>
        <Text style={styles.sectionDescription}>Based on your health profile, we've generated these tags to help personalize your experience:</Text>
        <View style={styles.tagsContainer}>
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

  const renderEditMode = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        {/* Height */}
        <TextInput
          style={styles.input}
          value={profile?.basicInfo?.height?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            basicInfo: {...profile.basicInfo, height: text}
          })}
          keyboardType="numeric"
          placeholder="Height (cm)"
        />
        
        {/* Weight */}
        <TextInput
          style={styles.input}
          value={profile?.basicInfo?.weight?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            basicInfo: {...profile.basicInfo, weight: text}
          })}
          keyboardType="numeric"
          placeholder="Weight (kg)"
        />
        
        {/* Age */}
        <TextInput
          style={styles.input}
          value={profile?.basicInfo?.age?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            basicInfo: {...profile.basicInfo, age: text}
          })}
          keyboardType="numeric"
          placeholder="Age"
        />
        
        {/* Gender Dropdown */}
        <TouchableOpacity 
          style={styles.selectInput}
          onPress={() => openModal('gender')}
        >
          <Text style={styles.selectText}>{profile?.basicInfo?.gender || 'Select Gender'}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
        
        {/* Blood Type Dropdown */}
        <TouchableOpacity 
          style={styles.selectInput}
          onPress={() => openModal('bloodType')}
        >
          <Text style={styles.selectText}>{profile?.basicInfo?.bloodType || 'Select Blood Type'}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* Health Conditions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Conditions</Text>
        <View style={styles.optionsGrid}>
          {healthConditions.map((condition) => (
            <TouchableOpacity
              key={condition.id}
              style={[
                styles.conditionItem,
                profile?.healthConditions?.[condition.id] ? styles.selectedOption : null
              ]}
              onPress={() => setProfile({
                ...profile,
                healthConditions: {
                  ...profile.healthConditions,
                  [condition.id]: !profile.healthConditions[condition.id]
                }
              })}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.conditionText,
                  profile?.healthConditions?.[condition.id] ? styles.selectedOptionText : null
                ]}
              >
                {condition.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Allergies */}
        <TextInput
          style={[styles.input, { marginTop: theme.SPACING.MEDIUM }]}
          value={profile?.healthConditions?.hasAllergies?.join(', ')}
          onChangeText={(text) => setProfile({
            ...profile,
            healthConditions: {
              ...profile.healthConditions,
              hasAllergies: text.split(',').map(item => item.trim())
            }
          })}
          placeholder="Allergies (comma separated)"
        />
      </View>

      {/* Lifestyle Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <View style={styles.optionsGrid}>
          {dietOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dietItem,
                profile?.lifestyle?.[option.id] ? styles.selectedOption : null
              ]}
              onPress={() => setProfile({
                ...profile,
                lifestyle: {
                  ...profile.lifestyle,
                  [option.id]: !profile.lifestyle[option.id]
                }
              })}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.optionText,
                  profile?.lifestyle?.[option.id] ? styles.selectedOptionText : null
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Activity Level Dropdown */}
        <TouchableOpacity 
          style={[styles.selectInput, { marginTop: theme.SPACING.MEDIUM }]}
          onPress={() => openModal('activity')}
        >
          <Text style={styles.selectText}>{profile?.lifestyle?.activityLevel || 'Select Activity Level'}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* Diet Goals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diet Goals</Text>
        
        {/* Weight Goal */}
        <TouchableOpacity 
          style={styles.selectInput}
          onPress={() => openModal('weightGoal')}
        >
          <Text style={styles.selectText}>{profile?.dietaryGoals?.weightGoal || 'Select Weight Goal'}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
        
        {/* Calorie Goal */}
        <TextInput
          style={styles.input}
          value={profile?.dietaryGoals?.calorieGoal?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            dietaryGoals: {...profile.dietaryGoals, calorieGoal: text}
          })}
          keyboardType="numeric"
          placeholder="Daily Calorie Goal (kcal)"
        />
        
        {/* Protein Goal */}
        <TextInput
          style={styles.input}
          value={profile?.dietaryGoals?.proteinGoal?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            dietaryGoals: {...profile.dietaryGoals, proteinGoal: text}
          })}
          keyboardType="numeric"
          placeholder="Daily Protein Goal (g)"
        />
        
        {/* Carb Goal */}
        <TextInput
          style={styles.input}
          value={profile?.dietaryGoals?.carbGoal?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            dietaryGoals: {...profile.dietaryGoals, carbGoal: text}
          })}
          keyboardType="numeric"
          placeholder="Daily Carb Goal (g)"
        />
        
        {/* Fat Goal */}
        <TextInput
          style={styles.input}
          value={profile?.dietaryGoals?.fatGoal?.toString()}
          onChangeText={(text) => setProfile({
            ...profile,
            dietaryGoals: {...profile.dietaryGoals, fatGoal: text}
          })}
          keyboardType="numeric"
          placeholder="Daily Fat Goal (g)"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            setIsEditing(false);
            fetchHealthProfile(); // Reset to original data
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={saveProfile}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      {isEditing ? renderEditMode() : renderViewMode()}
      
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

export default HealthProfileScreen; 