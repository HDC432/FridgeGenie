const express = require('express');
const router = express.Router();
const ItemModel = require('../models/itemModel');

// 获取所有物品
router.get('/', async (req, res) => {
    try {
        const items = await ItemModel.findAll();
        res.json(items);
    } catch (error) {
        console.error('获取物品时出错:', error);
        res.status(500).json({ error: '获取物品失败' });
    }
});

// 添加新物品
router.post('/', async (req, res) => {
    try {
        const item = await ItemModel.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        console.error('添加物品时出错:', error);
        res.status(500).json({ error: '添加物品失败' });
    }
});

// 更新物品
router.put('/:id', async (req, res) => {
    try {
        const item = await ItemModel.update(req.params.id, req.body);
        res.json(item);
    } catch (error) {
        console.error('更新物品时出错:', error);
        res.status(500).json({ error: '更新物品失败' });
    }
});

// 删除物品
router.delete('/:id', async (req, res) => {
    try {
        await ItemModel.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('删除物品时出错:', error);
        res.status(500).json({ error: '删除物品失败' });
    }
});

module.exports = router; 