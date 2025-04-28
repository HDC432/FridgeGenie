const express = require('express');
const cors = require('cors');
const ItemController = require('./controllers/itemController');

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
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