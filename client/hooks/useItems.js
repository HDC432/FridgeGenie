import { useState, useEffect, useCallback } from 'react';
import { getItems, deleteItem, addItem, updateItem } from '../services/databaseService';

export const useItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchItems = useCallback(async (page = currentPage) => {
        console.log('开始获取物品，页码:', page);
        setLoading(true);
        setError(null);
        try {
            // 设置一个很大的 limit 值来获取所有物品
            const response = await getItems(1, 1000);
            console.log('获取物品响应:', response);
            
            if (response && response.items) {
                setItems(response.items);
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

    const handleDelete = useCallback(async (id) => {
        console.log('开始删除物品，ID:', id);
        try {
            await deleteItem(id);
            console.log('删除成功，刷新数据');
            
            // 检查当前页是否还有物品
            if (items.length > 1) {
                // 如果当前页还有物品，刷新当前页
                await fetchItems(currentPage);
            } else if (currentPage > 1) {
                // 如果当前页没有物品了，且不是第一页，返回上一页
                await fetchItems(currentPage - 1);
            } else {
                // 如果是第一页且没有物品了，刷新当前页
                await fetchItems(currentPage);
            }
        } catch (error) {
            console.error('删除物品时出错:', error);
            setError(error.message || '删除失败');
        }
    }, [items.length, currentPage, fetchItems]);

    const handleAddItem = useCallback(async (newItem) => {
        console.log('开始添加物品:', newItem);
        try {
            await addItem(newItem);
            console.log('添加成功，立即刷新数据');
            
            // 立即刷新第一页数据
            await fetchItems(1);
            
            // 返回添加成功的结果
            return true;
        } catch (error) {
            console.error('添加物品时出错:', error);
            setError(error.message || '添加失败');
            throw error;
        }
    }, [fetchItems]);

    const handlePageChange = useCallback((newPage) => {
        console.log('切换页面:', newPage);
        if (newPage >= 1 && newPage <= totalPages) {
            fetchItems(newPage);
        }
    }, [totalPages, fetchItems]);

    const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
        console.log('更新物品数量:', { itemId, newQuantity });
        try {
            const item = items.find(i => i.id === itemId);
            if (!item) {
                throw new Error('物品不存在');
            }

            // 如果新数量为0，删除物品
            if (newQuantity <= 0) {
                await handleDelete(itemId);
                return;
            }

            // 更新物品数量
            const updatedItem = {
                ...item,
                quantity: newQuantity,
                updatedAt: new Date().toISOString()
            };
            
            await updateItem(itemId, updatedItem);
            
            // 刷新物品列表
            await fetchItems(1);
            
            return true;
        } catch (error) {
            console.error('更新物品数量失败:', error);
            throw error;
        }
    }, [items, fetchItems, handleDelete]);

    // 自动刷新
    useEffect(() => {
        console.log('组件挂载，开始获取数据');
        fetchItems();

        const refreshInterval = setInterval(() => {
            console.log('自动刷新数据...');
            fetchItems();
        }, 30000);

        return () => {
            console.log('组件卸载，清除定时器');
            clearInterval(refreshInterval);
        };
    }, [fetchItems]);

    return {
        items,
        currentPage,
        totalPages,
        loading,
        error,
        lastRefreshTime,
        handleDelete,
        handleAddItem,
        handlePageChange,
        refreshItems: fetchItems,
        updateItemQuantity
    };
};

export default useItems; 