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
import { Picker } from '@react-native-picker/picker';
import { getItems } from '../services/databaseService';

export default function RecipeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { items, updateItemQuantity, handleDelete } = useItems();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState({});
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
      const response = await getItems(1, 1000); // 获取所有冰箱物品
      if (response && response.items) {
        // 提取物品名称，用于菜谱匹配
        const items = response.items.map(item => item.name.toLowerCase());
        setRefrigeratorItems(items);
      }
    } catch (error) {
      console.error('获取冰箱物品失败:', error);
      Alert.alert('错误', '获取冰箱物品失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe) => {
    // 初始化每个食材的选择数量
    const quantities = {};
    recipe.ingredients.forEach(ing => {
      // 找到冰箱中对应的食材
      const fridgeItem = items.find(item => item.name === ing.name);
      if (fridgeItem) {
        // 默认选择配方要求的数量，但不超过冰箱现有数量
        const requiredAmount = parseInt(ing.quantity) || 1;
        quantities[ing.name] = Math.min(requiredAmount, fridgeItem.quantity);
      }
    });
    setSelectedQuantities(quantities);
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
  };

  const handleConfirmConsumption = async () => {
    try {
      // 更新每个食材的数量
      for (const [itemName, consumeQuantity] of Object.entries(selectedQuantities)) {
        const fridgeItem = items.find(item => item.name === itemName);
        if (fridgeItem) {
          const newQuantity = fridgeItem.quantity - consumeQuantity;
          await updateItemQuantity(fridgeItem.id, newQuantity);
        }
      }
      if (Platform.OS === 'web') {
        window.alert('食材已更新');
      } else {
        Alert.alert('成功', '食材已更新');
      }
      setIsModalVisible(false);
      setSelectedRecipe(null);
    } catch (error) {
      console.error('更新食材数量失败:', error);
      Alert.alert('错误', '更新食材数量失败');
    }
  };

  const renderQuantityPicker = (ingredient) => {
    const fridgeItem = items.find(item => item.name === ingredient.name);
    if (!fridgeItem) {
      return (
        <Text style={{ color: 'red', marginBottom: 8 }}>
          冰箱没有 {ingredient.name}，无法消耗
        </Text>
      );
    }

    const maxQuantity = fridgeItem.quantity;
    const quantities = Array.from({ length: maxQuantity + 1 }, (_, i) => i);
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
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalRecipeName}>{selectedRecipe?.name}</Text>
          
          <ScrollView style={styles.ingredientsList}>
            {selectedRecipe?.ingredients.map(ing => renderQuantityPicker(ing))}
          </ScrollView>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>使用食材汇总：</Text>
            {Object.entries(selectedQuantities).map(([name, quantity]) => (
              <Text key={name} style={styles.summaryText}>
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

  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
    >
      <View style={styles.recipeHeader}>
        <View style={styles.recipeTitleRow}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <View style={styles.caloriesBadge}>
            <Ionicons name="flame" size={16} color="#FF6B6B" />
            <Text style={styles.caloriesText}>{item.nutrition.calories} 千卡</Text>
          </View>
        </View>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeDetail}>难度: {item.difficulty}</Text>
          <Text style={styles.recipeDetail}>时间: {item.cookingTime}</Text>
        </View>
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.sectionTitle}>所需食材:</Text>
        {item.ingredients.map((ing, index) => (
          <Text key={index} style={styles.ingredientText}>
            • {ing.name} ({ing.quantity})
          </Text>
        ))}
      </View>

      <View style={styles.nutritionSection}>
        <Text style={styles.sectionTitle}>营养成分:</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
            <Text style={styles.nutritionValue}>{item.nutrition.protein}</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>碳水</Text>
            <Text style={styles.nutritionValue}>{item.nutrition.carbs}</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>脂肪</Text>
            <Text style={styles.nutritionValue}>{item.nutrition.fat}</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>膳食纤维</Text>
            <Text style={styles.nutritionValue}>{item.nutrition.fiber}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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

  const getMatchedIngredients = recipe => {
    return recipe.ingredients.filter(ing =>
      refrigeratorItems.includes(ing.name.toLowerCase())
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>菜谱推荐</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : getFilteredRecipes().length > 0 ? (
        <FlatList
          data={getFilteredRecipes()}
          renderItem={renderRecipe}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.recipeList}
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
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2B40',
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: '#F5F7FA',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2B40',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FFC107',
  },
  inactiveTab: {
    backgroundColor: '#F5F7FA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1F2B40',
  },
  inactiveTabText: {
    color: '#666',
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    marginBottom: 12,
  },
  recipeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2B40',
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAE0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  caloriesText: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  recipeInfo: {
    flexDirection: 'row',
    marginTop: 4,
  },
  recipeDetail: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  ingredientsSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F7FA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2B40',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: '#1F2B40',
    marginBottom: 4,
  },
  nutritionSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F7FA',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  nutritionItem: {
    width: '25%',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2B40',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2B40',
  },
  closeButton: {
    padding: 4,
  },
  modalRecipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2B40',
    marginBottom: 16,
  },
  ingredientsList: {
    maxHeight: 300,
  },
  pickerContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
    paddingBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2B40',
    marginBottom: 8,
  },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FFC107',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  quantityButtonText: {
    color: '#1F2B40',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
    color: '#1F2B40',
  },
  availableText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  summaryContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2B40',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#1F2B40',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
  },
  confirmButton: {
    backgroundColor: '#FFC107',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#1F2B40',
    fontSize: 16,
    fontWeight: '600',
  },
}); 