import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    containerStyle,
    buttonStyle,
    disabledButtonStyle,
    textStyle,
    prevText = '上一页',
    nextText = '下一页',
    showPageInfo = true,
    showPageNumbers = false,
    maxPageNumbers = 5
}) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        if (!showPageNumbers) return null;

        const pageNumbers = [];
        const halfMax = Math.floor(maxPageNumbers / 2);
        let startPage = Math.max(1, currentPage - halfMax);
        let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

        if (endPage - startPage + 1 < maxPageNumbers) {
            startPage = Math.max(1, endPage - maxPageNumbers + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <TouchableOpacity
                    key={i}
                    style={[
                        styles.pageNumberButton,
                        buttonStyle,
                        i === currentPage && [styles.activePageButton, disabledButtonStyle]
                    ]}
                    onPress={() => onPageChange(i)}
                >
                    <Text style={[styles.pageNumberText, textStyle, i === currentPage && styles.activePageText]}>
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.pageNumbersContainer}>
                {pageNumbers}
            </View>
        );
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    buttonStyle,
                    currentPage === 1 && [styles.disabledButton, disabledButtonStyle]
                ]}
                onPress={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <Text style={[styles.buttonText, textStyle]}>{prevText}</Text>
            </TouchableOpacity>
            
            {showPageInfo && (
                <Text style={[styles.pageInfo, textStyle]}>
                    第 {currentPage} 页，共 {totalPages} 页
                </Text>
            )}

            {renderPageNumbers()}
            
            <TouchableOpacity
                style={[
                    styles.button,
                    buttonStyle,
                    currentPage === totalPages && [styles.disabledButton, disabledButtonStyle]
                ]}
                onPress={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <Text style={[styles.buttonText, textStyle]}>{nextText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 8,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    pageInfo: {
        fontSize: 14,
        color: '#666',
    },
    pageNumbersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pageNumberButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
    },
    activePageButton: {
        backgroundColor: '#007AFF',
    },
    pageNumberText: {
        color: '#666',
        fontSize: 14,
    },
    activePageText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Pagination; 