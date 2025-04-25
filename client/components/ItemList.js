import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import useItems from '../hooks/useItems';
import Pagination from './Pagination';

const ItemList = () => {
    const {
        items,
        currentPage,
        totalPages,
        loading,
        error,
        lastRefreshTime,
        handleDelete,
        handlePageChange,
        refreshItems
    } = useItems();

    // 显示错误提示
    useEffect(() => {
        if (error) {
            Alert.alert('错误', error);
        }
    }, [error]);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                    数量: {item.quantity} | 过期日期: {item.expiryDate}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
            >
                <Text style={styles.deleteButtonText}>删除</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListFooterComponent={
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                }
                refreshing={loading}
                onRefresh={() => refreshItems(currentPage)}
            />
            <Text style={styles.lastUpdateText}>
                最后更新时间: {new Date(lastRefreshTime).toLocaleTimeString()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    lastUpdateText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        padding: 8,
    },
});

export default ItemList; 