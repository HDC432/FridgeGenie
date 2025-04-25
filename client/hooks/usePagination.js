import { useState, useMemo } from 'react';

const usePagination = (data = [], itemsPerPage = 5) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // 计算总页数
    const totalPages = useMemo(() => {
        return Math.ceil(data.length / itemsPerPage);
    }, [data.length, itemsPerPage]);

    // 计算当前页的数据
    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, itemsPerPage]);

    // 处理页码变化
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // 重置到第一页
    const resetPage = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        totalPages,
        currentItems,
        handlePageChange,
        resetPage
    };
};

export default usePagination; 