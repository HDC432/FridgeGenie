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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { addItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

const AddItemScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

      console.log('准备添加物品:', {
        name,
        quantity: parseInt(quantity),
        expiryDate: expiryDate.toISOString(),
        familyId: user.familyId
      });

      const newItem = {
        name,
        quantity: parseInt(quantity),
        expiryDate: expiryDate.toISOString(),
        familyId: user.familyId,
        createdAt: new Date().toISOString()
      };

      const result = await addItem(newItem);
      console.log('添加物品成功:', result);
      Alert.alert('成功', '物品已添加');
      navigation.goBack();
    } catch (error) {
      console.error('添加物品失败:', error);
      Alert.alert('错误', '添加物品失败，请重试');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>添加物品</Text>
        <Text style={styles.subtitle}>
          将新的食品添加到你的冰箱清单中，并设置过期日期
        </Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>物品名称</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：牛奶、鸡蛋..."
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>数量</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={decreaseQuantity}
            >
              <Ionicons name="remove" size={20} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={increaseQuantity}
            >
              <Ionicons name="add" size={20} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>过期日期</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {format(expiryDate, 'yyyy年MM月dd日')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>添加到冰箱</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.CONTAINER,
  },
  headerSection: {
    padding: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontSize: FONT_SIZE.XXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  formSection: {
    padding: SPACING.LARGE,
  },
  formGroup: {
    marginBottom: SPACING.LARGE,
  },
  label: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  input: {
    ...COMMON_STYLES.INPUT,
  },
  datePickerBtn: {
    ...COMMON_STYLES.INPUT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_STYLE.SMALL,
  },
  quantityInput: {
    ...COMMON_STYLES.INPUT,
    height: 48,
    marginHorizontal: SPACING.MEDIUM,
    textAlign: 'center',
    minWidth: 80,
    flex: 1,
  },
  buttonContainer: {
    padding: SPACING.LARGE,
    marginTop: SPACING.MEDIUM,
  },
  submitButton: {
    ...COMMON_STYLES.BUTTON,
  },
  submitButtonText: {
    ...COMMON_STYLES.BUTTON_TEXT,
  },
});

export default AddItemScreen;
