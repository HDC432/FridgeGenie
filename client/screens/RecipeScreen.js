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
} from 'react-native';
import useItems from '../hooks/useItems';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function RecipeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { items, updateItemQuantity } = useItems();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState({});

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
  }, [items]);

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
      Alert.alert('成功', '食材已更新');
      setIsModalVisible(false);
      setSelectedRecipe(null);
    } catch (error) {
      console.error('更新食材数量失败:', error);
      Alert.alert('错误', '更新食材数量失败');
    }
  };

  const renderQuantityPicker = (ingredient) => {
    const fridgeItem = items.find(item => item.name === ingredient.name);
    if (!fridgeItem) return null;

    const maxQuantity = fridgeItem.quantity;
    const quantities = Array.from({ length: maxQuantity + 1 }, (_, i) => i.toString());

    return (
      <View style={styles.pickerContainer} key={ingredient.name}>
        <Text style={styles.pickerLabel}>{ingredient.name}</Text>
        <View style={styles.pickerWrapper}>
          {Platform.OS === 'ios' ? (
            <View style={styles.iosPickerContainer}>
              <Picker
                selectedValue={selectedQuantities[ingredient.name]?.toString()}
                onValueChange={(value) => 
                  setSelectedQuantities(prev => ({
                    ...prev,
                    [ingredient.name]: parseInt(value)
                  }))
                }
                style={styles.iosPicker}
                itemStyle={styles.iosPickerItem}
              >
                {quantities.map(q => (
                  <Picker.Item 
                    key={q} 
                    label={`${q}${ingredient.quantity.replace(/[0-9]/g, '')}`} 
                    value={q}
                    color="#000000"
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <Picker
              selectedValue={selectedQuantities[ingredient.name]?.toString()}
              onValueChange={(value) => 
                setSelectedQuantities(prev => ({
                  ...prev,
                  [ingredient.name]: parseInt(value)
                }))
              }
              style={styles.androidPicker}
            >
              {quantities.map(q => (
                <Picker.Item 
                  key={q} 
                  label={`${q}${ingredient.quantity.replace(/[0-9]/g, '')}`} 
                  value={q}
                  color="#000000"
                />
              ))}
            </Picker>
          )}
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

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirmConsumption}
            >
              <Text style={styles.confirmButtonText}>确认</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>推荐食谱</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateRecipes}
        >
          <Text style={styles.refreshButtonText}>刷新推荐</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>正在生成食谱推荐...</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                暂无推荐食谱
              </Text>
            </View>
          }
        />
      )}

      {renderConfirmationModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#000',
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  caloriesText: {
    color: '#FF6B6B',
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
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  nutritionSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalRecipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
  },
  ingredientsList: {
    maxHeight: 400,
  },
  pickerContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  iosPickerContainer: {
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  iosPicker: {
    height: 120,
  },
  iosPickerItem: {
    fontSize: 16,
    color: '#000000',
  },
  androidPicker: {
    height: 120,
  },
  availableText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 