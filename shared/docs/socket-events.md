# Socket.io事件规范文档

## 📡 连接规范

### 连接配置
```typescript
const socketConfig = {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  reconnectionDelayMax: 5000
}
```

### 连接流程
```
1. Client连接Socket服务器
2. Server触发'connection'事件
3. Client发送'user:join'事件进行身份验证
4. Server响应'user:joined'或错误事件
5. 开始正常通信
```

## 📤 客户端发送事件

### 1. 用户加入
**事件名**: `user:join`

**数据格式**:
```typescript
interface UserJoinData {
  username: string        // 用户名，1-20字符
  version?: string        // 客户端版本，可选
}
```

**示例**:
```typescript
socket.emit('user:join', {
  username: 'alice',
  version: '1.0.0'
})
```

### 2. 发送消息
**事件名**: `message:send`

**数据格式**:
```typescript
interface MessageSendData {
  type: 'text' | 'system'
  content: string         // 消息内容，最大1000字符
  timestamp: number       // 客户端时间戳
  tempId?: string        // 临时ID，用于状态跟踪
}
```

**示例**:
```typescript
socket.emit('message:send', {
  type: 'text',
  content: 'Hello everyone!',
  timestamp: Date.now(),
  tempId: 'temp_123456'
})
```

### 3. 文件上传开始（Phase 2功能）
**事件名**: `file:upload:start`

**数据格式**:
```typescript
interface FileUploadStartData {
  fileName: string           // 原始文件名
  fileSize: number           // 文件大小（字节）
  mimeType: string           // 文件MIME类型
  tempId: string             // 临时ID，用于跟踪上传状态
}
```

**示例**:
```typescript
socket.emit('file:upload:start', {
  fileName: 'document.pdf',
  fileSize: 2621440,
  mimeType: 'application/pdf',
  tempId: 'temp_file_123456'
})
```

### 4. 文件上传数据块（Phase 2功能）
**事件名**: `file:upload:chunk`

**数据格式**:
```typescript
interface FileUploadChunkData {
  tempId: string             // 临时ID
  chunkIndex: number         // 数据块索引
  chunkData: string          // Base64编码的文件数据
  isLastChunk: boolean       // 是否为最后一块
}
```

### 5. 输入状态（可选功能）
**事件名**: `typing:start` / `typing:stop`

**数据格式**:
```typescript
interface TypingData {
  username: string
  timestamp: number
}
```

**示例**:
```typescript
// 开始输入
socket.emit('typing:start', {
  username: 'alice',
  timestamp: Date.now()
})

// 停止输入
socket.emit('typing:stop', {
  username: 'alice',
  timestamp: Date.now()
})
```

### 6. 用户离开
**事件名**: `user:leave`

**数据格式**:
```typescript
interface UserLeaveData {
  reason?: string         // 离开原因，可选
}
```

**示例**:
```typescript
socket.emit('user:leave', {
  reason: 'user_quit'
})
```

## 📥 服务端发送事件

### 1. 用户加入成功
**事件名**: `user:joined`

**说明**: 用户自己加入成功后收到的确认事件

**数据格式**:
```typescript
interface UserJoinedData {
  user: OnlineUser        // 当前用户完整信息
  onlineUsers: OnlineUser[] // 当前在线用户列表
  serverInfo: {
    version: string
    maxUsers: number
    currentUsers: number
  }
}
```

### 1.1. 新成员加入通知
**事件名**: `user:new-member-joined`

**说明**: 其他用户加入时，现有用户收到的通知事件

**数据格式**:
```typescript
interface NewMemberJoinedData {
  newMember: OnlineUser   // 新加入的用户信息
  onlineUsers: OnlineUser[] // 更新后的在线用户列表
}
```

### 2. 用户加入失败
**事件名**: `user:join:error`

**数据格式**:
```typescript
interface UserJoinErrorData {
  code: string            // 错误码
  message: string         // 错误信息
  details?: any          // 详细信息
}
```

**示例**:
```typescript
{
  code: 'USERNAME_TAKEN',
  message: '用户名已被使用',
  details: {
    suggestions: ['alice1', 'alice_2025']
  }
}
```

### 3. 消息接收
**事件名**: `message:received`

**数据格式**:
```typescript
interface MessageReceivedData {
  id: string              // 消息唯一ID
  type: 'text' | 'file' | 'system'
  content: string
  sender: {
    id: string
    username: string
  }
  timestamp: number       // 服务器时间戳
  fileUrl?: string       // 文件URL（如果是文件消息）
  fileName?: string      // 文件名（如果是文件消息）
  fileSize?: number      // 文件大小（如果是文件消息）
}
```

