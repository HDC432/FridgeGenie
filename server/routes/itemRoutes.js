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
        console.error('获取物品时出错:', error);
        res.status(500).json({ error: '获取物品失败' });
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