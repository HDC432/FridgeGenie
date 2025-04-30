import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      overflow: 'hidden'
    } : {})
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    ...(Platform.OS === 'web' ? {
      height: 'calc(100vh - 80px)', // 减去底部按钮的高度
      overflow: 'auto'
    } : {})
  },
  contentContainer: {
    flexGrow: 1,
    padding: SPACING.MEDIUM,
    paddingBottom: Platform.OS === 'web' ? 100 : 80,
  },
  section: {
    marginBottom: SPACING.LARGE,
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    ...SHADOW_STYLE.MEDIUM,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    marginBottom: SPACING.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  input: {
    ...COMMON_STYLES.INPUT,
    marginBottom: SPACING.MEDIUM,
  },
  selectInput: {
    ...COMMON_STYLES.INPUT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  selectText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: SPACING.SMALL
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  conditionItem: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  dietItem: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  selectedOption: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  selectedOptionText: {
    color: COLORS.WHITE,
  },
  buttonContainer: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    zIndex: 1000,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
      height: '80px'
    } : {})
  },
  button: {
    flex: 1,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    marginHorizontal: SPACING.SMALL,
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
});

const HealthEditScreen = ({ profile, setProfile, onSave, onCancel, openModal }) => {
  // Health conditions options
  const healthConditions = [
    { id: 'hasDiabetes', label: 'Diabetes' },
    { id: 'hasHypertension', label: 'Hypertension' },
    { id: 'hasHeartDisease', label: 'Heart Disease' },
    { id: 'hasKidneyDisease', label: 'Kidney Disease' },
  ];

  // Diet preferences options
  const dietOptions = [
    { id: 'isVegetarian', label: 'Vegetarian' },
    { id: 'isVegan', label: 'Vegan' },
    { id: 'isGlutenFree', label: 'Gluten-Free' },
    { id: 'isLactoseFree', label: 'Lactose-Free' },
  ];

  const sections = [
    {
      id: 'basicInfo',
      title: 'Basic Information',
      content: (
        <View>
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
          
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => openModal('gender')}
          >
            <Text style={styles.selectText}>{profile?.basicInfo?.gender || 'Select Gender'}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => openModal('bloodType')}
          >
            <Text style={styles.selectText}>{profile?.basicInfo?.bloodType || 'Select Blood Type'}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      )
    },
    {
      id: 'healthConditions',
      title: 'Health Conditions',
      content: (
        <View>
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
                    styles.selectText,
                    profile?.healthConditions?.[condition.id] ? styles.selectedOptionText : null
                  ]}
                >
                  {condition.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={[styles.input, { marginTop: SPACING.MEDIUM }]}
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
      )
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      content: (
        <View>
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
                    styles.selectText,
                    profile?.lifestyle?.[option.id] ? styles.selectedOptionText : null
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.selectInput, { marginTop: SPACING.MEDIUM }]}
            onPress={() => openModal('activity')}
          >
            <Text style={styles.selectText}>{profile?.lifestyle?.activityLevel || 'Select Activity Level'}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      )
    },
    {
      id: 'dietaryGoals',
      title: 'Dietary Goals',
      content: (
        <View>
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => openModal('weightGoal')}
          >
            <Text style={styles.selectText}>{profile?.dietaryGoals?.weightGoal || 'Select Weight Goal'}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
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
      )
    }
  ];

  const renderSection = ({ item }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{item.title}</Text>
      {item.content}
    </View>
  );

  return (
    <View style={styles.rootContainer}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={onSave}
        >
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HealthEditScreen;
