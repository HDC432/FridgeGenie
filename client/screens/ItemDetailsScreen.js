import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { updateItem, deleteItem } from '../services/databaseService';
import { getFoodSuggestions, generateExpiryReminder } from '../services/aiService';
import axios from 'axios';
// import { OPENAI_API_KEY } from '@env';

const AZURE_AI_ENDPOINT = 'YOUR_AZURE_AI_ENDPOINT';
const AZURE_AI_KEY = 'YOUR_AZURE_AI_KEY';
// const OPENAI_API_KEY = 'your_api_key_here';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function ItemDetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [reminder, setReminder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
    loadReminder();
  }, [item]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await getFoodSuggestions([item.name]);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('获取建议错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReminder = async () => {
    try {
      const reminder = await generateExpiryReminder(item);
      setReminder(reminder);
    } catch (error) {
      console.error('生成提醒错误:', error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '确认删除',
      '确定要删除这个食材吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('错误', '删除食材失败');
            }
          },
        },
      ]
    );
  };

  const getExpiryStatus = () => {
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'Expired', color: '#d32f2f' };
    } else if (daysUntilExpiry <= 3) {
      return { status: 'Expiring Soon', color: '#ff9800' };
    } else {
      return { status: 'Normal', color: '#4caf50' };
    }
  };

  const expiryStatus = getExpiryStatus();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Item Name</Text>
        <Text style={styles.value}>{item.name}</Text>

        <Text style={styles.label}>Quantity</Text>
        <Text style={styles.value}>{item.quantity}</Text>

        <Text style={styles.label}>Expiry Date</Text>
        <Text style={styles.value}>{new Date(item.expiryDate).toLocaleDateString()}</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{item.category}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color: expiryStatus.color }]}>
          {expiryStatus.status}
        </Text>
      </View>

      {reminder && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>AI Reminder</Text>
          <Text style={styles.sectionContent}>{reminder}</Text>
        </View>
      )}

      {suggestions && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>AI Suggestions</Text>
          <Text style={styles.sectionContent}>{suggestions}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2196f3',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 