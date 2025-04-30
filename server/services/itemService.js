const ItemModel = require('../models/itemModel');

class ItemService {
    static async getAllItems(page = 1, limit = 5) {
        try {
            console.log('开始获取所有物品...');
            const allItems = await ItemModel.findAll();
            console.log('获取到的所有物品数量:', allItems.length);
            
            // 按过期时间升序排序
            const sortedItems = allItems.sort((a, b) => {
                const dateA = new Date(a.expiryDate);
                const dateB = new Date(b.expiryDate);
                return dateA - dateB;
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
            // Validate required fields
            if (!itemData.name || !itemData.quantity || !itemData.familyId) {
                throw new Error('Name, quantity, and familyId are required');
            }

            const newItem = {
                ...itemData,
                id: Date.now().toString(), // Add unique ID
                quantity: parseInt(itemData.quantity),
                expiryDate: itemData.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
                createdAt: new Date().toISOString()
            };

            const result = await ItemModel.create(newItem);
            if (!result) {
                throw new Error('Failed to create item in database');
            }
            return result;
        } catch (error) {
            console.error('Failed to create item:', error);
            throw error;
        }
    }

    static async updateItem(id, itemData) {
        try {
            // Check if item exists
            const existingItem = await ItemModel.findById(id);
            if (!existingItem) {
                throw new Error('Item not found');
            }

            // Validate data
            if (!itemData.name || !itemData.quantity || !itemData.familyId) {
                throw new Error('Name, quantity, and familyId are required');
            }

            const updatedItem = {
                ...itemData,
                id,
                quantity: parseInt(itemData.quantity),
                updatedAt: new Date().toISOString()
            };

            const result = await ItemModel.update(id, updatedItem);
            if (!result) {
                throw new Error('Failed to update item in database');
            }
            return result;
        } catch (error) {
            console.error('Failed to update item:', error);
            throw error;
        }
    }

    static async deleteItem(id) {
        try {
            console.log('开始删除物品，ID:', id);
            
            try {
                const result = await ItemModel.delete(id);
                console.log('删除操作完成，结果:', result);
                return result;
            } catch (dbError) {
                console.error('数据库删除操作失败:', {
                    id,
                    error: dbError.message,
                    stack: dbError.stack
                });
                throw new Error(`数据库操作失败: ${dbError.message}`);
            }
        } catch (error) {
            console.error('删除物品失败:', {
                id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = ItemService; 