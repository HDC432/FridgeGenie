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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { addItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>添加物品</Text>
        <Text style={styles.subtitle}>
          将新的食品添加到你的冰箱清单中，并设置过期日期
        </Text>
      </View>

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
            <Ionicons name="remove" size={20} color="#1F2B40" />
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
            <Ionicons name="add" size={20} color="#1F2B40" />
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
          <Ionicons name="calendar-outline" size={20} color="#1F2B40" />
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>添加到冰箱</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      web: {
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      },
      default: {
        flex: 1,
      },
    }),
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2B40',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formGroup: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2B40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2B40',
  },
  datePickerBtn: {
    backgroundColor: '#F5F7FA',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2B40',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    backgroundColor: '#F5F7FA',
    height: 48,
    marginHorizontal: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2B40',
    textAlign: 'center',
    minWidth: 80,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: '#FFC107',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2B40',
  },
});

export default AddItemScreen;
