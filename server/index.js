const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const familyRoutes = require('./routes/familyRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
require('dotenv').config();

const app = express();

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS 配置
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 中间件
app.use(express.json());

// 用户相关路由
app.use('/users', userRoutes);

// 家庭相关路由
app.use('/families', familyRoutes);

// 物品相关路由
app.use('/items', itemRoutes);

// 健康相关路由
app.use('/health', healthRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 