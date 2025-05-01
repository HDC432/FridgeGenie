import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFamilyItems, updateItemQuantity } from '../services/databaseService';
import { generateRecipes } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { API_URL } from '../config/constants';
import authService from '../services/authService';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

const DEFAULT_RECIPES = [];

/**
 * RecipeScreen Component
 * Displays a list of recipes generated based on available ingredients in the refrigerator.
 * Allows users to view recipe details, manage favorites, and track ingredient consumption.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @returns {JSX.Element} RecipeScreen component
 */
export default function RecipeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refrigeratorItems, setRefrigeratorItems] = useState([]);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [favoriteStatus, setFavoriteStatus] = useState({});

  /**
   * Loads refrigerator items and generates recipes based on available ingredients
   * @async
   * @function loadRefrigeratorItems
   */
  const loadRefrigeratorItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.familyId) {
        // No default recipes, show empty list
        console.log('User not logged in or no family ID, no recipes to display');
        setRecipes([]);
        setLoading(false);
        return;
      }

      const response = await getFamilyItems(user.familyId);
      if (response && response.items && Array.isArray(response.items)) {
        const items = response.items;
        setRefrigeratorItems(items);
        
        try {
          // Extract ingredient names for recipe generation
          const ingredients = items.map(item => item.name);
          
          if (ingredients.length === 0) {
            console.log('No ingredients in refrigerator, no recipes to display');
            setRecipes([]);
          } else {
            console.log('Starting recipe generation based on ingredients:', ingredients);
            const generatedRecipes = await generateRecipes(ingredients, user.familyId);
            
            if (Array.isArray(generatedRecipes) && generatedRecipes.length > 0) {
              console.log('Successfully generated recipes:', generatedRecipes.length);
              setRecipes(generatedRecipes);
            } else {
              console.log('Generated recipes empty, no recipes to display');
              setRecipes([]);
            }
          }
        } catch (recipeError) {
          console.error('Recipe generation error:', recipeError);
          setError('Unable to generate recipes, please check your network connection or try again later');
          setRecipes([]);
        }
      } else {
        console.log('No refrigerator items found or incorrect format, no recipes to display');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Failed to get refrigerator items:', error);
      setError('Failed to get items, please check your network connection or try again later');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefrigeratorItems();
  }, [user?.familyId]);

  /**
   * Handles recipe selection and opens confirmation modal
   * @param {Object} recipe - Selected recipe object
   * @param {string} recipe.id - Recipe unique identifier
   * @param {string} recipe.name - Recipe name
   * @param {Array<Object>} recipe.ingredients - List of ingredients required
   * @param {Object} recipe.nutrition - Nutritional information
   */
  const handleRecipePress = (recipe) => {
    console.log('Recipe clicked:', recipe);
    console.log('Ingredients list:', recipe.ingredients);
    console.log('Refrigerator items:', refrigeratorItems);

    const quantities = {};
    recipe.ingredients.forEach(ing => {
      const normalizedIngredientName = ing.name.toLowerCase().trim();
      const fridgeItem = refrigeratorItems.find(item => 
        item.name.toLowerCase().trim() === normalizedIngredientName
      );
      
      console.log('Looking for ingredient:', {
        name: ing.name,
        normalizedName: normalizedIngredientName,
        required: ing.quantity,
        found: fridgeItem ? true : false,
        available: fridgeItem ? fridgeItem.quantity : 0
      });
      
      if (fridgeItem) {
        // Standardize ingredient quantity handling
        let requiredAmount = 1;
        if (typeof ing.quantity === 'number') {
          requiredAmount = ing.quantity;
        } else if (typeof ing.quantity === 'string') {
          // Try to extract number from string, support more formats
          const match = ing.quantity.match(/\d+(\.\d+)?/);
          requiredAmount = match ? parseFloat(match[0]) : 1;
        }
        
        // Ensure quantity is a valid positive number
        requiredAmount = Math.max(1, Math.floor(requiredAmount));
        quantities[ing.name] = Math.min(requiredAmount, fridgeItem.quantity);
      }
    });
    
    console.log('Calculated quantities:', quantities);
    setSelectedQuantities(quantities);
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
  };

  /**
   * Confirms ingredient consumption and updates quantities
   * @async
   * @function handleConfirmConsumption
   */
  const handleConfirmConsumption = async () => {
    if (!selectedRecipe) return;
    
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
            deducted: quantity,
            name: item.name
          });

          const updatedItem = await updateItemQuantity(item.id, newQuantity);
          console.log('Update result:', updatedItem);

          if (updatedItem === null) {
            console.log('Item has been deleted, removing from local state:', item.id);
            setRefrigeratorItems(prevItems => 
              prevItems.filter(i => i.id !== item.id)
            );
          } else {
            // Update local state immediately
            setRefrigeratorItems(prevItems =>
              prevItems.map(i =>
                i.id === item.id ? { ...i, quantity: newQuantity } : i
              )
            );
          }
        } else {
          console.log('Item not found in refrigerator:', name);
        }
      }

      Alert.alert('Success', 'Ingredient usage confirmed');
      setIsModalVisible(false);
      setSelectedRecipe(null);
      setSelectedQuantities({});
    } catch (error) {
      console.error('Error confirming ingredient usage:', error);
      Alert.alert('Error', 'Failed to confirm ingredient usage');
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
    console.log('Rendering ingredient picker:', {
      ingredient,
      refrigeratorItems
    });
    
    const normalizedIngredientName = ingredient.name.toLowerCase().trim();
    const fridgeItem = refrigeratorItems.find(item => 
      item.name.toLowerCase().trim() === normalizedIngredientName
    );
    
    console.log('Found refrigerator item:', fridgeItem);
    
    if (!fridgeItem) {
      return (
        <Text style={styles.errorText}>
          {ingredient.name} not found in refrigerator, cannot consume
        </Text>
      );
    }

    const maxQuantity = fridgeItem.quantity;
    const currentQuantity = selectedQuantities[ingredient.name] || 0;
    
    console.log('Ingredient quantities:', {
      name: ingredient.name,
      max: maxQuantity,
      current: currentQuantity
    });

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
          (Available in refrigerator: {fridgeItem.quantity})
        </Text>
      </View>
    );
  };

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

          <Text style={styles.modalRecipeName}>{selectedRecipe?.name}</Text>
          
          <ScrollView style={styles.ingredientsList}>
            {selectedRecipe?.ingredients.map((ing, index) => (
              <View key={`${selectedRecipe.id}-ingredient-${index}`}>
                {renderQuantityPicker(ing)}
              </View>
            ))}
          </ScrollView>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ingredient Usage Summary:</Text>
            {Object.entries(selectedQuantities).map(([name, quantity]) => (
              <Text key={`${selectedRecipe.id}-summary-${name}`} style={styles.summaryText}>
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
  const renderRecipe = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.recipeHeader}>
          <View style={styles.recipeTitleRow}>
            <Text style={styles.recipeName}>{item.name}</Text>
            <View style={styles.recipeActions}>
              <View style={styles.caloriesBadge}>
                <Ionicons name="flame-outline" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.caloriesText}>{item.nutrition.calories} kcal</Text>
              </View>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item);
                }}
              >
                <Ionicons 
                  name={favoriteStatus[item.id || item.name] ? "heart" : "heart-outline"} 
                  size={24} 
                  color={favoriteStatus[item.id || item.name] ? COLORS.DANGER : COLORS.TEXT_SECONDARY} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.recipeInfo}>
            <View style={styles.recipeDetailItem}>
              <Ionicons name="speedometer-outline" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.recipeDetail}>Difficulty: {item.difficulty}</Text>
            </View>
            <View style={styles.recipeDetailItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.recipeDetail}>Time: {item.cookingTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Required Ingredients:</Text>
          {item.ingredients.map((ing, index) => (
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
              <Text style={styles.nutritionValue}>{item.nutrition.protein}</Text>
            </View>
            <View key={`${item.id}-carbs`} style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>{item.nutrition.carbs}</Text>
            </View>
            <View key={`${item.id}-fat`} style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>{item.nutrition.fat}</Text>
            </View>
            <View key={`${item.id}-fiber`} style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fiber</Text>
              <Text style={styles.nutritionValue}>{item.nutrition.fiber}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Filters recipes based on search query
   * @returns {Array<Object>} Filtered list of recipes
   */
  const getFilteredRecipes = () => {
    let filteredRecipes = recipes || [];


    if (!filteredRecipes || filteredRecipes.length === 0) {
      return [];
    }


    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }

    return filteredRecipes;
  };

  /**
   * Toggles favorite status for a recipe
   * @async
   * @param {Object} recipe - Recipe object to toggle favorite status
   * @param {string} recipe.id - Recipe unique identifier
   * @param {string} recipe.name - Recipe name
   */
  const toggleFavorite = async (recipe) => {
    if (!user) {
      showMessage('Notice', 'Please login first');
      return;
    }

    try {
      setLoading(true);
      const token = await authService.getToken();
      const recipeId = recipe.id || recipe.name;
      const isCurrentlyFavorite = favoriteStatus[recipeId];

      if (isCurrentlyFavorite) {
        // Remove from favorites
        console.log('Starting to remove from favorites:', recipeId);
        // First get favorite record
        const checkResponse = await fetch(`${API_URL}/favorites/${recipeId}/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const checkData = await checkResponse.json();
        console.log('Check favorite status response:', checkData);

        if (checkData.success && checkData.data.favoriteId) {
          // Use favorite record id to remove from favorites
          const response = await fetch(`${API_URL}/favorites/${checkData.data.favoriteId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log('Remove from favorites response:', data);
          if (response.ok) {
            setFavoriteStatus(prev => ({
              ...prev,
              [recipeId]: false
            }));
            showMessage('Success', 'Removed from favorites');
          } else {
            showMessage('Error', data.message || 'Failed to remove from favorites');
          }
        } else {
          showMessage('Error', 'Favorite record not found');
        }
      } else {
        // Add to favorites
        console.log('Starting to add to favorites:', recipeId);
        const recipeData = {
          id: recipeId,
          name: recipe.name,
          difficulty: recipe.difficulty,
          cookingTime: recipe.cookingTime,
          nutrition: recipe.nutrition,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          suitableFor: recipe.suitableFor || [],
          healthConsiderations: recipe.healthConsiderations || []
        };
        console.log('Recipe data for favorites:', recipeData);

        const response = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipeId: recipeId,
            recipeData: recipeData
          })
        });
        const data = await response.json();
        console.log('Add to favorites response:', data);
        if (response.ok) {
          setFavoriteStatus(prev => ({
            ...prev,
            [recipeId]: true
          }));
          showMessage('Success', 'Recipe added to favorites');
        } else {
          showMessage('Error', data.message || 'Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Favorite operation failed:', error);
      showMessage('Error', error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checks if a recipe is favorited
   * @async
   * @param {string} recipeId - ID of the recipe to check
   */
  const checkFavorite = async (recipeId) => {
    try {
      // If recipeId is undefined, use name as id
      if (!recipeId) {
        console.log('recipeId is empty, skipping check');
        return;
      }
      console.log('Starting to check favorite status:', recipeId);
      const token = await authService.getToken();
      const response = await fetch(`${API_URL}/favorites/${recipeId}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Check favorite status response:', data);
      if (data.success) {
        setFavoriteStatus(prev => ({
          ...prev,
          [recipeId]: data.data.isFavorite
        }));
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  /**
   * Shows a message to the user
   * @param {string} title - Message title
   * @param {string} message - Message content
   */
  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  /**
   * Effect hook to check favorite status when a recipe is selected
   */
  useEffect(() => {
    if (selectedRecipe && user) {
      const recipeId = selectedRecipe.id || selectedRecipe.name;
      console.log('Checking favorite status for selected recipe:', recipeId);
      checkFavorite(recipeId);
    }
  }, [selectedRecipe, user]);

  /**
   * Effect hook to check favorite status for all recipes when loaded
   */
  useEffect(() => {
    if (recipes.length > 0 && user) {
      console.log('Checking favorite status for all recipes');
      recipes.forEach(recipe => {
        const recipeId = recipe.id || recipe.name;
        if (recipeId) {
          checkFavorite(recipeId);
        }
      });
    }
  }, [recipes, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Recommendations</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : getFilteredRecipes().length > 0 ? (
        <FlatList
          data={getFilteredRecipes()}
          renderItem={renderRecipe}
          keyExtractor={(item, index) => item.id || `recipe-${index}`}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please add ingredients to your refrigerator to generate recipe recommendations
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadRefrigeratorItems}
          >
            <Text style={styles.refreshButtonText}>Refresh Recipes</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderConfirmationModal()}
    </View>
  );
}

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
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  errorText: {
    color: COLORS.DANGER,
    fontSize: FONT_SIZE.SMALL,
    textAlign: 'center',
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
  recipeImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.MEDIUM,
    overflow: 'hidden',
    marginBottom: SPACING.MEDIUM,
    ...SHADOW_STYLE.SMALL,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  refreshButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginTop: SPACING.LARGE,
  },
  refreshButtonText: {
    color: COLORS.SECONDARY,
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.MEDIUM,
  },
  suitableForContainer: {
    marginTop: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  suitableForTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  suitableForTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  suitableForTag: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUNDED,
  },
  suitableForTagText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  healthConsiderationsContainer: {
    marginTop: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  healthConsiderationsTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  healthConsiderationsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  healthConsiderationTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingVertical: SPACING.TINY,
    paddingHorizontal: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUNDED,
  },
  healthConsiderationTagText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  tabsContainer: {
    display: 'none', // 隐藏标签容器
  },
  favoriteButton: {
    padding: SPACING.SMALL,
  },
}); 