const { itemsContainer } = require('../config/database');

class ItemModel {
    static async findAll() {
        console.log('ItemModel - findAll - 开始查询所有物品');
        const { resources } = await itemsContainer.items.readAll().fetchAll();
        console.log('ItemModel - findAll - 查询结果:', resources);
        return resources;
    }

    static async findByFamilyId(familyId) {
        console.log('ItemModel - findByFamilyId - 开始查询家庭物品:', familyId);
        try {
            const query = {
                query: "SELECT * FROM c WHERE c.familyId = @familyId",
                parameters: [{ name: "@familyId", value: familyId }]
            };
            console.log('ItemModel - findByFamilyId - 查询语句:', query);

            const { resources } = await itemsContainer.items.query(query).fetchAll();
            console.log('ItemModel - findByFamilyId - 查询结果数量:', resources.length);
            console.log('ItemModel - findByFamilyId - 查询结果:', resources);
            return resources;
        } catch (error) {
            console.error('ItemModel - findByFamilyId - 查询失败:', error);
            throw error;
        }
    }

    static async findByName(name) {
        console.log('ItemModel - findByName - 开始查询物品:', name);
        try {
            const { resources } = await itemsContainer.items.query({
                query: "SELECT * FROM c WHERE c.name = @name",
                parameters: [{ name: "@name", value: name }]
            }).fetchAll();
            console.log('ItemModel - findByName - 查询结果:', resources);
            return resources[0];
        } catch (error) {
            console.error('ItemModel - findByName - 查询失败:', error);
            throw error;
        }
    }

    static async findById(id) {
        console.log('ItemModel - findById - 开始查询物品:', id);
        const { resources } = await itemsContainer.items.query({
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        }).fetchAll();
        console.log('ItemModel - findById - 查询结果:', resources);
        return resources[0];
    }

    static async create(item) {
        console.log('ItemModel - create - 开始创建物品:', item);
        if (!item.familyId) {
            throw new Error('familyId 是必填字段');
        }
        const { resource } = await itemsContainer.items.create(item);
        console.log('ItemModel - create - 创建结果:', resource);
        return resource;
    }

    static async updateByName(name, updates) {
        console.log('ItemModel - updateByName - 开始更新物品:', { name, updates });
        try {
            const item = await this.findByName(name);
            if (!item) {
                return null;
            }
            const updatedItem = { ...item, ...updates };
            const { resource } = await itemsContainer.items.upsert(updatedItem);
            console.log('ItemModel - updateByName - 更新结果:', resource);
            return resource;
        } catch (error) {
            console.error('ItemModel - updateByName - 更新失败:', error);
            throw error;
        }
    }

    static async update(id, item) {
        console.log('ItemModel - update - 开始更新物品:', { id, item });
        if (!item.familyId) {
            throw new Error('familyId 是必填字段');
        }
        const { resource } = await itemsContainer.items.upsert(item);
        console.log('ItemModel - update - 更新结果:', resource);
        return resource;
    }

    static async deleteByName(name) {
        try {
            console.log('ItemModel - deleteByName - 开始删除物品，名称:', name);
            
            // 首先检查物品是否存在
            const item = await this.findByName(name);
            console.log('ItemModel - deleteByName - 查询到的物品:', item);
            
            if (!item) {
                console.log('ItemModel - deleteByName - 物品不存在，名称:', name);
                return false;
            }
            
            console.log('ItemModel - deleteByName - 准备删除物品:', {
                id: item.id,
                _self: item._self
            });
            
            // 执行删除操作
            console.log('ItemModel - deleteByName - 开始执行删除操作');
            const { statusCode } = await itemsContainer.item(item.id).delete();
            console.log('ItemModel - deleteByName - 删除操作完成，状态码:', statusCode);
            
            if (statusCode !== 204) {
                console.log('ItemModel - deleteByName - 删除操作失败，状态码:', statusCode);
                throw new Error(`删除操作失败，状态码: ${statusCode}`);
            }
            
            console.log('ItemModel - deleteByName - 删除成功');
            return true;
        } catch (error) {
            console.error('ItemModel - deleteByName - 删除操作失败:', {
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
            console.log('ItemModel - delete - 开始删除物品，ID:', id);
            
            // 首先检查物品是否存在
            const item = await this.findById(id);
            console.log('ItemModel - delete - 查询到的物品:', item);
            
            if (!item) {
                console.log('ItemModel - delete - 物品不存在，ID:', id);
                return false;
            }
            
            console.log('ItemModel - delete - 准备删除物品:', {
                id: item.id,
                _self: item._self
            });
            
            // 执行删除操作
            console.log('ItemModel - delete - 开始执行删除操作');
            const { statusCode } = await itemsContainer.item(item.id).delete();
            console.log('ItemModel - delete - 删除操作完成，状态码:', statusCode);
            
            if (statusCode !== 204) {
                console.log('ItemModel - delete - 删除操作失败，状态码:', statusCode);
                throw new Error(`删除操作失败，状态码: ${statusCode}`);
            }
            
            console.log('ItemModel - delete - 删除成功');
            return true;
        } catch (error) {
            console.error('ItemModel - delete - 删除操作失败:', {
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