### 4. 消息发送确认
**事件名**: `message:sent`

**数据格式**:
```typescript
interface MessageSentData {
  tempId: string         // 客户端临时ID
  messageId: string      // 服务器生成的消息ID
  timestamp: number      // 服务器时间戳
}
```

### 5. 消息发送失败
**事件名**: `message:send:error`

**数据格式**:
```typescript
interface MessageSendErrorData {
  tempId: string         // 客户端临时ID
  code: string           // 错误码
  message: string        // 错误信息
}
```

### 6. 用户列表更新
**事件名**: `users:update`

**数据格式**:
```typescript
interface UsersUpdateData {
  type: 'user_joined' | 'user_left'
  user: {
    id: string
    username: string
  }
  onlineUsers: User[]    // 更新后的在线用户列表
  onlineCount: number    // 在线用户数量
}
```

### 7. 用户离开通知
**事件名**: `user:left`

**数据格式**:
```typescript
interface UserLeftData {
  user: {
    id: string
    username: string
  }
  reason?: string        // 离开原因
  onlineUsers: User[]    // 更新后的用户列表
}
```

### 8. 输入状态通知
**事件名**: `typing:update`

**数据格式**:
```typescript
interface TypingUpdateData {
  type: 'start' | 'stop'
  user: {
    id: string
    username: string
  }
  timestamp: number
}
```

### 9. 文件上传进度（Phase 2功能）
**事件名**: `file:upload:progress`

**数据格式**:
```typescript
interface FileUploadProgressData {
  tempId: string
  bytesUploaded: number
  totalBytes: number
  percentage: number
  uploadSpeed?: number   // 上传速度（字节/秒）
}
```

### 10. 文件上传完成（Phase 2功能）
**事件名**: `file:upload:complete`

**数据格式**:
```typescript
interface FileUploadCompleteData {
  tempId: string
  fileId: string
  fileUrl: string
  fileName: string
  fileSize: number
  message: FileMessage   // 自动生成的文件消息
}
```

### 11. 文件上传失败（Phase 2功能）
**事件名**: `file:upload:error`

**数据格式**:
```typescript
interface FileUploadErrorData {
  tempId: string
  code: string           // 错误码：FILE_TOO_LARGE, INVALID_TYPE, STORAGE_FULL等
  message: string        // 错误信息
  details?: any         // 详细信息
}
```

### 12. 系统通知
**事件名**: `system:notification`

**数据格式**:
```typescript
interface SystemNotificationData {
  type: 'info' | 'warning' | 'error'
  message: string
  timestamp: number
  persistent?: boolean   // 是否持久显示
}
```

## 🔄 事件流程图

### 用户加入流程
```
Client                    Server
  |                        |
  |---- user:join -------->|
  |                        |-- 验证用户名
  |                        |-- 创建用户记录
  |                        |-- 更新在线列表
  |                        |
  |<--- user:joined -------|-- 成功响应
  |<--- users:update ------|-- 广播给其他用户
  |<--- message:received --|-- 系统消息通知
```

### 消息发送流程
```
Client                    Server
  |                        |
  |---- message:send ----->|
  |                        |-- 验证消息格式
  |                        |-- 存储到数据库
  |                        |-- 生成消息ID
  |                        |
  |<--- message:sent ------|-- 发送确认
  |<--- message:received --|-- 广播给所有用户（包括发送者）
```

## ⚠️ 错误处理

### 连接错误
- `connect_error`: 连接失败
- `connect_timeout`: 连接超时
- `disconnect`: 连接断开

### 业务错误
- 错误事件统一以 `:error` 后缀命名
- 错误数据包含 `code`, `message`, `details` 字段
- 客户端应对所有错误事件进行处理

### 重连机制
```typescript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // 服务器主动断开，手动重连
    socket.connect()
  }
  // 其他情况自动重连
})
```

## 📊 性能指标

- **事件处理延迟**: < 100ms（局域网环境）
- **并发连接数**: 支持至少100个并发连接
- **消息吞吐量**: 每秒处理1000条消息
- **内存使用**: 每连接 < 50KB内存占用

## 🧪 测试用例

### 连接测试
- [ ] 正常连接建立
- [ ] 连接断开和重连
- [ ] 并发连接处理
- [ ] 连接超时处理

### 消息测试
- [ ] 文本消息发送接收
- [ ] 消息格式验证
- [ ] 消息持久化
- [ ] 消息广播机制

### 用户管理测试
- [ ] 用户加入和离开
- [ ] 用户名冲突处理
- [ ] 在线用户列表同步
- [ ] 用户状态更新

---

**版本**: v1.0.0  
**最后更新**: 2025-01-XX  
**兼容性**: Socket.io 4.7+