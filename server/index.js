const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const familyRoutes = require('./routes/familyRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 中间件
app.use(cors());
app.use(express.json());

// 用户相关路由
app.use('/users', userRoutes);

// 家庭相关路由
app.use('/families', familyRoutes);

// 物品相关路由
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