const express = require('express');
const cors = require('cors');
const ItemController = require('./controllers/itemController');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3001;

// CORS配置
app.use(cors({
  origin: ['http://localhost:8083', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 中间件
app.use(express.json());

// 路由
app.use('/users', userRoutes);
app.get('/items', ItemController.getAllItems);
app.get('/items/:id', ItemController.getItemById);
app.post('/items', ItemController.createItem);
app.put('/items/:id', ItemController.updateItem);
app.delete('/items/:id', ItemController.deleteItem);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
}); 