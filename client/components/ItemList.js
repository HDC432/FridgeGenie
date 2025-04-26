import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useItems from '../hooks/useItems';
import Pagination from './Pagination';

const ItemList = ({ navigation }) => {
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

    // 监听导航变化，当从添加页面返回时刷新数据
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('ItemList 获得焦点，刷新数据');
            refreshItems(1);
        });

        return unsubscribe;
    }, [navigation, refreshItems]);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                    数量: {item.quantity} | 过期日期: {new Date(item.expiryDate).toLocaleDateString()}
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
            
            {/* 悬浮的添加按钮 */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddItem')}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
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
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
        elevation: 3,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
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
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default ItemList; 