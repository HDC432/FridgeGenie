const express = require('express');
const router = express.Router();
const ItemModel = require('../models/itemModel');
const ItemService = require('../services/itemService');

// 获取所有物品
router.get('/', async (req, res) => {
    try {
        const items = await ItemModel.findAll();
        res.json(items);
    } catch (error) {
        console.error('Error getting items:', error);
        res.status(500).json({ error: 'Failed to get items' });
    }
});

// 获取家庭物品
router.get('/family/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;
        console.log('获取家庭物品，familyId:', familyId);
        const items = await ItemModel.findByFamilyId(familyId);
        console.log('查询结果:', items);
        res.json({ items });
    } catch (error) {
        console.error('获取家庭物品时出错:', error);
        res.status(500).json({ error: '获取家庭物品失败' });
    }
});

// 按名称获取物品
router.get('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const item = await ItemModel.findByName(name);
        if (!item) {
            return res.status(404).json({ error: '物品不存在' });
        }
        res.json(item);
    } catch (error) {
        console.error('获取物品时出错:', error);
        res.status(500).json({ error: '获取物品失败' });
    }
});

// 获取单个物品
router.get('/:id', async (req, res) => {
    try {
        const item = await ItemModel.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: '物品不存在' });
        }
        res.json(item);
    } catch (error) {
        console.error('获取物品时出错:', error);
        res.status(500).json({ error: '获取物品失败' });
    }
});

// 添加新物品
router.post('/', async (req, res) => {
    try {
        const { name, quantity, familyId } = req.body;
        
        // Validate required fields
        if (!name || quantity === undefined || !familyId) {
            return res.status(400).json({ error: 'Name, quantity, and familyId are required' });
        }

        // Create item using ItemService
        const item = await ItemService.createItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: error.message || 'Failed to add item' });
    }
});

// 按名称更新物品
router.put('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({ error: '数量是必需的' });
        }
        const item = await ItemModel.updateByName(name, { quantity });
        if (!item) {
            return res.status(404).json({ error: '物品不存在' });
        }
        res.json(item);
    } catch (error) {
        console.error('更新物品时出错:', error);
        res.status(500).json({ error: '更新物品失败' });
    }
});

// 更新物品
router.put('/:id', async (req, res) => {
    try {
        const item = await ItemModel.update(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: '物品不存在' });
        }
        res.json(item);
    } catch (error) {
        console.error('更新物品时出错:', error);
        res.status(500).json({ error: '更新物品失败' });
    }
});

// 按名称删除物品
router.delete('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const success = await ItemModel.deleteByName(name);
        if (!success) {
            return res.status(404).json({ error: '物品不存在' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('删除物品时出错:', error);
        res.status(500).json({ error: '删除物品失败' });
    }
});

// 删除物品
router.delete('/:id', async (req, res) => {
    try {
        const success = await ItemModel.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: '物品不存在' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('删除物品时出错:', error);
        res.status(500).json({ error: '删除物品失败' });
    }
});

module.exports = router; 