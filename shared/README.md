<<<<<<< HEAD
# IM聊天系统服务端

基于Node.js + Express + Socket.io + SQLite构建的实时聊天服务端。

## 🚀 功能特性

✅ **基础架构**
- ✅ TypeScript + Node.js开发环境
- ✅ Express Web框架
- ✅ SQLite轻量级数据库
- ✅ Winston日志系统
- ✅ 环境配置管理

✅ **数据库**
- ✅ 用户表（users）
- ✅ 消息表（messages）
- ✅ 在线用户表（online_users）
- ✅ 数据库连接管理
- ✅ 事务支持

✅ **RESTful API**
- ✅ `GET /api/health` - 健康检查
- ✅ `GET /api/messages` - 历史消息查询
- ✅ `GET /api/messages/recent` - 最近消息
- ✅ `GET /api/messages/stats` - 消息统计

✅ **WebSocket服务**
- ✅ Socket.io集成
- ✅ 用户连接管理
- ✅ 实时消息广播
- ✅ 用户进出通知
- ✅ 心跳检测

✅ **安全特性**
- ✅ 输入验证（Joi）
- ✅ 频率限制
- ✅ CORS配置
- ✅ 安全头设置
- ✅ 错误处理

## 📋 技术栈

- **运行时**: Node.js 16+
- **框架**: Express 4.18
- **WebSocket**: Socket.io 4.7
- **数据库**: SQLite 3
- **语言**: TypeScript 4.9
- **日志**: Winston 3.8
- **验证**: Joi 17.9

## 🛠 快速开始

### 环境要求

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境变量文件：
```bash
cp .env.example .env
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

### 构建生产版本

```bash
npm run build
npm start
```

## 📚 API文档

### 健康检查

```http
GET /api/health
```

响应：
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-XX",
    "uptime": 3600,
    "connections": 5,
    "version": "1.0.0",
    "database": "connected"
  }
}
```

### 历史消息

```http
GET /api/messages?limit=50&before=timestamp
```

### WebSocket事件

#### 用户加入
```javascript
socket.emit('user:join', { username: 'Alice' });
```

#### 发送消息
```javascript
socket.emit('message:send', {
  type: 'text',
  content: 'Hello world!'
});
```

#### 接收消息
```javascript
socket.on('message:received', (message) => {
  console.log(message);
});
```

## 📁 项目结构

```
server/
├── src/
│   ├── app.ts                 # Express应用配置
│   ├── server.ts              # 服务器启动入口
│   ├── config/                # 配置管理
│   ├── controllers/           # 路由控制器
│   │   ├── healthController.ts
│   │   └── messageController.ts
│   ├── database/              # 数据库
│   │   ├── connection.ts      # 数据库连接
│   │   └── schema.sql         # 表结构
│   ├── middleware/            # 中间件
│   │   ├── errorHandler.ts    # 错误处理
│   │   ├── security.ts        # 安全中间件
│   │   └── validation.ts      # 输入验证
│   ├── models/                # 数据模型
│   │   ├── User.ts
│   │   ├── Message.ts
│   │   └── OnlineUser.ts
│   ├── routes/                # 路由
│   │   └── api.ts
│   ├── services/              # 业务服务
│   │   └── socketService.ts   # Socket.io服务
│   ├── types/                 # TypeScript类型
│   │   └── index.ts
│   └── utils/                 # 工具函数
│       └── logger.ts          # 日志工具
├── data/                      # SQLite数据库文件
├── logs/                      # 日志文件
├── uploads/                   # 文件上传目录
└── package.json
```

## 🧪 测试

项目包含完整的测试套件，位于 `tests/` 目录：

### 快速测试验证
```bash
# 运行所有测试
./tests/run-all-tests.sh

# 运行核心验证测试
node tests/final-verification.test.js

# 运行完整功能测试
node tests/complete-feature.test.js
```

### 测试覆盖范围
- ✅ 多用户连接管理
- ✅ 用户信息同步验证
- ✅ 消息发送接收功能
- ✅ 用户名冲突检测
- ✅ Socket.io事件处理
- ✅ 数据库操作完整性

### 专项测试
- **用户同步问题修复验证** - 确保多用户登录时信息不会混淆
- **实时消息传递测试** - 验证消息在用户间正确传递
- **连接状态管理测试** - 验证用户上线下线状态正确更新

详细测试说明请参考 [`tests/README.md`](tests/README.md)

## 📈 监控

服务器提供以下监控能力：

- 健康检查接口
- Winston结构化日志
- 在线用户统计
- 消息处理量统计
- 系统运行时间

## 🔧 配置选项

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| NODE_ENV | development | 运行环境 |
| PORT | 3001 | 服务端口 |
| DATABASE_PATH | ./data/app.db | 数据库路径 |
| LOG_LEVEL | debug | 日志级别 |
| MAX_ONLINE_USERS | 100 | 最大在线用户数 |
| MAX_MESSAGE_LENGTH | 1000 | 最大消息长度 |

