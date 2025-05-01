import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/constants';
import authService from '../services/authService';
import { getFamilyItems, updateItemQuantity } from '../services/databaseService';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

/**
 * FavoriteRecipesScreen Component
 * Displays a list of user's favorite recipes and allows management of favorites.
 * Provides functionality to view recipe details, remove favorites, and track ingredient consumption.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @returns {JSX.Element} FavoriteRecipesScreen component
 */

const FavoriteRecipesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refrigeratorItems, setRefrigeratorItems] = useState([]);
  const [localQuantities, setLocalQuantities] = useState({});
  const { user } = useAuth();

  /**
   * Loads user's favorite recipes from the server
   * @async
   * @function loadFavoriteRecipes
   */

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      console.log('Starting to load favorite recipes');
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Favorite recipes data:', data);
      if (data.success) {
        console.log('Favorite recipes list:', data.data);
        // Check each favorite record's data structure
        data.data.forEach(fav => {
          console.log('Favorite record details:', {
            id: fav.id,
            recipeId: fav.recipeData.id,
            name: fav.recipeData.name
          });
        });
        setFavorites(data.data);
      }
    } catch (error) {
      console.error('Failed to get favorite recipes:', error);
      showMessage('Error', 'Failed to get favorite recipes');
    } finally {
      setLoading(false);
    }
  };

  const loadRefrigeratorItems = async () => {
    try {
      if (!user?.familyId) {
        console.log('User not logged in or no family ID');
        return;
      }
      console.log('Starting to load refrigerator items, family ID:', user.familyId);
      const response = await getFamilyItems(user.familyId);
      console.log('Refrigerator items response:', response);
      if (response && response.items) {
        console.log('Successfully loaded refrigerator items:', response.items);
        setRefrigeratorItems(response.items);
      } else {
        console.log('No refrigerator items found');
      }
    } catch (error) {
      console.error('Failed to get refrigerator items:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
    loadRefrigeratorItems();
  }, [user?.familyId]);

  const toggleFavorite = async (recipe) => {
    if (!user) {
      showMessage('提示', '请先登录');
      return;
    }

    try {
      setLoading(true);
      const token = await authService.getToken();
      
      console.log('Preparing to remove from favorites:', {
        userId: user.id,
        favoriteId: recipe.id,
        recipeId: recipe.recipeData.id,
        recipeName: recipe.recipeData.name
      });
      
      if (!recipe || !recipe.id) {
        console.error('Incomplete favorite record:', recipe);
        showMessage('Error', 'Incomplete favorite record');
        return;
      }

      // Use the favorite record's id
      const response = await fetch(`${API_URL}/favorites/${recipe.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Remove from favorites response:', data);

      if (response.ok) {
        // Remove from list
        setFavorites(prevFavorites => {
          console.log('Current favorites list:', prevFavorites);
          const newFavorites = prevFavorites.filter(fav => fav.id !== recipe.id);
          console.log('Updated favorites list:', newFavorites);
          return newFavorites;
        });
        showMessage('Success', 'Removed from favorites');
      } else {
        showMessage('Error', data.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      showMessage('Error', error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  /**
   * Handles recipe selection and opens confirmation modal
   * @param {Object} recipe - Selected recipe object
   * @param {string} recipe.id - Recipe unique identifier
   * @param {string} recipe.name - Recipe name
   * @param {Array<Object>} recipe.ingredients - List of ingredients required
   * @param {Object} recipe.nutrition - Nutritional information
   */

  const handleRecipePress = (recipe) => {
    console.log('Clicked recipe:', recipe);
    console.log('Recipe data:', recipe.recipeData);
    console.log('Ingredients list:', recipe.recipeData.ingredients);
    console.log('Refrigerator items:', refrigeratorItems);

    const quantities = {};
    recipe.recipeData.ingredients.forEach(ing => {
      // Improve ingredient name matching logic
      const normalizedIngredientName = ing.name.toLowerCase().trim();
      const fridgeItem = refrigeratorItems.find(item => 
        item.name.toLowerCase().trim() === normalizedIngredientName ||
        // Handle English name cases
        (ing.name.toLowerCase().includes('walnut') && item.name.toLowerCase().includes('walnut')) ||
        (ing.name.toLowerCase().includes('apple') && item.name.toLowerCase().includes('apple'))
      );
      
      console.log('Finding ingredient:', {
        name: ing.name,
        normalizedName: normalizedIngredientName,
        required: ing.quantity,
        found: fridgeItem ? true : false,
        available: fridgeItem ? fridgeItem.quantity : 0
      });
      
      if (fridgeItem) {
        // Unify ingredient quantity handling
        let requiredAmount = 1;
        if (typeof ing.quantity === 'number') {
          requiredAmount = ing.quantity;
        } else if (typeof ing.quantity === 'string') {
          // Try extracting numbers from string, support more formats
          const match = ing.quantity.match(/\d+(\.\d+)?/);
          requiredAmount = match ? parseFloat(match[0]) : 1;
        }
        
        // Ensure quantity is valid positive number
        requiredAmount = Math.max(1, Math.floor(requiredAmount));
        quantities[ing.name] = Math.min(requiredAmount, fridgeItem.quantity);
      }
    });
    
    console.log('Calculated quantities:', quantities);
    setSelectedQuantities(quantities);
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
  };

  const updateLocalQuantity = (itemId, newQuantity) => {
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  /**
   * Confirms ingredient consumption and updates quantities
   * @async
   * @function handleConfirmConsumption
   */

  const handleConfirmConsumption = async () => {
    if (!selectedRecipe) {
      console.log('No recipe selected');
      return;
    }
    
    try {
      console.log('Starting to confirm ingredient usage:', {
        selectedQuantities,
        refrigeratorItems
      });

      for (const [name, quantity] of Object.entries(selectedQuantities)) {
        const normalizedName = name.toLowerCase().trim();
        const item = refrigeratorItems.find(i => 
          i.name.toLowerCase().trim() === normalizedName
        );

        if (item) {
          const newQuantity = Math.max(0, item.quantity - quantity);
          console.log('Updating ingredient quantity:', {
            itemId: item.id,
            oldQuantity: item.quantity,
            newQuantity,
            deducted: quantity
          });

          const updatedItem = await updateItemQuantity(item.id, newQuantity);
          console.log('Update result:', updatedItem);

          if (updatedItem === null) {
            console.log('Item has been deleted, removing from local state:', item.id);
            setRefrigeratorItems(prevItems => 
              prevItems.filter(i => i.id !== item.id)
            );
          } else {
            // Update local state
            setRefrigeratorItems(prevItems =>
              prevItems.map(i =>
                i.id === item.id ? { ...i, quantity: newQuantity } : i
              )
            );
          }
        }
      }

      showMessage('Success', 'Ingredient usage confirmed');
      setIsModalVisible(false);
      setSelectedRecipe(null);
      setSelectedQuantities({});
    } catch (error) {
      console.error('Error confirming ingredient usage:', error);
      showMessage('Error', 'Failed to confirm ingredient usage: ' + error.message);
    }
  };

  /**
   * Renders quantity picker for ingredient selection
   * @param {Object} ingredient - Ingredient object
   * @param {string} ingredient.name - Ingredient name
   * @param {number|string} ingredient.quantity - Required quantity
   * @returns {JSX.Element} Quantity picker component
   */

  const renderQuantityPicker = (ingredient) => {
    const normalizedIngredientName = ingredient.name.toLowerCase().trim();
    const fridgeItem = refrigeratorItems.find(item => 
      item.name.toLowerCase().trim() === normalizedIngredientName
    );
    
    if (!fridgeItem) {
      return (
        <Text style={styles.errorText}>
          {ingredient.name} not found in refrigerator, cannot consume
        </Text>
      );
    }

    const maxQuantity = fridgeItem.quantity;
    const currentQuantity = selectedQuantities[ingredient.name] || 0;

    return (
      <View style={styles.pickerContainer} key={ingredient.name}>
        <Text style={styles.pickerLabel}>{ingredient.name}</Text>
        <View style={styles.quantityControlContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, currentQuantity <= 0 && styles.quantityButtonDisabled]}
            onPress={() => {
              if (currentQuantity > 0) {
                setSelectedQuantities(prev => ({
                  ...prev,
                  [ingredient.name]: currentQuantity - 1
                }));
              }
            }}
            disabled={currentQuantity <= 0}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{currentQuantity}</Text>
          
          <TouchableOpacity 
            style={[styles.quantityButton, currentQuantity >= maxQuantity && styles.quantityButtonDisabled]}
            onPress={() => {
              if (currentQuantity < maxQuantity) {
                setSelectedQuantities(prev => ({
                  ...prev,
                  [ingredient.name]: currentQuantity + 1
                }));
              }
            }}
            disabled={currentQuantity >= maxQuantity}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.availableText}>
          (Refrigerator available: {maxQuantity})
        </Text>
      </View>
    );
  };

  /**
   * Renders confirmation modal for ingredient usage
   * @returns {JSX.Element} Modal component
   */

  const renderConfirmationModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Ingredient Usage</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalRecipeName}>{selectedRecipe?.recipeData.name}</Text>
          
          <ScrollView style={styles.ingredientsList}>
            {selectedRecipe?.recipeData.ingredients.map((ing, index) => (
              <View key={`${selectedRecipe.recipeData.id}-ingredient-${index}`}>
                {renderQuantityPicker(ing)}
              </View>
            ))}
          </ScrollView>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ingredient Usage Summary:</Text>
            {Object.entries(selectedQuantities).map(([name, quantity]) => (
              <Text key={`${selectedRecipe.recipeData.id}-summary-${name}`} style={styles.summaryText}>
                • {name}: {quantity} units
              </Text>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                Object.keys(selectedQuantities).length === 0 && styles.disabledButton
              ]}
              onPress={handleConfirmConsumption}
              disabled={Object.keys(selectedQuantities).length === 0}
            >
              <Text style={styles.confirmButtonText}>Confirm Usage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /**
   * Renders individual recipe card
   * @param {Object} param0 - Render item parameters
   * @param {Object} param0.item - Recipe item to render
   * @returns {JSX.Element} Recipe card component
   */

  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.recipeHeader}>
        <View style={styles.recipeTitleRow}>
          <Text style={styles.recipeName}>{item.recipeData.name}</Text>
          <View style={styles.recipeActions}>
            <View style={styles.caloriesBadge}>
              <Ionicons name="flame-outline" size={16} color={COLORS.PRIMARY} />
              <Text style={styles.caloriesText}>{item.recipeData.nutrition.calories} kcal</Text>
            </View>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item);
              }}
            >
              <Ionicons 
                name="heart" 
                size={24} 
                color={COLORS.DANGER} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.recipeInfo}>
          <View style={styles.recipeDetailItem}>
            <Ionicons name="speedometer-outline" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.recipeDetail}>Difficulty: {item.recipeData.difficulty}</Text>
          </View>
          <View style={styles.recipeDetailItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.recipeDetail}>Time: {item.recipeData.cookingTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.sectionTitle}>Required Ingredients:</Text>
        {item.recipeData.ingredients.map((ing, index) => (
          <Text key={`${item.id}-ingredient-${index}`} style={styles.ingredientText}>
            • {ing.name} ({ing.quantity})
          </Text>
        ))}
      </View>

      <View style={styles.nutritionSection}>
        <Text style={styles.sectionTitle}>Nutrition Information:</Text>
        <View style={styles.nutritionGrid}>
          <View key={`${item.id}-protein`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Protein</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.protein}</Text>
          </View>
          <View key={`${item.id}-carbs`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Carbs</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.carbs}</Text>
          </View>
          <View key={`${item.id}-fat`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Fat</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.fat}</Text>
          </View>
          <View key={`${item.id}-fiber`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Fiber</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.fiber}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorite Recipes</Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite recipes yet</Text>
        </View>
      )}

      {renderConfirmationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.CONTAINER,
  },
  header: {
    padding: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  title: {
    fontSize: FONT_SIZE.XXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  searchContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: SPACING.SMALL,
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeList: {
    padding: SPACING.LARGE,
  },
  recipeCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    ...SHADOW_STYLE.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.1)',
  },
  recipeHeader: {
    marginBottom: SPACING.MEDIUM,
  },
  recipeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  recipeName: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUNDED,
  },
  caloriesText: {
    fontSize: FONT_SIZE.TINY,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 4,
  },
  recipeInfo: {
    flexDirection: 'row',
  },
  recipeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  recipeDetail: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.TINY,
  },
  ingredientsSection: {
    marginBottom: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  ingredientText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    paddingLeft: SPACING.SMALL,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 193, 7, 0.3)',
  },
  nutritionSection: {
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.SMALL,
    backgroundColor: 'rgba(245, 247, 250, 0.5)',
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
  },
  nutritionItem: {
    width: '50%',
    marginBottom: SPACING.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
  },
  nutritionLabel: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.PRIMARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  emptyText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
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
    width: '90%',
    maxWidth: 500,
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
  modalRecipeName: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  ingredientsList: {
    maxHeight: 300,
  },
  pickerContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  pickerLabel: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.TINY,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.CIRCLE,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_STYLE.SMALL,
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  quantityButtonText: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  quantityText: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginHorizontal: SPACING.MEDIUM,
    minWidth: 30,
    textAlign: 'center',
  },
  availableText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    color: COLORS.DANGER,
    fontSize: FONT_SIZE.SMALL,
    marginBottom: SPACING.SMALL,
  },
  summaryContainer: {
    marginTop: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  summaryText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LARGE,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.ROUNDED,
    alignItems: 'center',
    marginHorizontal: SPACING.SMALL,
  },
  cancelButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  confirmButtonText: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  favoriteButton: {
    padding: SPACING.SMALL,
  },
});

export default FavoriteRecipesScreen; 