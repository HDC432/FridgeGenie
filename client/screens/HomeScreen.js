import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { getItems, deleteItem } from '../services/databaseService';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';  // npm install date-fns

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    try {
      const fetchedItems = await getItems();
      // 按过期日期升序排序
      fetchedItems.sort((a, b) => 
        new Date(a.expiryDate) - new Date(b.expiryDate)
      );
      setItems(fetchedItems);
    } catch (error) {
      console.error('获取物品时出错:', error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleDelete = (item) => {
    Alert.alert(
      '确认删除',
      `确定要删除 ${item.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              await loadItems();
              Alert.alert('成功', '物品已删除');
            } catch (error) {
              console.error('删除物品时出错:', error);
              Alert.alert('错误', '删除物品失败，请重试');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const daysLeft = differenceInCalendarDays(
      new Date(item.expiryDate),
      new Date()
    );
    // 根据剩余天数设置左侧颜色条
    let borderColor = '#4CD964'; // > 7 天：绿色
    if (daysLeft <= 1)      borderColor = '#FF3B30'; // ≤1 天：红色
    else if (daysLeft <= 3) borderColor = '#FF9500'; // ≤3 天：橙色
    else if (daysLeft <= 7) borderColor = '#FFCC00'; // ≤7 天：黄色

    return (
      <View style={[styles.itemContainer, { borderLeftWidth: 5, borderLeftColor: borderColor }]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            数量: {item.quantity} | 
            过期日期: {new Date(item.expiryDate).toLocaleDateString()} ({daysLeft} 天)
          </Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的冰箱</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddItem')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
