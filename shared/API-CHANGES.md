# API变更通知 - 客户端适配指南

## 🚨 重要更新：用户信息同步问题修复

**影响范围**: Socket.io 事件监听  
**紧急程度**: 高（影响多用户连接体验）  
**需要客户端更新**: 是

---

## 📋 变更概述

为修复多用户登录时的用户信息同步问题，我们对 Socket.io 事件进行了以下重要更改：

### ⚡ 新增事件
- **事件名**: `user:new-member-joined`
- **用途**: 通知现有用户有新成员加入
- **替代**: 部分 `user:joined` 事件的功能

### 🔄 事件职责分离
- `user:joined`: 仅用于用户自身登录成功确认
- `user:new-member-joined`: 用于通知其他用户有新成员加入

---

## 📡 新增 Socket.io 事件定义

### `user:new-member-joined` 事件

**触发时机**: 当有新用户加入聊天室时，广播给其他已在线用户

**数据结构**:
```typescript
interface NewMemberJoinedData {
  newMember: OnlineUser      // 新加入的用户完整信息
  onlineUsers: OnlineUser[]  // 更新后的在线用户列表
}

interface OnlineUser {
  id: string           // 用户ID
  username: string     // 用户名
  socketId: string     // Socket连接ID
  joinedAt: number     // 加入时间戳
  status: 'online'     // 用户状态
  ipAddress?: string   // IP地址（可选）
}
```

**示例数据**:
```json
{
  "newMember": {
    "id": "user_123456",
    "username": "alice",
    "socketId": "socket_abc123",
    "joinedAt": 1640995200000,
    "status": "online",
    "ipAddress": "192.168.1.100"
  },
  "onlineUsers": [
    {
      "id": "user_789012",
      "username": "bob",
      "socketId": "socket_def456",
      "joinedAt": 1640995100000,
      "status": "online"
    },
    {
      "id": "user_123456",
      "username": "alice",
      "socketId": "socket_abc123",
      "joinedAt": 1640995200000,
      "status": "online"
    }
  ]
}
```

---

## 🔧 客户端迁移指南

### ⚠️ 重要：必须更新的代码

#### 1. 添加新事件监听器

```javascript
// 新增：监听新成员加入事件
socket.on('user:new-member-joined', (data) => {
  console.log(`新用户 ${data.newMember.username} 加入了聊天室`);
  
  // 更新在线用户列表
  updateOnlineUsersList(data.onlineUsers);
  
  // 显示加入通知
  showNotification(`${data.newMember.username} 加入了聊天室`);
  
  // 可选：播放提示音
  playNotificationSound();
});
```

#### 2. 修改现有 `user:joined` 事件处理

```javascript
// 修改前：处理所有用户加入
socket.on('user:joined', (data) => {
  // ❌ 错误：这里可能处理了其他用户的加入
  console.log('用户加入:', data.user.username);
  updateOnlineUsersList(data.onlineUsers);
});

// 修改后：仅处理自己的登录成功
socket.on('user:joined', (data) => {
  // ✅ 正确：只处理自己的登录成功
  console.log('我登录成功了:', data.user.username);
  console.log('服务器信息:', data.serverInfo);
  
  // 初始化用户状态
  currentUser = data.user;
  updateOnlineUsersList(data.onlineUsers);
  
  // 显示登录成功界面
  showChatInterface();
});
```

### 📝 完整示例代码

```javascript
class ChatClient {
  constructor() {
    this.socket = io('http://localhost:3001');
    this.currentUser = null;
    this.onlineUsers = [];
    
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    // 自己登录成功
    this.socket.on('user:joined', (data) => {
      this.currentUser = data.user;
      this.onlineUsers = data.onlineUsers;
      this.onLoginSuccess(data);
    });
    
    // 新成员加入通知
    this.socket.on('user:new-member-joined', (data) => {
      this.onlineUsers = data.onlineUsers;
      this.onNewMemberJoined(data.newMember);
    });
    
    // 用户离开
    this.socket.on('user:left', (data) => {
      this.onlineUsers = data.onlineUsers;
      this.onUserLeft(data.user);
    });
    
    // 在线用户列表更新
    this.socket.on('users:update', (data) => {
      this.onlineUsers = data.onlineUsers;
      this.updateUserList();
    });
  }
  
  onLoginSuccess(data) {
    console.log('登录成功！', {
      user: data.user,
      serverVersion: data.serverInfo.version,
      maxUsers: data.serverInfo.maxUsers,
      currentUsers: data.serverInfo.currentUsers
    });
    
    this.updateUserList();
    this.showChatInterface();
  }
  
  onNewMemberJoined(newMember) {
    console.log(`${newMember.username} 加入了聊天室`);
    
    // 更新UI
    this.updateUserList();
    this.showJoinNotification(newMember);
    
    // 可选：播放提示音
    this.playNotificationSound();
  }
  
  onUserLeft(user) {
    console.log(`${user.username} 离开了聊天室`);
    this.updateUserList();
    this.showLeaveNotification(user);
  }
  
  updateUserList() {
    // 更新在线用户列表UI
    const userListElement = document.getElementById('user-list');
    userListElement.innerHTML = this.onlineUsers
      .map(user => `<div class="user-item">${user.username}</div>`)
      .join('');
  }
}

// 使用示例
const chat = new ChatClient();
```

