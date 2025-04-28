const ItemService = require('../services/itemService');

class ItemController {
    static async getAllItems(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));
            
            console.log('请求分页参数:', { page, limit });
            
            const result = await ItemService.getAllItems(page, limit);
            res.json(result);
        } catch (error) {
            console.error('获取物品列表失败:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getItemById(req, res) {
        try {
            const { id } = req.params;
            const item = await ItemService.getItemById(id);
            res.json(item);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async createItem(req, res) {
        try {
            const newItem = await ItemService.createItem(req.body);
            res.status(201).json(newItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateItem(req, res) {
        try {
            const { id } = req.params;
            const updatedItem = await ItemService.updateItem(id, req.body);
            res.json(updatedItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async deleteItem(req, res) {
        try {
            const { id } = req.params;
            console.log('开始删除物品，ID:', id);
            
            const result = await ItemService.deleteItem(id);
            console.log('删除成功，结果:', result);
            
            res.status(204).send();
        } catch (error) {
            console.error('删除物品失败:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message || '删除物品失败',
                details: error.stack
            });
        }
    }
}

module.exports = ItemController; 