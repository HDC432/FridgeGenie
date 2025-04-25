const ItemModel = require('../models/itemModel');

class ItemService {
    static async getAllItems(page = 1, limit = 5) {
        try {
            console.log('开始获取所有物品...');
            const allItems = await ItemModel.findAll();
            console.log('获取到的所有物品数量:', allItems.length);
            
            // 按创建时间倒序排序
            const sortedItems = allItems.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.addedDate);
                const dateB = new Date(b.createdAt || b.addedDate);
                return dateB - dateA;
            });
            console.log('排序后的前5个物品:', sortedItems.slice(0, 5));

            const totalItems = sortedItems.length;
            const totalPages = Math.ceil(totalItems / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const items = sortedItems.slice(startIndex, endIndex);

            console.log('分页详细信息:', {
                page,
                limit,
                totalItems,
                totalPages,
                startIndex,
                endIndex,
                itemsCount: items.length,
                currentPageItems: items.map(item => ({
                    name: item.name,
                    createdAt: item.createdAt || item.addedDate
                }))
            });

            return {
                items,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            console.error('获取物品列表失败:', error);
            throw new Error('获取物品列表失败');
        }
    }

    static async getItemById(id) {
        try {
            const item = await ItemModel.findById(id);
            if (!item) {
                throw new Error('物品不存在');
            }
            return item;
        } catch (error) {
            throw new Error('获取物品详情失败');
        }
    }

    static async createItem(itemData) {
        try {
            // 数据验证
            if (!itemData.name || !itemData.quantity || !itemData.expiryDate) {
                throw new Error('请提供所有必填字段');
            }

            const newItem = {
                ...itemData,
                quantity: parseInt(itemData.quantity),
                createdAt: new Date().toISOString()
            };

            return await ItemModel.create(newItem);
        } catch (error) {
            throw new Error('创建物品失败');
        }
    }

    static async updateItem(id, itemData) {
        try {
            // 检查物品是否存在
            const existingItem = await ItemModel.findById(id);
            if (!existingItem) {
                throw new Error('物品不存在');
            }

            // 数据验证
            if (!itemData.name || !itemData.quantity || !itemData.expiryDate) {
                throw new Error('请提供所有必填字段');
            }

            const updatedItem = {
                ...itemData,
                id,
                quantity: parseInt(itemData.quantity),
                updatedAt: new Date().toISOString()
            };

            return await ItemModel.update(id, updatedItem);
        } catch (error) {
            throw new Error('更新物品失败');
        }
    }

    static async deleteItem(id) {
        try {
            // 检查物品是否存在
            const existingItem = await ItemModel.findById(id);
            if (!existingItem) {
                throw new Error('物品不存在');
            }

            return await ItemModel.delete(id);
        } catch (error) {
            throw new Error('删除物品失败');
        }
    }
}

module.exports = ItemService; 