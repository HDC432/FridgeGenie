const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 导入路由
const userRoutes = require('./routes/userRoutes');
const familyRoutes = require('./routes/familyRoutes');
const itemRoutes = require('./routes/itemRoutes');

// 使用路由
app.use('/users', userRoutes);
app.use('/families', familyRoutes);
app.use('/items', itemRoutes);

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 