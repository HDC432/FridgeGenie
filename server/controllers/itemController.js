const ItemService = require('../services/itemService');

class ItemController {
    static async getAllItems(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));
            
            console.log('Pagination parameters:', { page, limit });
            
            const result = await ItemService.getAllItems(page, limit);
            res.json(result);
        } catch (error) {
            console.error('Failed to get item list:', error);
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
            console.log('Starting item deletion, ID:', id);
            
            const result = await ItemService.deleteItem(id);
            console.log('Deletion successful, result:', result);
            
            res.status(204).send();
        } catch (error) {
            console.error('Failed to delete item:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message || 'Failed to delete item',
                details: error.stack
            });
        }
    }
}

module.exports = ItemController; 