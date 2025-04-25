import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Voice from '@react-native-community/voice';
import * as ImagePicker from 'expo-image-picker';
import { addItem } from '../services/databaseService';
import { recognizeFoodImage, categorizeFood } from '../services/aiService';
import { Ionicons } from '@expo/vector-icons';

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      setName(e.value[0]);
      // 自动分类
      handleAutoCategorize(e.value[0]);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '需要访问相册权限来识别食材');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleImageRecognition(result.assets[0].uri);
    }
  };

  const handleImageRecognition = async (imageUri) => {
    setIsLoading(true);
    try {
      const result = await recognizeFoodImage(imageUri);
      if (result.description && result.description.captions) {
        const foodName = result.description.captions[0].text;
        setName(foodName);
        handleAutoCategorize(foodName);
      }
    } catch (error) {
      Alert.alert('识别错误', '无法识别图片中的食材');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoCategorize = async (foodName) => {
    try {
      const category = await categorizeFood(foodName);
      setCategory(category);
    } catch (error) {
      console.error('分类错误:', error);
    }
  };

  const startListening = async () => {
    try {
      await Voice.start('zh-CN');
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async () => {
    if (!name || !quantity || !expiryDate) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    try {
      const newItem = {
        name,
        quantity: parseInt(quantity),
        expiryDate,
        addedDate: new Date().toISOString()
      };

      await addItem(newItem);
      
      Alert.alert(
        '成功',
        '物品已成功添加到冰箱！',
        [
          {
            text: '继续添加',
            onPress: () => {
              setName('');
              setQuantity('');
              setExpiryDate('');
            }
          },
          {
            text: '查看冰箱',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      Alert.alert('错误', '添加物品失败，请重试');
      console.error('添加物品时出错:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>添加新物品</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>物品名称</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例如：牛奶"
        />

        <Text style={styles.label}>数量</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="例如：2"
          keyboardType="numeric"
        />

        <Text style={styles.label}>过期日期</Text>
        <TextInput
          style={styles.input}
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="YYYY-MM-DD"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>添加到冰箱</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 