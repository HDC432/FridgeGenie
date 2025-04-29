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
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('请输入物品名称');
      } else {
        Alert.alert('提示', '请输入物品名称');
      }
      return;
    }

    if (!user?.familyId) {
      if (Platform.OS === 'web') {
        alert('请先加入一个家庭');
      } else {
        Alert.alert('提示', '请先加入一个家庭');
      }
      return;
    }

    try {
      setLoading(true);
      console.log('添加物品:', { name, quantity, expiryDate, familyId: user.familyId });
      
      const success = await addItem({
        name: name.trim(),
        quantity: parseInt(quantity, 10) || 1,
        expiryDate: expiryDate.toISOString(),
        familyId: user.familyId,
      });

      if (success) {
        console.log('添加成功');
        setShowSuccessModal(true);
      } else {
        throw new Error('添加失败');
      }
    } catch (err) {
      console.error('添加物品失败:', err);
      if (Platform.OS === 'web') {
        alert('添加物品失败，请重试');
      } else {
        Alert.alert('错误', '添加物品失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    setName('');
    setQuantity('1');
    setExpiryDate(new Date());
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    navigation.navigate('Home');
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
          style={styles.cameraButton}
          onPress={() => Alert.alert('提示', '扫描功能即将上线')}
        >
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          <Text style={styles.cameraButtonText}>扫码添加物品</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '添加中...' : '添加到冰箱'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加成功</Text>
            <Text style={styles.modalMessage}>物品已添加到冰箱</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={handleContinue}
              >
                <Text style={styles.buttonText}>继续添加</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.homeButton]}
                onPress={handleBackToHome}
              >
                <Text style={styles.buttonText}>返回首页</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
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
    marginBottom: 20,
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
  pickerContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    overflow: 'hidden',
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
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  cameraButton: {
    backgroundColor: '#1F2B40',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2B40',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  continueButton: {
    backgroundColor: '#FFC107',
  },
  homeButton: {
    backgroundColor: '#1F2B40',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AddItemScreen;
