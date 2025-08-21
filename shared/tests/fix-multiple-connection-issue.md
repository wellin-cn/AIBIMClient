# 多用户连接问题修复方案

## 🔍 问题诊断

通过分析日志和代码，发现了以下问题：

### 1. 核心问题
- **在线用户管理逻辑冲突**：代码中同时存在阻止重复登录的检查和覆盖式插入
- **数据库设计局限**：`socket_id` 为主键，不支持同用户多设备登录
- **服务器实例冲突**：多个实例同时运行导致状态不一致

### 2. 具体表现
- 新客户端登录后，旧客户端的用户状态被同步/替换
- 日志显示 `EADDRINUSE` 错误，说明端口被占用
- 用户连接和断开频繁，状态管理混乱

## 🛠️ 修复方案

### 方案一：支持多设备登录（推荐）

修改数据库结构和逻辑，允许同一用户在多个设备上登录：

```sql
-- 修改在线用户表结构
CREATE TABLE IF NOT EXISTS online_users (
  socket_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  device_id TEXT,  -- 新增设备标识
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 添加复合索引
CREATE INDEX IF NOT EXISTS idx_online_users_username_device ON online_users(username, device_id);
```

修改 `socketService.ts` 中的用户加入逻辑：

```typescript
private async handleUserJoin(socket: Socket, data: any): Promise<void> {
  const validatedData = validateSocketData<{ username: string; deviceId?: string }>(schemas.userJoin, data);
  const { username, deviceId = socket.id } = validatedData;

  logger.info(`User attempting to join: ${username} (${socket.id})`);

  // 检查同一设备是否已经在线（可选）
  if (deviceId !== socket.id) {
    const existingDevice = await OnlineUserModel.findByUsernameAndDevice(username, deviceId);
    if (existingDevice) {
      // 踢掉旧连接
      this.io.to(existingDevice.socketId).emit('force_disconnect', { 
        reason: 'new_login_same_device' 
      });
      await OnlineUserModel.remove(existingDevice.socketId);
    }
  }

  // 检查在线用户数量限制（按设备数计算）
  const onlineCount = await OnlineUserModel.getCount();
  if (onlineCount >= config.MAX_ONLINE_USERS) {
    socket.emit('error', {
      message: 'Chat room is full',
      code: 'ROOM_FULL'
    });
    return;
  }

  // 查找或创建用户
  let user = await UserModel.findByUsername(username);
  if (!user) {
    user = await UserModel.create(username);
    await MessageModel.createSystemMessage(`欢迎 ${username} 加入聊天！`);
  } else {
    await UserModel.updateLastSeen(user.id);
    // 只有当用户完全离线时才发送回归消息
    const existingConnections = await OnlineUserModel.findAllByUsername(username);
    if (existingConnections.length === 0) {
      await MessageModel.createSystemMessage(`${username} 重新加入了聊天`);
    }
  }

  // 添加到在线用户列表
  const onlineUser = await OnlineUserModel.add(socket.id, user.id, username, deviceId);
  
  // 其余逻辑保持不变...
}
```

### 方案二：严格单设备登录

如果业务要求严格单设备登录，修改逻辑踢掉旧连接：

```typescript
private async handleUserJoin(socket: Socket, data: any): Promise<void> {
  // ... 验证逻辑 ...

  // 检查用户名是否已在线
  const existingOnlineUser = await OnlineUserModel.findByUsername(username);
  if (existingOnlineUser) {
    // 踢掉旧连接
    this.io.to(existingOnlineUser.socketId).emit('force_disconnect', { 
      reason: 'new_login' 
    });
    await OnlineUserModel.remove(existingOnlineUser.socketId);
    
    // 发送系统消息
    await MessageModel.createSystemMessage(`${username} 从另一个设备登录`);
  }

  // 继续正常登录流程...
}
```

### 方案三：修复数据库设计

修改 `OnlineUser.ts` 中的添加方法：

```typescript
static async add(socketId: string, userId: string, username: string, deviceId?: string): Promise<OnlineUser> {
  try {
    const now = new Date().toISOString();

    // 使用 INSERT 而不是 INSERT OR REPLACE
    await databaseManager.run(
      'INSERT INTO online_users (socket_id, user_id, username, device_id, joined_at, last_ping) VALUES (?, ?, ?, ?, ?, ?)',
      [socketId, userId, username, deviceId || socketId, now, now]
    );

    const onlineUser: OnlineUser = {
      socketId,
      userId,
      username,
      deviceId,
      joinedAt: new Date(now),
      lastPing: new Date(now),
    };

    logger.info(`User ${username} is now online (${socketId})`);
    return onlineUser;
  } catch (error) {
    // 如果是主键冲突，说明socket_id已存在，这通常不应该发生
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      logger.warn(`Socket ID ${socketId} already exists, removing old record`);
      await this.remove(socketId);
      return this.add(socketId, userId, username, deviceId);
    }
    logger.error('Error adding online user:', error);
    throw error;
  }
}
```

## 🚀 立即修复步骤

1. **检查并停止多个服务器实例**
```bash
# 查找占用3001端口的进程
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

2. **应用推荐的方案一修复**

3. **运行测试验证修复效果**
```bash
npm run test
```

## 📋 测试用例覆盖

创建的测试用例覆盖以下场景：
- ✅ 单用户正常连接
- ✅ 多用户同时连接  
- ✅ 重复用户名连接处理
- ✅ 消息广播功能
- ✅ 用户断开连接处理
- ✅ 并发连接压力测试
- ✅ 边界情况处理

运行测试可以验证修复效果并防止回归。