import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { addItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

// 简单的日期选择器实现
const SimpleDatePicker = ({ date, onDateChange, onClose }) => {
  // 生成未来30天的日期选项
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      options.push(date);
    }
    
    return options;
  };

  const dateOptions = generateDateOptions();

  return (
    <View style={styles.simpleDatePickerContainer}>
      <View style={styles.simpleDatePickerHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.datePickerTitle}>选择过期日期</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.doneButton}>完成</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.dateOptionsList}>
        {dateOptions.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.dateOption,
              format(date, 'yyyy-MM-dd') === format(option, 'yyyy-MM-dd') ? styles.selectedDateOption : null
            ]}
            onPress={() => {
              onDateChange(option);
              // 不要立即关闭，让用户确认选择
            }}
          >
            <Text 
              style={[
                styles.dateOptionText,
                format(date, 'yyyy-MM-dd') === format(option, 'yyyy-MM-dd') ? styles.selectedDateOptionText : null
              ]}
            >
              {format(option, 'yyyy年MM月dd日')}
              {index === 0 ? ' (今天)' : index === 1 ? ' (明天)' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const AddItemScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 增减数量
  const increaseQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    setQuantity((current + 1).toString());
  };

  const decreaseQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  // 提交添加物品
  const handleSubmit = async () => {
    try {
      if (!user?.familyId) {
        Alert.alert('错误', '请先加入或创建一个家庭');
        return;
      }

      if (!name || !quantity || !expiryDate) {
        Alert.alert('错误', '请填写必填字段');
        return;
      }

      setLoading(true);

      const newItem = {
        name,
        quantity: parseInt(quantity),
        expiryDate: expiryDate.toISOString(),
        familyId: user.familyId,
        createdAt: new Date().toISOString()
      };

      await addItem(newItem);
      setLoading(false);
      Alert.alert('成功', '物品已添加到冰箱');
      navigation.goBack();
    } catch (error) {
      console.error('添加物品失败:', error);
      setLoading(false);
      Alert.alert('错误', '添加物品失败，请重试');
    }
  };

  // 扫描小票功能
  const handleScanReceipt = () => {
    Alert.alert('功能提示', '扫描小票功能即将上线');
  };

  // 语音添加功能
  const handleVoiceInput = () => {
    Alert.alert('功能提示', '语音添加功能即将上线');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>添加物品</Text>
          <Text style={styles.subtitle}>
            将新的食品添加到你的冰箱清单中，并设置过期日期
          </Text>

          <View style={styles.formSection}>
            {/* 物品名称 */}
            <Text style={styles.label}>物品名称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：牛奶、鸡蛋..."
              value={name}
              onChangeText={setName}
            />

            {/* 数量 */}
            <Text style={styles.label}>数量</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={decreaseQuantity}
              >
                <Ionicons name="remove" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
              <View style={styles.quantityInputContainer}>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  textAlign="center"
                />
              </View>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* 过期日期 */}
            <Text style={styles.label}>过期日期</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {format(expiryDate, 'yyyy年MM月dd日')}
              </Text>
              <Ionicons name="calendar-outline" size={24} color={COLORS.SECONDARY} />
            </TouchableOpacity>
          </View>

          {/* 提交按钮 */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>添加到冰箱</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* 底部操作按钮 */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={handleScanReceipt}>
          <View style={styles.bottomButtonIconContainer}>
            <Ionicons name="scan-outline" size={24} color={COLORS.SECONDARY} />
          </View>
          <Text style={styles.bottomButtonText}>扫描小票</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton} onPress={handleVoiceInput}>
          <View style={styles.bottomButtonIconContainer}>
            <Ionicons name="mic-outline" size={24} color={COLORS.SECONDARY} />
          </View>
          <Text style={styles.bottomButtonText}>语音添加</Text>
        </TouchableOpacity>
      </View>

      {/* 日期选择器模态框 */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
            <SimpleDatePicker
              date={expiryDate}
              onDateChange={setExpiryDate}
              onClose={() => setShowDatePicker(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.LARGE,
    paddingBottom: 100, // 为底部按钮留出空间
  },
  title: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
    marginTop: SPACING.MEDIUM,
  },
  subtitle: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.LARGE,
  },
  formSection: {
    marginTop: SPACING.MEDIUM,
  },
  label: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.SMALL,
    marginTop: SPACING.LARGE,
  },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerBtn: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityBtn: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.CIRCLE,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInputContainer: {
    flex: 1,
    marginHorizontal: SPACING.LARGE,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityInput: {
    fontSize: FONT_SIZE.LARGE,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.XXLARGE,
    height: 50,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  bottomButtonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  bottomButtonText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.SECONDARY,
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS.LARGE, 
    borderTopRightRadius: BORDER_RADIUS.LARGE,
    width: '100%',
  },
  // 简易日期选择器样式
  simpleDatePickerContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS.LARGE,
    borderTopRightRadius: BORDER_RADIUS.LARGE,
    width: '100%',
  },
  simpleDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  datePickerTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  cancelButton: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.MEDIUM,
    padding: SPACING.SMALL,
  },
  doneButton: {
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.MEDIUM,
    padding: SPACING.SMALL,
  },
  dateOptionsList: {
    maxHeight: 300,
  },
  dateOption: {
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedDateOption: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  dateOptionText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
  },
  selectedDateOptionText: {
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
  },
});

export default AddItemScreen;
