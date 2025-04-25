import { useState, useEffect, useCallback } from 'react';
import { getItems, deleteItem } from '../services/databaseService';
import usePagination from './usePagination';

const useItems = () => {
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [error, setError] = useState(null);

    // 使用分页hook
    const {
        currentPage,
        totalPages,
        currentItems: items,
        handlePageChange,
        resetPage
    } = usePagination(allItems);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('开始获取所有数据');
            
            const data = await getItems();
            console.log('获取到的数据:', {
                totalItems: data.length,
                firstItem: data[0]
            });

            if (!data || !Array.isArray(data)) {
                throw new Error('返回的数据格式不正确');
            }

            // 按创建时间倒序排序
            const sortedItems = data.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.addedDate);
                const dateB = new Date(b.createdAt || b.addedDate);
                return dateB - dateA;
            });

            // 更新所有物品
            setAllItems(sortedItems);
            setLastRefreshTime(Date.now());

            console.log('更新后的状态:', {
                totalItems: sortedItems.length,
                currentPage,
                totalPages
            });
        } catch (error) {
            console.error('获取数据失败:', error);
            setError(error.message);
            setAllItems([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, totalPages]);

    const handleDelete = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            console.log('开始删除物品，ID:', id);
            await deleteItem(id);
            console.log('删除成功');
            
            // 重新获取所有数据
            await fetchItems();
            
            // 如果当前页没有数据了，且不是第一页，则返回上一页
            if (items.length === 0 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            }
        } catch (error) {
            console.error('删除失败:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, fetchItems, items.length, handlePageChange]);

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
        handlePageChange,
        refreshItems: fetchItems
    };
};

export default useItems; 