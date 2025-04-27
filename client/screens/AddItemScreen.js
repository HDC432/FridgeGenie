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
  const [quantity, setQuantity] = useState('1');
  const [year, setYear]     = useState(currentYear.toString());
  const [month, setMonth]   = useState((today.getMonth() + 1).toString());
  const [day, setDay]       = useState(today.getDate().toString());
  const [daysInMonth, setDaysInMonth] = useState(
    new Date(currentYear, today.getMonth() + 1, 0).getDate()
  );

  // 当年或月改变时，更新当月天数，并确保日不超出范围
  useEffect(() => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dim = new Date(yearNum, monthNum, 0).getDate();
    setDaysInMonth(dim);
    const dayNum = parseInt(day);
    if (dayNum > dim) setDay(dim.toString());
  }, [year, month]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请填写物品名称');
      return;
    }
    // 组合年月日为 Date 对象
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const expiry = new Date(yearNum, monthNum - 1, dayNum);
    try {
      const newItem = {
        name: name.trim(),
        quantity: parseInt(quantity),
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
    (_, i) => (currentYear - 5 + i).toString()
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
          onValueChange={(value) => setQuantity(value)}
          style={{ color: '#000' }}
        >
          {Array.from({ length: 100 }, (_, i) => (i + 1).toString()).map(n => (
            <Picker.Item key={n} label={n} value={n} color="#000" />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>过期日期</Text>
      <View style={styles.datePickerRow}>
        {/* 年 */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={year}
            onValueChange={(value) => setYear(value)}
            style={{ color: '#000', height: 180 }}
            itemStyle={{ fontSize: 14 }}
          >
            {yearOptions.map(y => (
              <Picker.Item key={y} label={`${y}年`} value={y} color="#000" style={{ fontSize: 14 }} />
            ))}
          </Picker>
        </View>
        {/* 月 */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={month}
            onValueChange={(value) => setMonth(value)}
            style={{ color: '#000', height: 180 }}
            itemStyle={{ fontSize: 14 }}
          >
            {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(m => (
              <Picker.Item key={m} label={`${m}月`} value={m} color="#000" style={{ fontSize: 14 }} />
            ))}
          </Picker>
        </View>
        {/* 日 */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={day}
            onValueChange={(value) => setDay(value)}
            style={{ color: '#000', height: 180 }}
            itemStyle={{ fontSize: 14 }}
          >
            {Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()).map(d => (
              <Picker.Item key={d} label={`${d}日`} value={d} color="#000" style={{ fontSize: 14 }} />
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
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
    color: '#000',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -2,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginHorizontal: 2,
    overflow: 'hidden',
    height: 180,
  },
  submitButton: {
    marginTop: 30,
  },
});
