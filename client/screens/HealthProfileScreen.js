import React, { useState } from 'react';
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
  const [profile, setProfile] = useState({
    height: '163',
    weight: '100',
    age: '25',
    gender: '女',
    bloodType: 'AB型',
    healthConditions: ['糖尿病', '高血压'],
    allergies: '花粉, 小米',
    dietPreferences: ['素食', '纯素'],
    activityLevel: '轻度活动',
    weightGoal: '维持体重',
    calorieGoal: '',
    proteinGoal: '',
    carbGoal: '',
    fatGoal: '',
  });
  
  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // 选项数据
  const genderOptions = ['男', '女', '其他'];
  const bloodTypeOptions = ['A型', 'B型', 'AB型', 'O型', '不确定'];
  const activityOptions = ['轻度活动', '中度活动', '重度活动', '久坐不动'];
  const weightGoalOptions = ['减重', '增重', '维持体重'];

  // 健康状况选项
  const healthConditions = [
    { id: 'diabetes', label: '糖尿病' },
    { id: 'hypertension', label: '高血压' },
    { id: 'heart', label: '心脏病' },
    { id: 'kidney', label: '肾病' },
  ];

  // 饮食偏好选项
  const dietOptions = [
    { id: 'vegetarian', label: '素食' },
    { id: 'vegan', label: '纯素' },
    { id: 'glutenFree', label: '无麸质' },
    { id: 'lactoseFree', label: '无乳糖' },
  ];
  
  // 打开选项模态框
  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };
  
  // 选择选项
  const selectOption = (option) => {
    if (modalType === 'gender') {
      setProfile({...profile, gender: option});
    } else if (modalType === 'bloodType') {
      setProfile({...profile, bloodType: option});
    } else if (modalType === 'activity') {
      setProfile({...profile, activityLevel: option});
    } else if (modalType === 'weightGoal') {
      setProfile({...profile, weightGoal: option});
    }
    setModalVisible(false);
  };

  // 选项切换函数
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

  // 检查选项是否被选中
  const isOptionSelected = (option, category) => {
    return profile[category].includes(option);
  };
  
  // 显示提示信息
  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      // Web 端使用 window.alert
      window.alert(`${title}\n${message}`);
    } else {
      // 移动端使用 Alert
      Alert.alert(title, message);
    }
  };

  // 保存个人信息
  const saveProfile = async () => {
    try {
      // 获取 token
      const token = await authService.getToken();
      if (!token) {
        showMessage('错误', '请先登录');
        return;
      }

      // 转换数据格式以匹配后端 API
      const healthData = {
        basicInfo: {
          height: parseFloat(profile.height),
          weight: parseFloat(profile.weight),
          age: parseInt(profile.age),
          gender: profile.gender,
          bloodType: profile.bloodType
        },
        healthConditions: {
          hasDiabetes: profile.healthConditions.includes('糖尿病'),
          hasHypertension: profile.healthConditions.includes('高血压'),
          hasHeartDisease: profile.healthConditions.includes('心脏病'),
          hasKidneyDisease: profile.healthConditions.includes('肾病'),
          hasAllergies: profile.allergies.split(',').map(item => item.trim())
        },
        lifestyle: {
          isVegetarian: profile.dietPreferences.includes('素食'),
          isVegan: profile.dietPreferences.includes('纯素'),
          isGlutenFree: profile.dietPreferences.includes('无麸质'),
          isLactoseFree: profile.dietPreferences.includes('无乳糖'),
          activityLevel: profile.activityLevel
        },
        dietaryGoals: {
          weightGoal: profile.weightGoal === '减重' ? 'lose' : 
                     profile.weightGoal === '增重' ? 'gain' : 'maintain',
          calorieGoal: profile.calorieGoal ? parseInt(profile.calorieGoal) : null,
          proteinGoal: profile.proteinGoal ? parseInt(profile.proteinGoal) : null,
          carbGoal: profile.carbGoal ? parseInt(profile.carbGoal) : null,
          fatGoal: profile.fatGoal ? parseInt(profile.fatGoal) : null
        }
      };

      const response = await axios.put(
        `${API_URL}/health/profile`,
        healthData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showMessage('成功', '健康档案已保存');
      } else {
        showMessage('错误', response.data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存健康档案失败:', error);
      showMessage('错误', error.response?.data?.message || '保存失败，请稍后重试');
    }
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 基本信息部分 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          
          {/* 身高 */}
          <TextInput
            style={styles.input}
            value={profile.height}
            onChangeText={(text) => setProfile({...profile, height: text})}
            keyboardType="numeric"
            placeholder="身高 (cm)"
          />
          
          {/* 体重 */}
          <TextInput
            style={styles.input}
            value={profile.weight}
            onChangeText={(text) => setProfile({...profile, weight: text})}
            keyboardType="numeric"
            placeholder="体重 (kg)"
          />
          
          {/* 年龄 */}
          <TextInput
            style={styles.input}
            value={profile.age}
            onChangeText={(text) => setProfile({...profile, age: text})}
            keyboardType="numeric"
            placeholder="年龄"
          />
          
          {/* 性别下拉框 */}
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => openModal('gender')}
          >
            <Text style={styles.selectText}>{profile.gender}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          {/* 血型下拉框 */}
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => openModal('bloodType')}
          >
            <Text style={styles.selectText}>{profile.bloodType}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* 健康状况部分 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>健康状况</Text>
          <View style={styles.optionsGrid}>
            {healthConditions.map((condition) => (
              <TouchableOpacity
                key={condition.id}
                style={[
                  styles.conditionItem,
                  isOptionSelected(condition.label, 'healthConditions') ? styles.selectedOption : null
                ]}
                onPress={() => toggleOption(condition.label, 'healthConditions')}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.conditionText,
                    isOptionSelected(condition.label, 'healthConditions') ? styles.selectedOptionText : null
                  ]}
                >
                  {condition.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* 过敏原 */}
          <TextInput
            style={[styles.input, { marginTop: theme.SPACING.MEDIUM }]}
            value={profile.allergies}
            onChangeText={(text) => setProfile({...profile, allergies: text})}
            placeholder="过敏原 (逗号分隔)"
          />
        </View>

        {/* 生活方式部分 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>生活方式</Text>
          <View style={styles.optionsGrid}>
            {dietOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dietItem,
                  isOptionSelected(option.label, 'dietPreferences') ? styles.selectedOption : null
                ]}
                onPress={() => toggleOption(option.label, 'dietPreferences')}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.optionText,
                    isOptionSelected(option.label, 'dietPreferences') ? styles.selectedOptionText : null
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* 活动水平下拉框 */}
          <TouchableOpacity 
            style={[styles.selectInput, { marginTop: theme.SPACING.MEDIUM }]}
            onPress={() => openModal('activity')}
          >
            <Text style={styles.selectText}>{profile.activityLevel}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* 饮食目标部分 - 新增 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>饮食目标</Text>
          
          {/* 体重目标 */}
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => openModal('weightGoal')}
          >
            <Text style={styles.selectText}>{profile.weightGoal}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          {/* 卡路里目标 */}
          <TextInput
            style={styles.input}
            value={profile.calorieGoal}
            onChangeText={(text) => setProfile({...profile, calorieGoal: text})}
            keyboardType="numeric"
            placeholder="每日卡路里目标 (kcal)"
          />
          
          {/* 蛋白质目标 */}
          <TextInput
            style={styles.input}
            value={profile.proteinGoal}
            onChangeText={(text) => setProfile({...profile, proteinGoal: text})}
            keyboardType="numeric"
            placeholder="每日蛋白质目标 (g)"
          />
          
          {/* 碳水化合物目标 */}
          <TextInput
            style={styles.input}
            value={profile.carbGoal}
            onChangeText={(text) => setProfile({...profile, carbGoal: text})}
            keyboardType="numeric"
            placeholder="每日碳水化合物目标 (g)"
          />
          
          {/* 脂肪目标 */}
          <TextInput
            style={styles.input}
            value={profile.fatGoal}
            onChangeText={(text) => setProfile({...profile, fatGoal: text})}
            keyboardType="numeric"
            placeholder="每日脂肪目标 (g)"
          />
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveProfile}
        >
          <Text style={styles.saveButtonText}>保存健康档案</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* 选项选择模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'gender' ? '选择性别' :
               modalType === 'bloodType' ? '选择血型' :
               modalType === 'activity' ? '选择活动水平' :
               modalType === 'weightGoal' ? '选择体重目标' : ''}
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
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HealthProfileScreen; 