---

## 🔄 向后兼容性

### ✅ 保持兼容的部分
- `user:joined` 事件数据结构**保持不变**
- `user:left` 事件**保持不变**
- `users:update` 事件**保持不变**
- 所有消息相关事件**保持不变**

### ⚠️ 需要更新的部分
- 必须添加 `user:new-member-joined` 事件监听
- 需要移除 `user:joined` 事件中对其他用户加入的处理逻辑

---

## 🧪 测试建议

### 1. 多用户连接测试
```javascript
// 测试场景：两个用户依次登录
// 预期：第二个用户登录时，第一个用户收到 user:new-member-joined 事件

// 用户A登录
socketA.emit('user:join', { username: 'Alice' });

// 用户B登录
socketB.emit('user:join', { username: 'Bob' });

// 验证：用户A应该收到新成员通知
socketA.on('user:new-member-joined', (data) => {
  console.assert(data.newMember.username === 'Bob');
  console.assert(data.onlineUsers.length === 2);
});
```

### 2. 用户信息一致性测试
```javascript
// 验证用户信息不会被其他用户的加入影响
let initialUserId = null;

socket.on('user:joined', (data) => {
  initialUserId = data.user.id;
});

socket.on('user:new-member-joined', (data) => {
  // 验证当前用户ID没有改变
  const currentUserInList = data.onlineUsers.find(u => u.id === initialUserId);
  console.assert(currentUserInList !== undefined, '当前用户应该仍在列表中');
});
```

---

## 📊 性能影响

- **网络开销**: 几乎无影响（只是事件名称变更）
- **内存使用**: 无影响
- **处理性能**: 无影响
- **兼容性**: 需要客户端更新代码

---

## 🆘 迁移支持

### 常见问题

**Q: 如果不更新客户端会怎样？**  
A: 客户端将无法收到新成员加入通知，但其他功能正常。

**Q: 是否需要同时监听两个事件？**  
A: 是的，`user:joined` 用于自己登录，`user:new-member-joined` 用于其他用户加入。

**Q: 数据格式有变化吗？**  
A: `user:joined` 的数据格式保持不变，新增的 `user:new-member-joined` 使用不同的数据结构。

### 联系支持
- 技术支持邮箱: tech-support@example.com
- 开发者文档: [链接]
- API测试工具: [链接]

---

## 📅 时间线

- **修复发布**: 2025-01-XX
- **建议更新时间**: 2025-01-XX 之前
- **强制更新时间**: 2025-02-XX（之后可能移除兼容支持）

---

## 🆕 消息发送接收API更新 (v1.2.0)

### 新增消息确认机制

为解决消息发送超时问题，服务端现在会对每条消息发送请求进行确认响应：

#### 1. 消息发送成功确认
**事件名**: `message:sent`

**数据结构**:
```typescript
interface MessageSentData {
  tempId: string        // 临时ID，用于客户端关联
  messageId: string     // 服务端生成的消息ID
  timestamp: number     // 消息创建时间戳
  status: 'success'     // 发送状态
}
```

**示例数据**:
```json
{
  "tempId": "temp_1754285293944",
  "messageId": "8fc1ae0e-cf36-428f-b55d-45881fb78024",
  "timestamp": 1754285293955,
  "status": "success"
}
```

#### 2. 消息发送失败通知
**事件名**: `message:send:error`

**数据结构**:
```typescript
interface MessageSendErrorData {
  tempId: string        // 临时ID
  code: string          // 错误代码
  message: string       // 错误描述
  details?: any         // 详细错误信息
}
```

**常见错误代码**:
- `USER_NOT_FOUND`: 用户未找到
- `RATE_LIMIT`: 消息发送频率限制
- `SEND_FAILED`: 发送失败
- `VALIDATION_ERROR`: 数据验证失败

### 客户端实现示例

