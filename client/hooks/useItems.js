import { useState, useEffect, useCallback } from 'react';
import { getItems, deleteItem, addItem, updateItem } from '../services/databaseService';

export const useItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        console.log('开始获取物品');
        setLoading(true);
        setError(null);
        try {
            const response = await getItems();
            console.log('获取物品响应:', response);
            
            if (Array.isArray(response)) {
                // 确保每个物品都有必要的字段
                const processedItems = response.map(item => ({
                    id: item.id,
                    name: item.name || '',
                    quantity: item.quantity || 0,
                    expiryDate: item.expiryDate || new Date().toISOString(),
                    category: item.category || '其他',
                    location: item.location || '默认位置',
                    notes: item.notes || '',
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: item.updatedAt || new Date().toISOString()
                }));
                
                setItems(processedItems);
                setLastRefreshTime(Date.now());
            } else {
                console.error('响应格式不正确:', response);
                setError('获取数据失败：响应格式不正确');
            }
        } catch (error) {
            console.error('获取物品时出错:', error);
            setError(error.message || '获取数据失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleAddItem = async (newItem) => {
        try {
            const addedItem = await addItem(newItem);
            setItems(prevItems => [...prevItems, addedItem]);
            return addedItem;
        } catch (error) {
            console.error('添加物品失败:', error);
            throw error;
        }
    };

    const handleUpdateItem = async (id, updatedItem) => {
        try {
            const result = await updateItem(id, updatedItem);
            setItems(prevItems => 
                prevItems.map(item => item.id === id ? result : item)
            );
            return result;
        } catch (error) {
            console.error('更新物品失败:', error);
            throw error;
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await deleteItem(id);
            setItems(prevItems => prevItems.filter(item => item.id !== id));
        } catch (error) {
            console.error('删除物品失败:', error);
            throw error;
        }
    };

    return {
        items,
        loading,
        error,
        lastRefreshTime,
        fetchItems,
        addItem: handleAddItem,
        updateItem: handleUpdateItem,
        deleteItem: handleDeleteItem
    };
};

export default useItems; 