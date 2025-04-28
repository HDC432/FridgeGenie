const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/items', itemRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 