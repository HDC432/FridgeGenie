import { useState, useEffect, useCallback } from 'react';
import { getItems, deleteItem } from '../services/databaseService';

const useItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchItems = useCallback(async (page = currentPage) => {
        try {
            setLoading(true);
            setError(null);
            console.log('开始获取数据，页码:', page);
            
            const data = await getItems(page);
            console.log('获取到的数据:', data);

            if (!data || !data.items || !Array.isArray(data.items)) {
                throw new Error('返回的数据格式不正确');
            }

            setItems(data.items);
            setTotalPages(data.pagination.totalPages);
            setCurrentPage(data.pagination.currentPage);
            setLastRefreshTime(Date.now());

            console.log('更新后的状态:', {
                currentPage: data.pagination.currentPage,
                totalPages: data.pagination.totalPages,
                itemsCount: data.items.length
            });
        } catch (error) {
            console.error('获取数据失败:', error);
            setError(error.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    const handleDelete = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            console.log('开始删除物品，ID:', id);
            await deleteItem(id);
            console.log('删除成功');
            
            // 重新获取当前页数据
            await fetchItems(currentPage);
            
            // 如果当前页没有数据了，且不是第一页，则返回上一页
            if (items.length === 0 && currentPage > 1) {
                await fetchItems(currentPage - 1);
            }
        } catch (error) {
            console.error('删除失败:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, fetchItems, items.length]);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchItems(newPage);
        }
    }, [totalPages, fetchItems]);

    const refreshItems = useCallback(() => {
        fetchItems(currentPage);
    }, [currentPage, fetchItems]);

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
        refreshItems
    };
};

export default useItems; 