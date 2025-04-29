import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
// Temporarily comment out the env import to make UI work
// import { OPENAI_API_KEY } from '@env';

// Placeholder for development - replace with proper env setup later
const OPENAI_API_KEY = 'sk-placeholder-api-key-for-ui-development';

// Import the component-specific styles
import styles from '../styles/screens/HealthProfileScreen';

const HealthProfileScreen = ({ navigation }) => {
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
  });
  
  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // 选项数据
  const genderOptions = ['男', '女', '其他'];
  const bloodTypeOptions = ['A型', 'B型', 'AB型', 'O型', '不确定'];
  const activityOptions = ['轻度活动', '中度活动', '重度活动', '久坐不动'];

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
    }
    setModalVisible(false);
  };

<<<<<<< HEAD
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
=======
    return (
        <ScrollView style={styles.container}>
            {/* 基本信息 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>基本信息</Text>
                {editing ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={healthProfile.basicInfo.height?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    height: parseFloat(text) || null
                                }
                            })}
                            placeholder="身高(cm)"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.basicInfo.weight?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    weight: parseFloat(text) || null
                                }
                            })}
                            placeholder="体重(kg)"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.basicInfo.age?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    age: parseInt(text) || null
                                }
                            })}
                            placeholder="年龄"
                            keyboardType="numeric"
                        />
                        <Picker
                            selectedValue={healthProfile.basicInfo.gender || ''}
                            onValueChange={(value) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    gender: value
                                }
                            })}
                        >
                            <Picker.Item label="请选择性别" value="" />
                            <Picker.Item label="男" value="male" />
                            <Picker.Item label="女" value="female" />
                            <Picker.Item label="其他" value="other" />
                        </Picker>
                        <Picker
                            selectedValue={healthProfile.basicInfo.bloodType}
                            onValueChange={(value) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    bloodType: value
                                }
                            })}
                        >
                            <Picker.Item label="请选择血型" value="" />
                            <Picker.Item label="A型" value="A" />
                            <Picker.Item label="B型" value="B" />
                            <Picker.Item label="AB型" value="AB" />
                            <Picker.Item label="O型" value="O" />
                        </Picker>
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>身高: {healthProfile.basicInfo.height ? `${healthProfile.basicInfo.height}cm` : '未设置'}</Text>
                        <Text style={styles.text}>体重: {healthProfile.basicInfo.weight ? `${healthProfile.basicInfo.weight}kg` : '未设置'}</Text>
                        <Text style={styles.text}>年龄: {healthProfile.basicInfo.age || '未设置'}</Text>
                        <Text style={styles.text}>性别: {healthProfile.basicInfo.gender === 'male' ? '男' : healthProfile.basicInfo.gender === 'female' ? '女' : healthProfile.basicInfo.gender === 'other' ? '其他' : '未设置'}</Text>
                        <Text style={styles.text}>血型: {healthProfile.basicInfo.bloodType || '未设置'}</Text>
                    </>
                )}
            </View>
>>>>>>> 634e2fa2e4b7083419a512457a9049a568316d97

  // 检查选项是否被选中
  const isOptionSelected = (option, category) => {
    return profile[category].includes(option);
  };
  
  // 保存个人信息
  const saveProfile = () => {
    // 这里应该添加保存到API的逻辑
    Alert.alert('成功', '健康档案已保存');
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
        
        {/* 保存按钮 */}
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
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
               modalType === 'bloodType' ? '选择血型' : '选择活动水平'}
            </Text>
            
            {modalType === 'gender' && genderOptions.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.modalOption}
                onPress={() => selectOption(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
            {modalType === 'bloodType' && bloodTypeOptions.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.modalOption}
                onPress={() => selectOption(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
            {modalType === 'activity' && activityOptions.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.modalOption}
                onPress={() => selectOption(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HealthProfileScreen; 