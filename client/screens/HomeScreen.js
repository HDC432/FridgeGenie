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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { getFamilyItems, deleteItem, updateItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

const HomeScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const { user } = useAuth();

  const loadItems = async () => {
    try {
      console.log('开始加载物品列表...');
      console.log('当前用户信息:', user);
      
      if (!user) {
        console.error('用户未登录');
        Alert.alert('错误', '请先登录');
        return;
      }

      if (!user.familyId) {
        console.error('用户未关联家庭');
        Alert.alert('错误', '请先加入或创建一个家庭');
        return;
      }

      console.log('用户家庭ID:', user.familyId);
      const resp = await getFamilyItems(user.familyId);
      console.log('获取到的物品数据:', resp);
      
      if (resp && Array.isArray(resp.items)) {
        const rawItems = resp.items;
        // 过滤掉数量为0的物品，并按过期时间升序排序
        const filteredItems = rawItems.filter(item => item.quantity > 0);
        filteredItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        console.log('排序后的物品列表:', filteredItems);
        setItems(filteredItems);
      } else {
        console.error('返回的数据格式不正确:', resp);
        Alert.alert('错误', '获取数据失败，请重试');
      }
    } catch (err) {
      console.error('加载物品失败:', err);
      Alert.alert('错误', '加载物品失败，请重试');
    }
  };

  useEffect(() => {
    loadItems();
  }, [user?.familyId]);

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
      Alert.alert('错误', '请输入有效的数量');
      return;
    }

    try {
      if (quantity === 0) {
        // 如果数量为0，直接删除物品
        await deleteItem(selectedItem.id);
        setItems(prevItems => prevItems.filter(item => item.id !== selectedItem.id));
        setIsQuantityModalVisible(false);
        Alert.alert('成功', '物品已删除');
      } else {
        // 更新物品数量
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
        Alert.alert('成功', '数量已更新');
      }
    } catch (error) {
      console.error('操作失败:', error);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  const handleDelete = (id) => {
    console.log('点击删除按钮，ID:', id);
    Alert.alert(
      '确认删除',
      '确定要删除这个物品吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('开始删除物品，ID:', id);
              await deleteItem(id);
              console.log('删除成功，更新列表');
              setItems(prevItems => prevItems.filter(item => item.id !== id));
              Alert.alert('成功', '物品已删除');
            } catch (err) {
              console.error('删除失败:', err);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
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

    let stripeColor = COLORS.SUCCESS; // > 7 天：绿
    if (daysLeft <= 1)      stripeColor = COLORS.DANGER; // ≤1 天：红
    else if (daysLeft <= 3) stripeColor = COLORS.ALERT; // ≤3 天：橙
    else if (daysLeft <= 7) stripeColor = COLORS.WARNING; // ≤7 天：黄

    return (
      <View style={styles.itemWrapper}>
        <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
        <View style={styles.itemContainer}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              数量: {item.quantity} | 过期: {expiry.toLocaleDateString()} ({daysLeft} 天)
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
            <Text style={styles.modalTitle}>编辑数量</Text>
            <TouchableOpacity
              onPress={() => setIsQuantityModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalItemName}>{selectedItem?.name}</Text>
          
          <View style={styles.quantityInputContainer}>
            <Text style={styles.quantityLabel}>数量:</Text>
            <TextInput
              style={styles.quantityInput}
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="number-pad"
              placeholder="请输入数量"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsQuantityModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleQuantityUpdate}
            >
              <Text style={styles.confirmButtonText}>确认</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>冰箱里还没有物品</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <Text style={styles.addButtonText}>添加物品</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {renderQuantityModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: SPACING.MEDIUM,
    paddingBottom: 80, // Add padding for bottom tab bar
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.SMALL,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOW_STYLE,
  },
  stripe: {
    width: 4,
    borderTopLeftRadius: BORDER_RADIUS.MEDIUM,
    borderBottomLeftRadius: BORDER_RADIUS.MEDIUM,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: SPACING.MEDIUM,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: SPACING.SMALL,
    marginLeft: SPACING.SMALL,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.XLARGE,
  },
  emptyText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  addButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LARGE,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  modalTitle: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: SPACING.SMALL,
  },
  modalItemName: {
    fontSize: FONT_SIZE.MEDIUM,
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
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    fontSize: FONT_SIZE.MEDIUM,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginLeft: SPACING.MEDIUM,
  },
  cancelButton: {
    backgroundColor: COLORS.BACKGROUND,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
});

export default HomeScreen;
