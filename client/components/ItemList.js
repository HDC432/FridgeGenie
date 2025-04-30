/**
 * ItemList Component
 * Displays a list of items with their expiry dates and allows deletion
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen navigation
 * @param {boolean} props.refresh - Refresh trigger to reload items
 * @returns {JSX.Element} Rendered component
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { getItems, deleteItem } from '../services/databaseService';

const ItemList = ({ navigation, refresh }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadItems();
  }, [refresh]);

  /**
   * Loads items from the database and sorts them by expiry date
   */
  const loadItems = async () => {
    try {
      const resp = await getItems();
      if (resp && resp.items) {
        // Sort by expiry date in ascending order
        const sortedItems = [...resp.items].sort(
          (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
        );
        setItems(sortedItems);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to load items:', err);
      Alert.alert('Error', 'Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles item deletion with platform-specific confirmation dialogs
   * @param {string} id - ID of the item to delete
   */
  const handleDelete = (id) => {
    console.log('Current platform:', Platform.OS);
    console.log('Is Web platform:', Platform.OS === 'web');
    
    if (Platform.OS === 'web') {
      console.log('Using Web confirmation dialog');
      if (window.confirm('Are you sure you want to delete this item?')) {
        console.log('User confirmed deletion');
        deleteItemAndRefresh(id);
      } else {
        console.log('User cancelled deletion');
      }
    } else {
      console.log('Using native Alert dialog');
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteItemAndRefresh(id),
          },
        ]
      );
    }
  };

  /**
   * Deletes an item and refreshes the list
   * @param {string} id - ID of the item to delete
   */
  const deleteItemAndRefresh = async (id) => {
    console.log('Starting item deletion:', id);
    try {
      await deleteItem(id);
      console.log('Deletion successful, reloading list');
      loadItems(); // Reload the list
    } catch (err) {
      console.error('Deletion failed:', err);
      if (Platform.OS === 'web') {
        alert('Deletion failed. Please try again.');
      } else {
        Alert.alert('Error', 'Deletion failed. Please try again.');
      }
    }
  };

  /**
   * Renders a single item in the list
   * @param {Object} param0 - Item data
   * @param {Object} param0.item - The item to render
   * @returns {JSX.Element} Rendered item component
   */
  const renderItem = ({ item }) => {
    const daysLeft = differenceInCalendarDays(
      new Date(item.expiryDate),
      new Date()
    );

    let stripeColor = '#4CAF50'; // Normal
    if (daysLeft <= 1) stripeColor = '#F44336'; // Urgent
    else if (daysLeft <= 3) stripeColor = '#FF9800'; // Attention
    else if (daysLeft <= 7) stripeColor = '#FFEB3B'; // Warning

    return (
      <View style={styles.itemWrapper}>
        <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
        <View style={styles.itemContainer}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              Quantity: {item.quantity} | Expires: {new Date(item.expiryDate).toLocaleDateString()} ({daysLeft} days)
            </Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('Delete button clicked');
                console.log('Current platform:', Platform.OS);
                console.log('Is Web platform:', Platform.OS === 'web');
                handleDelete(item.id);
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (items.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items</Text>
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={() => navigation.navigate('AddItem')}
        >
          <Text style={styles.addFirstButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {lastUpdate && (
        <Text style={styles.lastUpdateText}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
      )}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onRefresh={loadItems}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stripe: {
    width: 5,
    height: '100%',
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2B40',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstButtonText: {
    color: '#1F2B40',
    fontSize: 16,
    fontWeight: '500',
  },
  lastUpdateText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    padding: 8,
  },
});

export default ItemList; 