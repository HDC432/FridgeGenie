import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getFamilyMembers } from '../services/databaseService';
import { getRecommendedItems } from '../services/aiService';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

/**
 * RecommendedItemsScreen Component
 * Displays a list of recommended items to purchase based on family needs and preferences.
 * Allows users to view recommendations and refresh the list.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @returns {JSX.Element} RecommendedItemsScreen component
 */
const RecommendedItemsScreen = ({ navigation }) => {
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  /**
   * Shows a message to the user based on platform
   * @param {string} message - Message to display
   */
  const showMessage = (message) => {
    if (Platform.OS === 'web') {
      // Use alert for web platform
      window.alert(message);
    } else {
      // Use Alert for mobile platform
      Alert.alert('Notice', message);
    }
  };

  /**
   * Loads recommended items for the family
   * @async
   */
  const loadRecommendedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.familyId) {
        showMessage('Please join or create a family first');
        return;
      }

      // Get recommended items
      const items = await getRecommendedItems({
        familyId: user.familyId,
      });
      
      setRecommendedItems(items);
    } catch (error) {
      console.error('Failed to get recommended items:', error);
      setError('Failed to get recommended items, please try again');
      showMessage('Failed to get recommended items, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendedItems();
  }, []);

  /**
   * Handles pull-to-refresh action
   * @async
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendedItems();
    setRefreshing(false);
  };

  /**
   * Renders a recommended item card
   * @param {Object} param0 - Item data
   * @param {Object} param0.item - Item object containing name, reason, quantity and priority
   * @returns {JSX.Element} Item card component
   */
  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.detailText}>Recommended Quantity: {item.recommendedQuantity}</Text>
        <Text style={styles.detailText}>Priority: {item.priority}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Analyzing recommended items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Recommended Items to Purchase</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={recommendedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recommended items available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.CONTAINER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  backButton: {
    marginRight: SPACING.MEDIUM,
  },
  title: {
    ...COMMON_STYLES.HEADER_TITLE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  listContainer: {
    padding: SPACING.LARGE,
  },
  itemCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    ...SHADOW_STYLE.MEDIUM,
  },
  itemHeader: {
    marginBottom: SPACING.SMALL,
  },
  itemName: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.TINY,
  },
  reasonText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  emptyText: {
    fontSize: FONT_SIZE.LARGE,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    backgroundColor: COLORS.DANGER + '20',
    padding: SPACING.MEDIUM,
    margin: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  errorText: {
    color: COLORS.DANGER,
    textAlign: 'center',
  },
});

export default RecommendedItemsScreen; 