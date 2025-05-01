const ItemModel = require('../models/itemModel');

/**
 * Service class for managing refrigerator items and related operations
 * @class ItemService
 */
class ItemService {
    /**
     * Retrieves all items with pagination and sorting by expiry date
     * @async
     * @param {number} [page=1] - The page number for pagination
     * @param {number} [limit=5] - The number of items per page
     * @returns {Promise<Object>} Object containing items and pagination details
     * @throws {Error} If retrieval fails
     */
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

    /**
     * Retrieves a specific item by its ID
     * @async
     * @param {string} id - The unique identifier of the item
     * @returns {Promise<Object>} The item details
     * @throws {Error} If item not found or retrieval fails
     */
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

    /**
     * Converts a Date object to a local date string in YYYY-MM-DD format
     * @param {Date} date - The date to convert
     * @returns {string} The formatted date string
     */
    static getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Creates a new item in the refrigerator
     * @async
     * @param {Object} itemData - The item data
     * @param {string} itemData.name - The name of the item
     * @param {number} itemData.quantity - The quantity of the item
     * @param {string} itemData.familyId - The ID of the family the item belongs to
     * @param {string} [itemData.expiryDate] - Optional expiry date (defaults to 7 days from now)
     * @returns {Promise<Object>} The created item
     * @throws {Error} If creation fails or required fields are missing
     */
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

    /**
     * Updates an existing item
     * @async
     * @param {string} id - The unique identifier of the item to update
     * @param {Object} itemData - The updated item data
     * @param {string} itemData.name - The name of the item
     * @param {number} itemData.quantity - The quantity of the item
     * @param {string} itemData.familyId - The ID of the family the item belongs to
     * @returns {Promise<Object>} The updated item
     * @throws {Error} If update fails, item not found, or required fields are missing
     */
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

    /**
     * Deletes an item from the refrigerator
     * @async
     * @param {string} id - The unique identifier of the item to delete
     * @returns {Promise<Object>} The result of the deletion operation
     * @throws {Error} If deletion fails
     */
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