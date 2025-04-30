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

const FavoriteRecipesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refrigeratorItems, setRefrigeratorItems] = useState([]);
  const { user } = useAuth();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      console.log('开始加载收藏菜谱');
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('收藏菜谱数据:', data);
      if (data.success) {
        console.log('收藏菜谱列表:', data.data);
        // 检查每个收藏记录的数据结构
        data.data.forEach(fav => {
          console.log('收藏记录详情:', {
            id: fav.id,
            recipeId: fav.recipeData.id,
            name: fav.recipeData.name
          });
        });
        setFavorites(data.data);
      }
    } catch (error) {
      console.error('获取收藏菜谱失败:', error);
      showMessage('错误', '获取收藏菜谱失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRefrigeratorItems = async () => {
    try {
      if (!user?.familyId) return;
      const response = await getFamilyItems(user.familyId);
      if (response && response.items) {
        setRefrigeratorItems(response.items);
      }
    } catch (error) {
      console.error('获取冰箱物品失败:', error);
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
      
      console.log('准备取消收藏:', {
        userId: user.id,
        favoriteId: recipe.id,
        recipeId: recipe.recipeId,
        recipeName: recipe.recipeData.name
      });
      
      if (!recipe || !recipe.id) {
        console.error('收藏记录不完整:', recipe);
        showMessage('错误', '收藏记录不完整');
        return;
      }

      // 使用收藏记录的id
      const response = await fetch(`${API_URL}/favorites/${recipe.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('取消收藏响应:', data);

      if (response.ok) {
        // 从列表中移除该菜谱
        setFavorites(prevFavorites => {
          console.log('当前收藏列表:', prevFavorites);
          const newFavorites = prevFavorites.filter(fav => fav.id !== recipe.id);
          console.log('更新后的收藏列表:', newFavorites);
          return newFavorites;
        });
        showMessage('成功', '已取消收藏');
      } else {
        showMessage('错误', data.message || '取消收藏失败');
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      showMessage('错误', error.message || '操作失败');
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

  const handleRecipePress = (recipe) => {
    const quantities = {};
    recipe.recipeData.ingredients.forEach(ing => {
      const fridgeItem = refrigeratorItems.find(item => item.name === ing.name);
      if (fridgeItem) {
        const requiredAmount = parseInt(ing.quantity) || 1;
        quantities[ing.name] = Math.min(requiredAmount, fridgeItem.quantity);
      }
    });
    setSelectedQuantities(quantities);
    setSelectedRecipe(recipe.recipeData);
    setIsModalVisible(true);
  };

  const handleConfirmConsumption = async () => {
    if (!selectedRecipe) return;
    
    try {
      for (const [name, quantity] of Object.entries(selectedQuantities)) {
        const item = refrigeratorItems.find(i => i.name === name);
        if (item) {
          const newQuantity = item.quantity - quantity;
          await updateItemQuantity(item.id, newQuantity);
        }
      }

      showMessage('成功', '食材使用已确认');
      setIsModalVisible(false);
      setSelectedRecipe(null);
      setSelectedQuantities({});
      loadRefrigeratorItems();
    } catch (error) {
      console.error('确认使用食材时出错:', error);
      showMessage('错误', '确认使用食材失败');
    }
  };

  const renderQuantityPicker = (ingredient) => {
    const fridgeItem = refrigeratorItems.find(item => item.name === ingredient.name);
    if (!fridgeItem) {
      return (
        <Text style={styles.errorText}>
          冰箱没有 {ingredient.name}，无法消耗
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
          (冰箱现有: {fridgeItem.quantity})
        </Text>
      </View>
    );
  };

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
              <Text style={styles.caloriesText}>{item.recipeData.nutrition.calories} 千卡</Text>
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
            <Text style={styles.recipeDetail}>难度: {item.recipeData.difficulty}</Text>
          </View>
          <View style={styles.recipeDetailItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.recipeDetail}>时间: {item.recipeData.cookingTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.sectionTitle}>所需食材:</Text>
        {item.recipeData.ingredients.map((ing, index) => (
          <Text key={`${item.id}-ingredient-${index}`} style={styles.ingredientText}>
            • {ing.name} ({ing.quantity})
          </Text>
        ))}
      </View>

      <View style={styles.nutritionSection}>
        <Text style={styles.sectionTitle}>营养成分:</Text>
        <View style={styles.nutritionGrid}>
          <View key={`${item.id}-protein`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.protein}</Text>
          </View>
          <View key={`${item.id}-carbs`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>碳水</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.carbs}</Text>
          </View>
          <View key={`${item.id}-fat`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>脂肪</Text>
            <Text style={styles.nutritionValue}>{item.recipeData.nutrition.fat}</Text>
          </View>
          <View key={`${item.id}-fiber`} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>膳食纤维</Text>
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
        <Text style={styles.title}>收藏的菜谱</Text>
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
          <Text style={styles.emptyText}>暂无收藏的菜谱</Text>
        </View>
      )}
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
    display: 'none',
  },
  favoriteButton: {
    padding: SPACING.SMALL,
  },
});

export default FavoriteRecipesScreen; 