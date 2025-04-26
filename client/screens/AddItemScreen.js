import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useItems } from '../hooks/useItems';

export default function AddItemScreen({ navigation }) {
  const { handleAddItem } = useItems();
  const today = new Date();
  const currentYear = today.getFullYear();

  // 本地状态
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [year, setYear]     = useState(currentYear);
  const [month, setMonth]   = useState(today.getMonth() + 1);
  const [day, setDay]       = useState(today.getDate());
  const [daysInMonth, setDaysInMonth] = useState(
    new Date(currentYear, today.getMonth() + 1, 0).getDate()
  );

  // 当年或月改变时，更新当月天数，并确保日不超出范围
  useEffect(() => {
    const dim = new Date(year, month, 0).getDate();
    setDaysInMonth(dim);
    if (day > dim) setDay(dim);
  }, [year, month]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请填写物品名称');
      return;
    }
    // 组合年月日为 Date 对象
    const expiry = new Date(year, month - 1, day);
    try {
      const newItem = {
        name: name.trim(),
        quantity,
        expiryDate: expiry.toISOString(),
      };
      const success = await handleAddItem(newItem);
      if (success) {
        Alert.alert('成功', '物品添加成功');
        navigation.goBack();
      } else {
        Alert.alert('错误', '添加物品失败');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('错误', '添加物品失败');
    }
  };

  // 年份选项：当前年前后各 5 年
  const yearOptions = Array.from(
    { length: 11 },
    (_, i) => currentYear - 5 + i
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>物品名称</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入物品名称"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>数量</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={quantity}
          onValueChange={setQuantity}
        >
          {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
            <Picker.Item key={n} label={`${n}`} value={n} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>过期日期</Text>
      <View style={styles.datePickerRow}>
        {/* 年 */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={year}
            onValueChange={setYear}
          >
            {yearOptions.map(y => (
              <Picker.Item key={y} label={`${y}年`} value={y} />
            ))}
          </Picker>
        </View>
        {/* 月 */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={month}
            onValueChange={setMonth}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <Picker.Item key={m} label={`${m}月`} value={m} />
            ))}
          </Picker>
        </View>
        {/* 日 */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={day}
            onValueChange={setDay}
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <Picker.Item key={d} label={`${d}日`} value={d} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.submitButton}>
        <Button title="添加物品" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  label: { 
    fontSize: 16, 
    marginTop: 15, 
    marginBottom: 5 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 5,
    overflow: 'hidden',
  },
  submitButton: {
    marginTop: 30,
  },
});
