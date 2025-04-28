const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = 3001;

// 中间件
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Azure Cosmos DB 配置
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

// 数据库和容器引用
const database = cosmosClient.database('fridgegenie-db');
const container = database.container('items');

// 导入路由
const userRoutes = require('./routes/userRoutes');

// 使用路由
app.use('/api/users', userRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// API 路由
// 获取所有物品
app.get('/items', async (req, res) => {
    try {
        const { resources } = await container.items.query("SELECT * from c").fetchAll();
        res.json(resources);
    } catch (error) {
        console.error('获取物品时出错:', error);
        res.status(500).json({ error: '获取物品失败' });
    }
});

// 添加新物品
app.post('/items', async (req, res) => {
    try {
        const { resource } = await container.items.create(req.body);
        res.status(201).json(resource);
    } catch (error) {
        console.error('添加物品时出错:', error);
        res.status(500).json({ error: '添加物品失败' });
    }
});

// 更新物品
app.put('/items/:id', async (req, res) => {
    try {
        const { resource } = await container.item(req.params.id).replace(req.body);
        res.json(resource);
    } catch (error) {
        console.error('更新物品时出错:', error);
        res.status(500).json({ error: '更新物品失败' });
    }
});

// 删除物品
app.delete('/items/:id', async (req, res) => {
    try {
        await container.item(req.params.id).delete();
        res.status(204).send();
    } catch (error) {
        console.error('删除物品时出错:', error);
        res.status(500).json({ error: '删除物品失败' });
    }
});

// 测试路由
app.get('/', (req, res) => {
    res.json({ message: 'FridgeGenie API 服务器运行中' });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
}); 