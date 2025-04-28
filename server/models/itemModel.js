const { itemsContainer } = require('../config/database');

class ItemModel {
    static async findAll() {
        const { resources } = await itemsContainer.items.readAll().fetchAll();
        return resources;
    }

    static async findById(id) {
        const { resource } = await itemsContainer.items.item(id).read();
        return resource;
    }

    static async create(item) {
        const { resource } = await itemsContainer.items.create(item);
        return resource;
    }

    static async update(id, item) {
        const { resource } = await itemsContainer.items.item(id).replace(item);
        return resource;
    }

    static async delete(id) {
        try {
            console.log('开始从数据库删除物品，ID:', id);
            
            // 首先检查物品是否存在
            const item = await this.findById(id);
            if (!item) {
                console.log('物品不存在，ID:', id);
                throw new Error('物品不存在');
            }
            
            console.log('找到要删除的物品:', item);
            
            // 执行删除操作
            const { statusCode } = await itemsContainer.items.item(id).delete();
            console.log('数据库删除响应状态码:', statusCode);
            
            if (statusCode !== 204) {
                throw new Error(`删除操作失败，状态码: ${statusCode}`);
            }
            
            return { 
                success: true, 
                message: '物品已成功删除',
                id,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('数据库删除操作失败:', {
                id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = ItemModel; 