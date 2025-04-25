# FridgeGenie

FridgeGenie 是一个智能冰箱管理应用，帮助用户追踪和管理冰箱中的食物。

## 项目结构

```
FridgeGenie/
├── client/          # 前端 React Native 应用
├── server/          # 后端 Node.js 服务器
└── README.md        # 项目说明文档
```

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- Expo CLI
- iOS 模拟器或 Android 模拟器（可选）
- Expo Go 应用（用于在真机上测试）

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/HDC432/FridgeGenie.git
cd FridgeGenie
```

## 运行项目

### 1. 启动后端服务器

打开一个新的终端窗口，执行以下命令：

```bash
cd server
npm install
npm run dev
```

服务器将在 http://localhost:3001 运行

### 2. 启动前端应用

打开另一个新的终端窗口，执行以下命令：

```bash
cd client
npm install
npm start
```

启动后，你可以：
- 按 `i` 在 iOS 模拟器中运行
- 按 `a` 在 Android 模拟器中运行
- 使用手机扫描二维码在 Expo Go 应用中运行

## 开发说明

### 前端开发

- 使用 Expo Router 进行路由管理
- 使用 React Native 组件库
- 支持 TypeScript

### 后端开发

- 使用 Express.js 框架
- 使用 Azure Cosmos DB 作为数据库
- 支持 CORS

## 常见问题

### 1. 网络请求失败

如果遇到网络请求失败，请检查：
- 确保后端服务器正在运行
- 确保手机和电脑在同一个 Wi-Fi 网络下
- 检查 config/database.js 中的 API_URL 是否正确

### 2. 端口被占用

如果遇到端口被占用，可以：
- 使用 `lsof -i :端口号` 查看占用进程
- 使用 `kill -9 进程ID` 终止进程
- 或者修改配置文件使用其他端口

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE) 