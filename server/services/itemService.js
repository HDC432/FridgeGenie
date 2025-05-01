const ItemModel = require('../models/itemModel');

class ItemService {
    static async getAllItems(page = 1, limit = 5) {
        try {
            console.log('Starting to get all items...');
            const allItems = await ItemModel.findAll();
            console.log('Number of items retrieved:', allItems.length);
            
            // Sort by expiry date in ascending order
            const sortedItems = allItems.sort((a, b) => {
                const dateA = new Date(a.expiryDate);
                const dateB = new Date(b.expiryDate);
                return dateA - dateB;
            });
            console.log('First 5 items after sorting:', sortedItems.slice(0, 5));

            const totalItems = sortedItems.length;
            const totalPages = Math.ceil(totalItems / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const items = sortedItems.slice(startIndex, endIndex);

            console.log('Pagination details:', {
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
            console.error('Failed to get item list:', error);
            throw new Error('Failed to get item list');
        }
    }

    static async getItemById(id) {
        try {
            const item = await ItemModel.findById(id);
            if (!item) {
                throw new Error('Item does not exist');
            }
            return item;
        } catch (error) {
            throw new Error('Failed to get item details');
        }
    }

    // Add date utility function
    static getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static async createItem(itemData) {
        try {
            // Validate required fields
            if (!itemData.name || !itemData.quantity || !itemData.familyId) {
                throw new Error('Name, quantity, and familyId are required');
            }

            // If no expiry date provided, set to 7 days later
            let defaultExpiryDate;
            if (!itemData.expiryDate) {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                defaultExpiryDate = this.getLocalDateString(date);
            }

            const newItem = {
                ...itemData,
                id: Date.now().toString(), // Add unique ID
                quantity: parseInt(itemData.quantity),
                expiryDate: itemData.expiryDate || defaultExpiryDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
            console.log('Starting to delete item, ID:', id);
            
            try {
                const result = await ItemModel.delete(id);
                console.log('Delete operation completed, result:', result);
                return result;
            } catch (dbError) {
                console.error('Database delete operation failed:', {
                    id,
                    error: dbError.message,
                    stack: dbError.stack
                });
                throw new Error(`Database operation failed: ${dbError.message}`);
            }
        } catch (error) {
            console.error('Failed to delete item:', {
                id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = ItemService; 