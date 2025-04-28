import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { getItems, deleteItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleDelete = item => {
    console.log('点击删除按钮:', item);
    Alert.alert(
      '确认删除',
      `确定要删除 "${item.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('开始删除物品:', item);
              const success = await deleteItem(item.id);
              if (success) {
                console.log('删除成功，刷新列表');
                await loadItems();
                Alert.alert('成功', '物品已删除');
              } else {
                throw new Error('删除失败');
              }
            } catch (err) {
              console.error('删除失败:', err);
              Alert.alert('错误', '删除物品失败，请重试');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const expiry = new Date(item.expiryDate);
    if (isNaN(expiry.getTime())) {
      return null;
    }
    const daysLeft = differenceInCalendarDays(expiry, new Date());

    let stripeColor = '#4CD964'; // > 7 天：绿
    if (daysLeft <= 1)      stripeColor = '#FF3B30'; // ≤1 天：红
    else if (daysLeft <= 3) stripeColor = '#FF9500'; // ≤3 天：橙
    else if (daysLeft <= 7) stripeColor = '#FFCC00'; // ≤7 天：黄

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
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Recipe')}
          >
            <Ionicons name="restaurant-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Ionicons name="add" size={24} color="#fff" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold' },

  content: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        overflow: 'auto', // let FlatList scroll here
      },
    }),
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  itemWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stripe: {
    width: 5,
    height: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
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
    padding: 4,
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
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFirstButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default HomeScreen;
