/**
 * @fileoverview Home screen component that displays a list of food items in the fridge
 * with their quantities and expiry dates. Users can manage items by updating quantities
 * or deleting them.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  Platform,
  StyleSheet,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { getFamilyItems, deleteItem, updateItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

/**
 * HomeScreen Component
 * Main dashboard screen displaying refrigerator contents and quick actions.
 * Shows item categories, expiry alerts, and provides navigation to key features.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @param {Object} props.route - Route object containing navigation parameters
 * @returns {JSX.Element} HomeScreen component
 */
const HomeScreen = ({ navigation, route }) => {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const { user } = useAuth();

  /**
   * Loads refrigerator items and categories
   * @async
   * @function loadRefrigeratorItems
   */
  const loadItems = async () => {
    try {
      console.log('Loading items list...');
      if (!user?.familyId) {
        console.error('User not associated with a family');
        Alert.alert('Error', 'Please join or create a family first');
        return;
      }

      console.log('User family ID:', user.familyId);
      const resp = await getFamilyItems(user.familyId);
      console.log('Retrieved items data:', resp);
      
      if (resp && Array.isArray(resp.items)) {
        const rawItems = resp.items;
        // Filter out items with quantity 0 and sort by expiry date
        const filteredItems = rawItems.filter(item => item.quantity > 0);
        filteredItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        console.log('Sorted items list:', filteredItems);
        setItems(filteredItems);
      } else {
        console.error('Invalid data format:', resp);
        Alert.alert('Error', 'Failed to fetch data, please try again');
      }
    } catch (err) {
      console.error('Failed to load items:', err);
      Alert.alert('Error', 'Failed to load items, please try again');
    }
  };

  useEffect(() => {
    loadItems();
  }, [user?.familyId]);

  // Listen for refresh parameter changes
  useEffect(() => {
    if (route.params?.refresh) {
      loadItems();
    }
  }, [route.params?.refresh]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [user?.familyId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleQuantityUpdate = async () => {
    if (!selectedItem) return;
    
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      if (quantity === 0) {
        // If quantity is 0, delete the item
        await deleteItem(selectedItem.id);
        setItems(prevItems => prevItems.filter(item => item.id !== selectedItem.id));
        setIsQuantityModalVisible(false);
        Alert.alert('Success', 'Item deleted');
      } else {
        // Update item quantity
        const updatedItem = await updateItem(selectedItem.id, {
          ...selectedItem,
          quantity: quantity,
          familyId: user.familyId,
          updatedAt: new Date().toISOString()
        });
        
        setItems(prevItems => 
          prevItems.map(item => item.id === selectedItem.id ? updatedItem : item)
        );
        setIsQuantityModalVisible(false);
        setNewQuantity('');
        Alert.alert('Success', 'Quantity updated');
      }
    } catch (error) {
      console.error('Operation failed:', error);
      Alert.alert('Error', 'Operation failed, please try again');
    }
  };

  const handleDelete = (id) => {
    console.log('Delete button clicked, ID:', id);
    console.log('Current platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this item?')) {
        deleteItemAndRefresh(id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
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

  const deleteItemAndRefresh = async (id) => {
    try {
      console.log('Starting item deletion, ID:', id);
      await deleteItem(id);
      console.log('Deletion successful, updating list');
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      if (Platform.OS === 'web') {
        alert('Item deleted');
      } else {
        Alert.alert('Success', 'Item deleted');
      }
    } catch (err) {
      console.error('Deletion failed:', err);
      if (Platform.OS === 'web') {
        alert('Deletion failed, please try again');
      } else {
        Alert.alert('Error', 'Deletion failed, please try again');
      }
    }
  };

  const handleEditQuantity = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toString());
    setIsQuantityModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const expiry = new Date(item.expiryDate);
    if (isNaN(expiry.getTime())) {
      return null;
    }
    const daysLeft = differenceInCalendarDays(expiry, new Date());

    let stripeColor = COLORS.SUCCESS; 
    if (daysLeft <= 1)      stripeColor = COLORS.DANGER; 
    else if (daysLeft <= 3) stripeColor = COLORS.ALERT; 
    else if (daysLeft <= 7) stripeColor = COLORS.WARNING;

    return (
      <View style={styles.itemWrapper}>
        <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
        <View style={styles.itemContainer}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              Qty: {item.quantity} | Exp: {expiry.toLocaleDateString()} ({daysLeft}d)
            </Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditQuantity(item)}
            >
              <Ionicons name="pencil-outline" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.DANGER} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderQuantityModal = () => (
    <Modal
      visible={isQuantityModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsQuantityModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Quantity</Text>
            <TouchableOpacity
              onPress={() => setIsQuantityModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalItemName}>{selectedItem?.name}</Text>
          
          <View style={styles.quantityInputContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <TextInput
              style={styles.quantityInput}
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="number-pad"
              placeholder="Please enter quantity"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsQuantityModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleQuantityUpdate}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              <Text style={styles.greeting}>Hi, </Text>
              <Text style={styles.username}>{user?.username}</Text>
            </Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.ALERT} />
            <Text style={styles.statNumber}>
              {items.filter(item => {
                const daysLeft = differenceInCalendarDays(new Date(item.expiryDate), new Date());
                return daysLeft <= 3;
              }).length}
            </Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={COLORS.SUCCESS} />
            <Text style={styles.statNumber}>
              {items.filter(item => {
                const daysLeft = differenceInCalendarDays(new Date(item.expiryDate), new Date());
                return daysLeft > 7;
              }).length}
            </Text>
            <Text style={styles.statLabel}>Good Condition</Text>
          </View>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cube-outline" size={120} color={COLORS.TEXT_SECONDARY} />
          </View>
          <Text style={styles.emptyText}>Fridge is empty</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Text style={styles.addFirstButtonText}>Add First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      {renderQuantityModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    ...SHADOW_STYLE.SMALL,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZE.XXLARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: FONT_WEIGHT.BOLD,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  username: {
    fontSize: FONT_SIZE.XXLARGE,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: FONT_WEIGHT.BOLD,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    minWidth: 100,
    ...SHADOW_STYLE.TINY,
  },
  statNumber: {
    fontSize: FONT_SIZE.XLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginVertical: SPACING.TINY,
  },
  statLabel: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  emptyIconContainer: {
    marginBottom: SPACING.LARGE,
    padding: SPACING.XLARGE,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.XLARGE,
    ...SHADOW_STYLE.MEDIUM,
  },
  emptyText: {
    fontSize: FONT_SIZE.LARGE,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LARGE,
  },
  addFirstButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.XLARGE,
    borderRadius: BORDER_RADIUS.LARGE,
    ...SHADOW_STYLE.MEDIUM,
  },
  addFirstButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  listContainer: {
    padding: SPACING.LARGE,
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    overflow: 'hidden',
    ...SHADOW_STYLE.MEDIUM,
  },
  stripe: {
    width: 5,
    height: '100%',
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.SMALL,
  },
  itemName: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.TINY,
  },
  itemDetails: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  itemActions: {
    flexDirection: 'row',
    gap: SPACING.SMALL,
  },
  actionButton: {
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    ...SHADOW_STYLE.SMALL,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    width: '80%',
    maxWidth: 400,
    ...SHADOW_STYLE.LARGE,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  modalTitle: {
    fontSize: FONT_SIZE.XLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: SPACING.TINY,
  },
  modalItemName: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  quantityInputContainer: {
    marginBottom: SPACING.LARGE,
  },
  quantityLabel: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  quantityInput: {
    ...COMMON_STYLES.INPUT,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LARGE,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
    marginHorizontal: SPACING.SMALL,
  },
  cancelButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
  confirmButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
});

export default HomeScreen;