## 🚀 部署

### Docker部署（推荐）

```bash
# 构建镜像
docker build -t im-chat-server .

# 运行容器
docker run -p 3001:3001 -v $(pwd)/data:/app/data im-chat-server
```

### PM2部署

```bash
npm run build
pm2 start dist/server.js --name "im-chat-server"
```

## 🛡 安全考虑

- 输入验证和清理
- 频率限制防止滥用
- 安全HTTP头设置
- 错误信息不泄露敏感数据
- 数据库连接安全

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**注意**: 这是基础版本，后续可以扩展：
- 文件传输功能
- 群组聊天
- 用户认证
- 音视频通话信令
=======
# Shared Library - IM聊天系统公共库

## 📖 概述

这是IM聊天系统的共享代码库，包含前后端通用的类型定义、接口规范、工具函数等。通过软链接的方式同步到server和client项目中。

## 🚨 重要更新通知

### v1.1.0 - 用户信息同步问题修复 (2025-01-XX)

**⚠️ 需要客户端更新**: 为修复多用户登录时的用户信息同步问题，我们对Socket.io事件进行了重要更改。

**关键变更**:
- 新增 `user:new-member-joined` 事件
- `user:joined` 事件职责调整（仅用于自身登录确认）

**🔧 快速迁移**:
```javascript
// 新增：监听新成员加入
socket.on('user:new-member-joined', (data) => {
  console.log(`${data.newMember.username} 加入了聊天室`);
  updateOnlineUsers(data.onlineUsers);
});
```

📖 **详细信息**: 
- 🚨 [客户端紧急更新通知](./CLIENT-UPDATE-NOTICE.md) ← **立即查看**
- [完整变更说明](./API-CHANGES.md)
- [客户端迁移指南](./MIGRATION-GUIDE.md)
- [详细发布说明](./RELEASE-NOTES.md)
- [版本变更日志](./CHANGELOG.md)
- [文档导航索引](./INDEX.md)

## 📁 目录结构

```
shared/
├── README.md                    # 本文件
├── CHANGELOG.md                 # 变更日志
├── API-CHANGES.md               # API变更通知
├── MIGRATION-GUIDE.md           # 客户端迁移指南
├── CLIENT-UPDATE-NOTICE.md      # 🚨 客户端紧急更新通知
├── RELEASE-NOTES.md             # 详细发布说明
├── INDEX.md                     # 文档导航索引
├── types/                       # TypeScript类型定义
│   ├── index.ts                 # 导出所有类型
│   ├── user.ts                  # 用户相关类型
│   ├── message.ts               # 消息相关类型
│   ├── socket.ts                # Socket事件类型
│   └── api.ts                   # API接口类型
├── constants/                   # 常量定义
│   ├── index.ts                 # 导出所有常量
│   ├── events.ts                # Socket事件常量
│   ├── errors.ts                # 错误码常量
│   └── config.ts                # 配置常量
├── validators/                  # 数据验证规则
│   ├── index.ts                 # 导出所有验证器
│   ├── user.ts                  # 用户数据验证
│   └── message.ts              # 消息数据验证
├── utils/                       # 工具函数
│   ├── index.ts                 # 导出所有工具函数
│   ├── format.ts                # 格式化工具
│   └── validate.ts              # 验证工具
└── docs/                        # 文档
    ├── api-spec.md              # API接口规范
    ├── socket-events.md         # Socket事件文档
    └── data-models.md           # 数据模型文档
```

## 🔧 使用方式

### 在Server项目中使用
```typescript
import { User, Message, SocketEvents } from '@shared/types'
import { USER_EVENTS, ERROR_CODES } from '@shared/constants'
import { validateUserName } from '@shared/validators'
```

### 在Client项目中使用
```typescript
import { User, Message, ApiResponse } from '@shared/types'
import { SOCKET_EVENTS, MAX_MESSAGE_LENGTH } from '@shared/constants'
import { formatTimestamp } from '@shared/utils'
```

## 📋 开发规范

### 类型定义规范
- 使用PascalCase命名接口和类型
- 所有接口必须导出并在index.ts中重新导出
- 添加详细的JSDoc注释

### 常量定义规范
- 使用UPPER_SNAKE_CASE命名常量
- 按功能模块分组织
- 提供默认值和说明注释

### 变更管理
- 任何接口变更必须更新CHANGELOG.md
- 破坏性变更需要版本号升级
- 新增功能需要添加对应的文档

## 🚀 版本管理

- **主版本号**：破坏性变更
- **次版本号**：新增功能，向后兼容
- **修订版本号**：Bug修复

## 📝 贡献指南

1. 在shared目录进行修改
2. 更新相关文档
3. 记录CHANGELOG
4. 确保两端项目都能正常编译
5. 提交变更并推送

---

**注意**：此库的变更会同时影响server和client项目，请谨慎操作并充分测试。
>>>>>>> c762bd3d405720d5537ec630c1b27f7c75759c44
