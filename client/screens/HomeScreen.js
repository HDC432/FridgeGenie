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
import { getItems, deleteItem, updateItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

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
      const resp = await getItems(1, 1000); // 获取所有物品
      console.log('获取到的物品数据:', resp);
      
      if (resp && resp.items) {
        const rawItems = resp.items;
        // 按过期时间升序排序
        rawItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        console.log('排序后的物品列表:', rawItems);
        setItems(rawItems);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleDelete = async (item) => {
    console.log('点击删除按钮:', item);
    // 直接执行删除逻辑，跳过 Alert 测试
    try {
      const success = await deleteItem(item.id);
      if (success) {
        await loadItems();
        Alert.alert('成功', '物品已删除');
      } else {
        throw new Error('删除失败');
      }
    } catch (err) {
      console.error('删除失败:', err);
      Alert.alert('错误', '删除物品失败，请重试');
    }
  };

  const handleEditQuantity = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toString());
    setIsQuantityModalVisible(true);
  };

  const handleUpdateQuantity = async () => {
    if (!selectedItem) return;

    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert('错误', '请输入有效的数量');
      return;
    }

    try {
      if (quantity === 0) {
        // 如果数量为0，直接删除物品
        const success = await deleteItem(selectedItem.id);
        if (success) {
          await loadItems();
          setIsQuantityModalVisible(false);
          Alert.alert('成功', '物品已删除');
        } else {
          throw new Error('删除失败');
        }
      } else {
        // 更新物品数量
        const updatedItem = {
          ...selectedItem,
          quantity: quantity,
          updatedAt: new Date().toISOString()
        };

        const success = await updateItem(selectedItem.id, updatedItem);
        if (success) {
          await loadItems();
          setIsQuantityModalVisible(false);
          Alert.alert('成功', '数量已更新');
        } else {
          throw new Error('更新失败');
        }
      }
    } catch (err) {
      console.error('操作失败:', err);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  const renderItem = ({ item }) => {
    const expiry = new Date(item.expiryDate);
    if (isNaN(expiry.getTime())) {
      return null;
    }
    const daysLeft = differenceInCalendarDays(expiry, new Date());

    let stripeColor = '#4CAF50'; // > 7 天：绿
    if (daysLeft <= 1)      stripeColor = '#F44336'; // ≤1 天：红
    else if (daysLeft <= 3) stripeColor = '#FF9800'; // ≤3 天：橙
    else if (daysLeft <= 7) stripeColor = '#FFEB3B'; // ≤7 天：黄

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
              <Ionicons name="pencil-outline" size={24} color="#1F2B40" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
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
              <Ionicons name="close" size={24} color="#666" />
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
              onPress={handleUpdateQuantity}
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
      <View style={styles.header}>
        <Text style={styles.title}>我的冰箱</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Recipe')}
          >
            <Ionicons name="restaurant-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { marginLeft: 12 }]}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Ionicons name="add" size={24} color="#1F2B40" />
          </TouchableOpacity>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>冰箱是空的</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Text style={styles.addFirstButtonText}>添加第一个物品</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
      {renderQuantityModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2B40',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: '#1F2B40',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#FFC107',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
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
    backgroundColor: '#F5F7FA',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
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
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
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
    color: '#1F2B40',
  },
  closeButton: {
    padding: 4,
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2B40',
    marginBottom: 16,
  },
  quantityInputContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  quantityInput: {
    backgroundColor: '#F5F7FA',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2B40',
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

export default HomeScreen;
