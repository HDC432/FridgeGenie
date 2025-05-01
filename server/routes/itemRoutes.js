const express = require('express');
const router = express.Router();
const ItemModel = require('../models/itemModel');
const ItemService = require('../services/itemService');

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await ItemModel.findAll();
        res.json(items);
    } catch (error) {
        console.error('Error getting items:', error);
        res.status(500).json({ error: 'Failed to get items' });
    }
});

// Get family items
router.get('/family/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;
        console.log('Getting family items, familyId:', familyId);
        const items = await ItemModel.findByFamilyId(familyId);
        console.log('Query results:', items);
        res.json({ items });
    } catch (error) {
        console.error('Error getting family items:', error);
        res.status(500).json({ error: 'Failed to get family items' });
    }
});

// Get item by name
router.get('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const item = await ItemModel.findByName(name);
        if (!item) {
            return res.status(404).json({ error: 'Item does not exist' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error getting item:', error);
        res.status(500).json({ error: 'Failed to get item' });
    }
});

// Get single item
router.get('/:id', async (req, res) => {
    try {
        const item = await ItemModel.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item does not exist' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error getting item:', error);
        res.status(500).json({ error: 'Failed to get item' });
    }
});

// Add new item
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

// Update item by name
router.put('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({ error: 'Quantity is required' });
        }
        const item = await ItemModel.updateByName(name, { quantity });
        if (!item) {
            return res.status(404).json({ error: 'Item does not exist' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Update item
router.put('/:id', async (req, res) => {
    try {
        const item = await ItemModel.update(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: 'Item does not exist' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item by name
router.delete('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const success = await ItemModel.deleteByName(name);
        if (!success) {
            return res.status(404).json({ error: 'Item does not exist' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Delete item
router.delete('/:id', async (req, res) => {
    try {
        const success = await ItemModel.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Item does not exist' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router; 