import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import '../styles/components/Pagination.css';

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
    // 没有数据时不显示分页
    if (totalItems === 0 || totalPages === 0) {
        return null;
    }

    // 构建页码数组
    const buildPageNumbers = () => {
        const pages = [];
        
        // 总页数小于等于5页，显示所有页码
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } 
        // 总页数大于5页，使用省略号
        else {
            // 总是显示第一页
            pages.push(1);
            
            // 当前页在前3页
            if (currentPage < 4) {
                pages.push(2, 3, 4, '...');
            } 
            // 当前页在最后3页
            else if (currentPage > totalPages - 3) {
                pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1);
            } 
            // 当前页在中间
            else {
                pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
            }
            
            // 总是显示最后一页
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    return (
        <View className="container">
            <Text className="pageInfo">
                共 {totalItems} 项，第 {currentPage} / {totalPages} 页
            </Text>
            
            <View className="buttonsContainer">
                {/* 上一页按钮 */}
                <TouchableOpacity
                    className={`arrowButton ${currentPage === 1 ? 'disabledButton' : ''}`}
                    onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <Ionicons
                        name="chevron-back"
                        size={16}
                        color={currentPage === 1 ? '#999' : '#666'}
                    />
                </TouchableOpacity>
                
                {/* 页码按钮 */}
                {buildPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <View key={`ellipsis-${index}`} className="pageButton inactiveButton">
                                <Text className="buttonText inactiveButtonText">...</Text>
                            </View>
                        );
                    }
                    
                    return (
                        <TouchableOpacity
                            key={`page-${page}`}
                            className={`pageButton ${
                                page === currentPage ? 'activeButton' : 'inactiveButton'
                            }`}
                            onPress={() => page !== currentPage && onPageChange(page)}
                            disabled={page === currentPage}
                        >
                            <Text
                                className={`buttonText ${
                                    page === currentPage ? 'activeButtonText' : 'inactiveButtonText'
                                }`}
                            >
                                {page}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
                
                {/* 下一页按钮 */}
                <TouchableOpacity
                    className={`arrowButton ${
                        currentPage === totalPages ? 'disabledButton' : ''
                    }`}
                    onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={currentPage === totalPages ? '#999' : '#666'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Pagination; 