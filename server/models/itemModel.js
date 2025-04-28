const { itemsContainer } = require('../config/database');

class ItemModel {
    static async findAll() {
        console.log('ItemModel - findAll - 开始查询所有物品');
        const { resources } = await itemsContainer.items.readAll().fetchAll();
        console.log('ItemModel - findAll - 查询结果:', resources);
        return resources;
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
        const { resource } = await itemsContainer.items.create(item);
        console.log('ItemModel - create - 创建结果:', resource);
        return resource;
    }

    static async update(id, item) {
        console.log('ItemModel - update - 开始更新物品:', { id, item });
        const { resource } = await itemsContainer.items.upsert(item);
        console.log('ItemModel - update - 更新结果:', resource);
        return resource;
    }

    static async delete(id) {
        try {
            console.log('ItemModel - delete - 开始删除物品，ID:', id);
            
            // 首先检查物品是否存在
            const item = await this.findById(id);
            console.log('ItemModel - delete - 查询到的物品:', item);
            
            if (!item) {
                console.log('ItemModel - delete - 物品不存在，ID:', id);
                throw new Error('物品不存在');
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
            return { 
                success: true, 
                message: '物品已成功删除',
                id,
                timestamp: new Date().toISOString()
            };
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