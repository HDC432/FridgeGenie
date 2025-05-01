/**
 * @fileoverview ItemDetailsScreen component for displaying and managing food item details
 * @module ItemDetailsScreen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { updateItem, deleteItem } from '../services/databaseService';
import { getFoodSuggestions, generateExpiryReminder } from '../services/aiService';
import axios from 'axios';

const AZURE_AI_ENDPOINT = 'YOUR_AZURE_AI_ENDPOINT';
const AZURE_AI_KEY = 'YOUR_AZURE_AI_KEY';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Utility function to create a delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the specified delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ItemDetailsScreen component displays detailed information about a food item
 * @param {Object} props - Component props
 * @param {Object} props.route - Navigation route object containing item data
 * @param {Object} props.navigation - Navigation object for screen navigation
 * @returns {JSX.Element} Rendered component
 */

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

  /**
   * Loads AI-generated food suggestions for the current item
   * @async
   */

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await getFoodSuggestions([item.name]);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Loads AI-generated expiry reminder for the current item
   * @async
   */
  const loadReminder = async () => {
    try {
      const reminder = await generateExpiryReminder(item);
      setReminder(reminder);
    } catch (error) {
      console.error('Error generating reminder:', error);
    }
  };

  /**
   * Handles the deletion of the current item
   * @async
   */
  const handleDelete = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  /**
   * Determines the expiry status of the item
   * @returns {Object} Object containing status text and color
   */
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

  /**
   * Renders item image section
   * @returns {JSX.Element} Item image component
   */

  /**
   * Renders item details section
   * @returns {JSX.Element} Item details component
   */

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