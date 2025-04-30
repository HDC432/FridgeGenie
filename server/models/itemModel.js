const { itemsContainer } = require('../config/database');

class ItemModel {
    static async findAll() {
        console.log('ItemModel - findAll - Starting to query all items');
        const { resources } = await itemsContainer.items.readAll().fetchAll();
        console.log('ItemModel - findAll - Query results:', resources);
        return resources;
    }

    static async findByFamilyId(familyId) {
        console.log('ItemModel - findByFamilyId - Starting to query family items:', familyId);
        try {
            const { resources } = await itemsContainer.items.query({
                query: "SELECT * FROM c WHERE c.familyId = @familyId",
                parameters: [{ name: "@familyId", value: familyId }]
            }).fetchAll();
            console.log('ItemModel - findByFamilyId - Query results:', resources);
            return resources;
        } catch (error) {
            console.error('ItemModel - findByFamilyId - Query failed:', error);
            throw error;
        }
    }

    static async findByName(name) {
        console.log('ItemModel - findByName - Starting to query item:', name);
        try {
            const { resources } = await itemsContainer.items.query({
                query: "SELECT * FROM c WHERE c.name = @name",
                parameters: [{ name: "@name", value: name }]
            }).fetchAll();
            console.log('ItemModel - findByName - Query results:', resources);
            return resources[0];
        } catch (error) {
            console.error('ItemModel - findByName - Query failed:', error);
            throw error;
        }
    }

    static async findById(id) {
        console.log('ItemModel - findById - Starting to query item:', id);
        const { resources } = await itemsContainer.items.query({
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        }).fetchAll();
        console.log('ItemModel - findById - Query results:', resources);
        return resources[0];
    }

    static async create(item) {
        console.log('ItemModel - create - Starting to create item:', item);
        if (!item.familyId) {
            throw new Error('familyId is a required field');
        }
        const { resource } = await itemsContainer.items.create(item);
        console.log('ItemModel - create - Creation result:', resource);
        return resource;
    }

    static async updateByName(name, updates) {
        console.log('ItemModel - updateByName - Starting to update item:', { name, updates });
        try {
            const item = await this.findByName(name);
            if (!item) {
                return null;
            }
            const updatedItem = { ...item, ...updates };
            const { resource } = await itemsContainer.items.upsert(updatedItem);
            console.log('ItemModel - updateByName - Update result:', resource);
            return resource;
        } catch (error) {
            console.error('ItemModel - updateByName - Update failed:', error);
            throw error;
        }
    }

    static async update(id, item) {
        console.log('ItemModel - update - Starting to update item:', { id, item });
        if (!item.familyId) {
            throw new Error('familyId is a required field');
        }
        const { resource } = await itemsContainer.items.upsert(item);
        console.log('ItemModel - update - Update result:', resource);
        return resource;
    }

    static async deleteByName(name) {
        try {
            console.log('ItemModel - deleteByName - Starting to delete item, name:', name);
            
            // First check if item exists
            const item = await this.findByName(name);
            console.log('ItemModel - deleteByName - Found item:', item);
            
            if (!item) {
                console.log('ItemModel - deleteByName - Item does not exist, name:', name);
                return false;
            }
            
            console.log('ItemModel - deleteByName - Preparing to delete item:', {
                id: item.id,
                _self: item._self
            });
            
            // Execute delete operation
            console.log('ItemModel - deleteByName - Starting delete operation');
            const { statusCode } = await itemsContainer.item(item.id).delete();
            console.log('ItemModel - deleteByName - Delete operation completed, status code:', statusCode);
            
            if (statusCode !== 204) {
                console.log('ItemModel - deleteByName - Delete operation failed, status code:', statusCode);
                throw new Error(`Delete operation failed, status code: ${statusCode}`);
            }
            
            console.log('ItemModel - deleteByName - Delete successful');
            return true;
        } catch (error) {
            console.error('ItemModel - deleteByName - Delete operation failed:', {
                name,
                error: error.message,
                stack: error.stack,
                errorType: error.constructor.name
            });
            throw error;
        }
    }

    static async delete(id) {
        try {
            console.log('ItemModel - delete - Starting to delete item, ID:', id);
            
            // First check if item exists
            const item = await this.findById(id);
            console.log('ItemModel - delete - Found item:', item);
            
            if (!item) {
                console.log('ItemModel - delete - Item does not exist, ID:', id);
                return false;
            }
            
            console.log('ItemModel - delete - Preparing to delete item:', {
                id: item.id,
                _self: item._self
            });
            
            // Execute delete operation
            console.log('ItemModel - delete - Starting delete operation');
            const { statusCode } = await itemsContainer.item(item.id).delete();
            console.log('ItemModel - delete - Delete operation completed, status code:', statusCode);
            
            if (statusCode !== 204) {
                console.log('ItemModel - delete - Delete operation failed, status code:', statusCode);
                throw new Error(`Delete operation failed, status code: ${statusCode}`);
            }
            
            console.log('ItemModel - delete - Delete successful');
            return true;
        } catch (error) {
            console.error('ItemModel - delete - Delete operation failed:', {
                id,
                error: error.message,
                stack: error.stack,
                errorType: error.constructor.name
            });
            throw error;
        }
    }
}

module.exports = ItemModel; 