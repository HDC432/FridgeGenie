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
import useItems from '../hooks/useItems';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../services/databaseService';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

export default function RecipeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items, updateItemQuantity, handleDelete } = useItems();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [refrigeratorItems, setRefrigeratorItems] = useState([]);

  const generateRecipes = async () => {
    setLoading(true);
    try {
      // 获取所有食材名称和数量
      const ingredients = items.map(item => `${item.name} (${item.quantity})`).join(', ');
      
      // TODO: 这里将调用 OpenAI API 来生成食谱
      // 暂时使用模拟数据
      const mockRecipes = [
        {
          id: '1',
          name: '番茄炒蛋',
          ingredients: [
            { name: '番茄', quantity: '2个' },
            { name: '鸡蛋', quantity: '3个' }
          ],
          instructions: '1. 将番茄切块\n2. 打散鸡蛋\n3. 热油锅先炒蛋\n4. 加入番茄翻炒\n5. 加盐调味即可',
          imageUrl: 'https://example.com/tomato-egg.jpg',
          difficulty: '简单',
          cookingTime: '10分钟',
          nutrition: {
            calories: 280,
            protein: '13g',
            carbs: '8g',
            fat: '22g',
            fiber: '2g'
          }
        },
        {
          id: '2',
          name: '青椒炒肉',
          ingredients: [
            { name: '青椒', quantity: '2个' },
            { name: '猪肉', quantity: '200g' }
          ],
          instructions: '1. 青椒切块\n2. 猪肉切片\n3. 热锅爆炒\n4. 加盐调味',
          imageUrl: 'https://example.com/pepper-pork.jpg',
          difficulty: '简单',
          cookingTime: '15分钟',
          nutrition: {
            calories: 320,
            protein: '25g',
            carbs: '10g',
            fat: '18g',
            fiber: '3g'
          }
        },
        {
          id: '3',
          name: '蔬菜沙拉',
          ingredients: [
            { name: '生菜', quantity: '100g' },
            { name: '黄瓜', quantity: '1个' },
            { name: '西红柿', quantity: '1个' }
          ],
          instructions: '1. 洗净蔬菜\n2. 切块\n3. 混合并加沙拉酱',
          imageUrl: 'https://example.com/salad.jpg',
          difficulty: '简单',
          cookingTime: '5分钟',
          nutrition: {
            calories: 120,
            protein: '3g',
            carbs: '15g',
            fat: '5g',
            fiber: '5g'
          }
        }
      ];

      setRecipes(mockRecipes);
    } catch (error) {
      console.error('生成食谱失败:', error);
      Alert.alert('错误', '生成食谱失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecipes();
    loadRefrigeratorItems();
  }, [items]);

  const loadRefrigeratorItems = async () => {
    try {
      setLoading(true);
      const response = await getItems(); // 获取所有冰箱物品
      if (response && response.items && Array.isArray(response.items)) {
        // 提取物品名称，用于菜谱匹配
        const itemNames = response.items.map(item => item.name.toLowerCase());
        setRefrigeratorItems(itemNames);
      }
    } catch (error) {
      console.error('获取冰箱物品失败:', error);
      Alert.alert('错误', '获取冰箱物品失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe) => {
    const quantities = {};
    recipe.ingredients.forEach(ing => {
      const fridgeItem = items.find(item => item.name === ing.name);
      if (fridgeItem) {
        const requiredAmount = parseInt(ing.quantity) || 1;
        quantities[ing.name] = Math.min(requiredAmount, fridgeItem.quantity);
      }
    });
    setSelectedQuantities(quantities);
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
  };

  const handleConfirmConsumption = async () => {
    if (!selectedRecipe) return;
    
    try {
      for (const [name, quantity] of Object.entries(selectedQuantities)) {
        const item = items.find(i => i.name === name);
        if (item) {
          const newQuantity = item.quantity - quantity;
          await updateItemQuantity(item.id, newQuantity);
        }
      }

      Alert.alert('成功', '食材使用已确认');
      setIsModalVisible(false);
      setSelectedRecipe(null);
      setSelectedQuantities({});
      loadRefrigeratorItems();
    } catch (error) {
      console.error('确认使用食材时出错:', error);
      Alert.alert('错误', '确认使用食材失败');
    }
  };

  const renderQuantityPicker = (ingredient) => {
    const fridgeItem = items.find(item => item.name === ingredient.name);
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
            <Text style={styles.modalTitle}>确认使用食材</Text>
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
            <Text style={styles.summaryTitle}>使用食材汇总：</Text>
            {Object.entries(selectedQuantities).map(([name, quantity]) => (
              <Text key={`${selectedRecipe.id}-summary-${name}`} style={styles.summaryText}>
                • {name}: {quantity}个
              </Text>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
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
              <Text style={styles.confirmButtonText}>确认使用</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            <View style={styles.caloriesBadge}>
              <Ionicons name="flame-outline" size={16} color={COLORS.PRIMARY} />
              <Text style={styles.caloriesText}>{item.nutrition.calories} 千卡</Text>
            </View>
          </View>
          
          <View style={styles.recipeInfo}>
            <View style={styles.recipeDetailItem}>
              <Ionicons name="speedometer-outline" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.recipeDetail}>难度: {item.difficulty}</Text>
            </View>
            <View style={styles.recipeDetailItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.recipeDetail}>时间: {item.cookingTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>所需食材:</Text>
          {item.ingredients.map((ing, index) => (
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
              <Text style={styles.nutritionValue}>{item.nutrition.protein}</Text>
            </View>
            <View key={`${item.id}-carbs`} style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>碳水</Text>
              <Text style={styles.nutritionValue}>{item.nutrition.carbs}</Text>
            </View>
            <View key={`${item.id}-fat`} style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>脂肪</Text>
              <Text style={styles.nutritionValue}>{item.nutrition.fat}</Text>
            </View>
            <View key={`${item.id}-fiber`} style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>膳食纤维</Text>
              <Text style={styles.nutritionValue}>{item.nutrition.fiber}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getFilteredRecipes = () => {
    let filteredRecipes = recipes;

    // 根据搜索关键词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }

    // 根据标签过滤
    if (activeTab === 'matched') {
      // 只显示能够使用冰箱中食材的菜谱
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.ingredients.some(ing =>
          refrigeratorItems.includes(ing.name.toLowerCase())
        )
      );
    }

    return filteredRecipes;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>菜谱推荐</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索菜谱..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[styles.tabText, activeTab === 'all' ? styles.activeTabText : styles.inactiveTabText]}
            >
              全部菜谱
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matched' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('matched')}
          >
            <Text
              style={[styles.tabText, activeTab === 'matched' ? styles.activeTabText : styles.inactiveTabText]}
            >
              冰箱食材可做
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fav' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('fav')}
          >
            <Text
              style={[styles.tabText, activeTab === 'fav' ? styles.activeTabText : styles.inactiveTabText]}
            >
              我的收藏
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : getFilteredRecipes().length > 0 ? (
        <FlatList
          data={getFilteredRecipes()}
          renderItem={renderRecipe}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeTab === 'matched'
              ? '没有找到可以用冰箱食材制作的菜谱'
              : '没有找到匹配的菜谱'}
          </Text>
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.MEDIUM,
  },
  tab: {
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.LARGE,
    marginRight: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUNDED,
  },
  activeTab: {
    backgroundColor: COLORS.PRIMARY,
  },
  inactiveTab: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  tabText: {
    fontSize: FONT_SIZE.SMALL,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  activeTabText: {
    color: COLORS.TEXT_PRIMARY,
  },
  inactiveTabText: {
    color: COLORS.TEXT_SECONDARY,
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
}); 