```javascript
class MessageHandler {
  constructor(socket) {
    this.socket = socket;
    this.pendingMessages = new Map(); // 存储待确认的消息
  }
  
  // 发送消息
  sendMessage(content) {
    const tempId = 'temp_' + Date.now();
    const messageData = {
      type: 'text',
      content: content,
      timestamp: Date.now(),
      tempId: tempId
    };
    
    // 存储待确认的消息
    this.pendingMessages.set(tempId, {
      data: messageData,
      sentAt: Date.now(),
      timeout: setTimeout(() => {
        this.handleMessageTimeout(tempId);
      }, 10000) // 10秒超时
    });
    
    // 发送消息
    this.socket.emit('message:send', messageData);
  }
  
  // 监听消息发送成功确认
  onMessageSent(data) {
    const pending = this.pendingMessages.get(data.tempId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingMessages.delete(data.tempId);
      
      // 更新UI显示消息已发送
      this.updateMessageStatus(data.tempId, 'sent', data.messageId);
    }
  }
  
  // 监听消息发送失败
  onMessageSendError(data) {
    const pending = this.pendingMessages.get(data.tempId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingMessages.delete(data.tempId);
      
      // 显示错误并允许重试
      this.showErrorMessage(data.message);
      this.updateMessageStatus(data.tempId, 'failed');
    }
  }
  
  // 处理消息超时
  handleMessageTimeout(tempId) {
    const pending = this.pendingMessages.get(tempId);
    if (pending) {
      this.pendingMessages.delete(tempId);
      this.updateMessageStatus(tempId, 'timeout');
      this.showErrorMessage('消息发送超时，请重试');
    }
  }
  
  // 监听接收到的消息
  onMessageReceived(data) {
    this.displayMessage(data);
  }
  
  // 设置事件监听
  setupEventListeners() {
    this.socket.on('message:sent', (data) => this.onMessageSent(data));
    this.socket.on('message:send:error', (data) => this.onMessageSendError(data));
    this.socket.on('message:received', (data) => this.onMessageReceived(data));
  }
}
```

### 完整的事件监听列表

客户端需要监听以下所有事件：

```javascript
// 用户相关事件
socket.on('user:joined', (data) => { /* 自己登录成功 */ });
socket.on('user:new-member-joined', (data) => { /* 新成员加入 */ });
socket.on('user:left', (data) => { /* 用户离开 */ });
socket.on('users:update', (data) => { /* 用户列表更新 */ });

// 消息相关事件
socket.on('message:sent', (data) => { /* 消息发送成功确认 */ });
socket.on('message:send:error', (data) => { /* 消息发送失败 */ });
socket.on('message:received', (data) => { /* 接收到消息 */ });

// 错误事件
socket.on('error', (data) => { /* 一般错误 */ });
socket.on('connect_error', (error) => { /* 连接错误 */ });
socket.on('disconnect', (reason) => { /* 连接断开 */ });
```

---

**🎯 重要更新**: 消息发送超时问题已修复，客户端现在可以收到明确的发送确认或错误通知。请按照上述示例更新客户端代码以获得最佳体验！

---

## ✅ 客户端适配状态

### 已完成的适配工作

1. **SocketService 更新** ✅
   - 添加了 `user:new-member-joined` 事件监听
   - 修改了 `user:joined` 事件处理逻辑（仅用于自身登录确认）
   - 添加了 `user:left` 事件的新API规范支持
   - 保留了旧事件的兼容性支持

2. **Hook 层更新** ✅
   - 更新了 `useSocket` Hook 以正确处理新的事件分离逻辑
   - 添加了专门的新成员加入监听器
   - 集成了通知系统

3. **通知系统** ✅
   - 创建了 `useNotifications` Hook 来管理通知
   - 创建了 `Notification` 和 `NotificationManager` UI组件
   - 在主聊天页面集成了通知显示
   - 添加了用户加入/离开的专用通知方法

4. **类型定义完善** ✅
   - 更新了 Socket 事件接口以匹配新API规范
   - 保持了与现有 `shared/types/user.ts` 中定义的类型一致性
   - 添加了通知相关的类型定义

### 具体实现的功能

- ✅ 新成员加入时，现有用户会收到通知（系统消息 + 桌面通知）
- ✅ 用户自己登录时不会收到自己的加入通知
- ✅ 登录成功时显示欢迎通知
- ✅ 连接失败时显示错误通知
- ✅ 用户离开时显示离开通知
- ✅ 通知支持自动消失和手动关闭
- ✅ 通知系统支持不同类型（成功、错误、警告、信息）

### 测试建议

客户端现在完全符合新的API规范，建议进行以下测试：

1. **多用户连接测试**：多个用户依次登录，验证新成员通知是否正确显示
2. **登录体验测试**：验证登录成功通知和初始用户列表加载
3. **用户离开测试**：验证用户离开时的通知显示和用户列表更新
4. **通知系统测试**：验证通知的显示、自动消失和手动关闭功能

客户端已全面适配新的 Socket.io 事件规范，可以提供最佳的多用户聊天体验！