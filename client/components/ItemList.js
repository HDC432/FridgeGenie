import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useItems from '../hooks/useItems';
import Pagination from './Pagination';
import { differenceInCalendarDays } from 'date-fns';
import '../styles/components/ItemList.css';

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

    const renderItem = ({ item }) => {
        const expiry = new Date(item.expiryDate);
        if (isNaN(expiry.getTime())) {
            return null;
        }
        const daysLeft = differenceInCalendarDays(expiry, new Date());

        let stripeClass = 'stripeGreen'; // > 7 天：绿
        if (daysLeft <= 1)      stripeClass = 'stripeRed'; // ≤1 天：红
        else if (daysLeft <= 3) stripeClass = 'stripeOrange'; // ≤3 天：橙
        else if (daysLeft <= 7) stripeClass = 'stripeYellow'; // ≤7 天：黄

        return (
            <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { item })}>
                <View className="itemWrapper">
                    <View className={`stripe ${stripeClass}`} />
                    <View className="itemContainer">
                        <View className="itemInfo">
                            <Text className="itemName">{item.name}</Text>
                            <Text className="itemDetails">
                                数量: {item.quantity} | 过期: {expiry.toLocaleDateString()} ({daysLeft} 天)
                            </Text>
                        </View>
                        <View className="itemActions">
                            <TouchableOpacity
                                className="actionButton"
                                onPress={() => handleDelete(item.id)}
                            >
                                <Ionicons name="trash-outline" size={24} color="#F44336" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (items.length === 0) {
        return (
            <View className="emptyContainer">
                <Text className="emptyText">没有物品</Text>
                <TouchableOpacity
                    className="addFirstButton"
                    onPress={() => navigation.navigate('AddItem')}
                >
                    <Text className="addFirstButtonText">添加物品</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="container">
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerClassName="listContainer"
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