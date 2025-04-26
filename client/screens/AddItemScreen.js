import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useItems } from '../hooks/useItems';

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const { handleAddItem } = useItems();

  const handleSubmit = async () => {
    if (!name || !quantity || !expiryDate) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    try {
      const newItem = {
        name,
        quantity: parseInt(quantity),
        expiryDate: new Date(expiryDate).toISOString(),
      };

      const success = await handleAddItem(newItem);
      if (success) {
        Alert.alert('成功', '物品添加成功');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('错误', '添加物品失败');
      console.error('添加物品错误:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>物品名称</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="请输入物品名称"
      />

      <Text style={styles.label}>数量</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="请输入数量"
        keyboardType="numeric"
      />

      <Text style={styles.label}>过期日期</Text>
      <TextInput
        style={styles.input}
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder="YYYY-MM-DD"
      />

      <Button title="添加物品" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
  },
}); 