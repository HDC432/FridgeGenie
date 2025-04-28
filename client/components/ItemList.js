import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { getItems, deleteItem } from '../services/databaseService';

const ItemList = ({ navigation, refresh }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadItems();
  }, [refresh]);

  const loadItems = async () => {
    try {
      const resp = await getItems();
      if (resp && resp.items) {
        // 按过期时间升序排序
        const sortedItems = [...resp.items].sort(
          (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
        );
        setItems(sortedItems);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('加载物品失败:', err);
      Alert.alert('错误', '加载物品失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
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
              await deleteItem(id);
              loadItems(); // 重新加载列表
            } catch (err) {
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const daysLeft = differenceInCalendarDays(
      new Date(item.expiryDate),
      new Date()
    );

    let stripeColor = '#4CAF50'; // 正常
    if (daysLeft <= 1) stripeColor = '#F44336'; // 紧急
    else if (daysLeft <= 3) stripeColor = '#FF9800'; // 注意
    else if (daysLeft <= 7) stripeColor = '#FFEB3B'; // 警告

    return (
      <View style={styles.itemWrapper}>
        <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
        <View style={styles.itemContainer}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              数量: {item.quantity} | 过期: {new Date(item.expiryDate).toLocaleDateString()} ({daysLeft}天)
            </Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (items.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>没有物品</Text>
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={() => navigation.navigate('AddItem')}
        >
          <Text style={styles.addFirstButtonText}>添加物品</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {lastUpdate && (
        <Text style={styles.lastUpdateText}>
          上次更新: {lastUpdate.toLocaleTimeString()}
        </Text>
      )}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onRefresh={loadItems}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
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
    backgroundColor: '#FFFFFF',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
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
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
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
  lastUpdateText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    padding: 8,
  },
});

export default ItemList; 