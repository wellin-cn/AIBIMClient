# 数据模型规范文档

## 📊 核心数据模型

### 1. User（用户模型）

#### 数据库表结构
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- 用户唯一标识
  username TEXT UNIQUE NOT NULL,    -- 用户名，唯一
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### TypeScript接口
```typescript
interface User {
  id: string                        // 用户唯一ID，格式：user_${timestamp}_${random}
  username: string                  // 用户名，1-20字符，字母数字下划线
  createdAt: number                 // 创建时间戳
  lastSeen: number                  // 最后活跃时间戳
}

interface OnlineUser extends User {
  socketId: string                  // Socket连接ID
  joinedAt: number                 // 本次加入时间戳
  status: 'online' | 'away'        // 用户状态
}
```

#### 验证规则
- **username**: 
  - 长度：1-20字符
  - 格式：只允许字母、数字、下划线
  - 正则：`/^[a-zA-Z0-9_]{1,20}$/`
- **id**: 系统自动生成，不可修改
- **时间戳**: Unix时间戳（毫秒）

### 2. Message（消息模型）

#### 数据库表结构
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,              -- 消息唯一标识
  type TEXT NOT NULL CHECK(type IN ('text', 'file', 'system')),
  content TEXT NOT NULL,            -- 消息内容
  sender_id TEXT NOT NULL,          -- 发送者ID
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT,                   -- 文件路径（文件消息）
  file_name TEXT,                   -- 文件名（文件消息）
  file_size INTEGER,                -- 文件大小（文件消息）
  FOREIGN KEY (sender_id) REFERENCES users (id)
);
```

#### TypeScript接口
```typescript
interface BaseMessage {
  id: string                        // 消息唯一ID，格式：msg_${timestamp}_${random}
  type: MessageType                 // 消息类型
  content: string                   // 消息内容
  sender: UserInfo                  // 发送者信息
  timestamp: number                 // 发送时间戳
}

interface TextMessage extends BaseMessage {
  type: 'text'
  content: string                   // 文本内容，最大1000字符
}

interface FileMessage extends BaseMessage {
  type: 'file'
  content: string                   // 文件描述文本
  fileUrl: string                   // 文件下载URL
  fileName: string                  // 原始文件名
  fileSize: number                  // 文件大小（字节）
  mimeType: string                  // 文件MIME类型
}

interface SystemMessage extends BaseMessage {
  type: 'system'
  content: string                   // 系统消息内容
  sender: {
    id: 'system'
    username: 'System'
  }
  systemType: SystemMessageType    // 系统消息子类型
}

type Message = TextMessage | FileMessage | SystemMessage
```

#### 枚举定义
```typescript
enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  SYSTEM = 'system'
}

enum SystemMessageType {
  USER_JOINED = 'user_joined',      // 用户加入
  USER_LEFT = 'user_left',          // 用户离开
  SERVER_RESTART = 'server_restart', // 服务器重启
  MAINTENANCE = 'maintenance'        // 系统维护
}
```

#### 验证规则
- **content**: 
  - 文本消息：1-1000字符，过滤HTML标签
  - 文件消息：文件描述，0-200字符
  - 系统消息：系统生成，不限制
- **timestamp**: Unix时间戳（毫秒）
- **fileSize**: 最大10MB（10,485,760字节）

### 3. UserInfo（用户信息简化模型）

```typescript
interface UserInfo {
  id: string                        // 用户ID
  username: string                  // 用户名
}
```

### 4. Room（聊天室模型）- Phase 2功能

```typescript
interface Room {
  id: string                        // 房间ID
  name: string                      // 房间名称
  type: 'public' | 'private'        // 房间类型
  createdBy: string                 // 创建者ID
  createdAt: number                 // 创建时间
  memberCount: number               // 成员数量
  lastMessage?: Message             // 最后一条消息
}
```

## 🔄 数据流转模型

### 1. API响应格式
```typescript
interface ApiResponse<T = any> {
  success: boolean                  // 操作是否成功
  data?: T                         // 响应数据
  error?: {
    code: string                   // 错误码
    message: string                // 错误信息
    details?: any                  // 详细信息
  }
  timestamp: number                // 响应时间戳
  pagination?: {                   // 分页信息（可选）
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}
```

### 2. Socket事件数据格式
```typescript
interface SocketEventData<T = any> {
  type: string                     // 事件类型
  data: T                         // 事件数据
  timestamp: number               // 事件时间戳
  sender?: UserInfo               // 发送者信息（可选）
}
```

### 3. 分页查询参数
```typescript
interface PaginationParams {
  limit?: number                   // 每页数量，默认50，最大100
  before?: number                  // 时间戳，获取此时间之前的数据
  after?: number                   // 时间戳，获取此时间之后的数据
  page?: number                    // 页码（可选，与before/after互斥）
}
```

## 🎯 数据一致性规范

### 1. ID生成规则
```typescript
// 用户ID格式
const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 消息ID格式  
const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 文件ID格式
const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

### 2. 时间戳处理
- 所有时间戳统一使用Unix毫秒时间戳
- 服务端时间为准，客户端时间仅作参考
- 时区统一使用UTC

### 3. 数据验证层级
```
1. 前端输入验证（用户体验）
2. 共享验证器（类型安全）
3. 后端业务验证（数据安全）
4. 数据库约束（最后防线）
```

## 📝 数据状态管理

### 1. 消息状态
```typescript
enum MessageStatus {
  PENDING = 'pending',             // 发送中
  SENT = 'sent',                   // 已发送
  DELIVERED = 'delivered',          // 已送达（可选）
  FAILED = 'failed'                // 发送失败
}

interface MessageWithStatus extends Message {
  status: MessageStatus
  tempId?: string                  // 临时ID，用于状态跟踪
  retryCount?: number             // 重试次数
}
```

### 2. 连接状态
```typescript
enum ConnectionStatus {
  DISCONNECTED = 'disconnected',   // 未连接
  CONNECTING = 'connecting',       // 连接中
  CONNECTED = 'connected',         // 已连接
  RECONNECTING = 'reconnecting',   // 重连中
  ERROR = 'error'                  // 连接错误
}
```

### 3. 用户状态
```typescript
enum UserStatus {
  OFFLINE = 'offline',             // 离线
  ONLINE = 'online',               // 在线
  AWAY = 'away',                   // 离开
  BUSY = 'busy'                    // 忙碌（可选）
}
```

## 🔍 数据查询模式

### 1. 消息历史查询
```typescript
interface MessageQuery {
  limit?: number                   // 数量限制
  before?: number                  // 时间戳之前
  after?: number                   // 时间戳之后
  userId?: string                  // 特定用户的消息
  type?: MessageType               // 消息类型过滤
}
```

### 2. 用户查询
```typescript
interface UserQuery {
  status?: UserStatus              // 用户状态过滤
  search?: string                  // 用户名搜索
  limit?: number                   // 数量限制
}
```

## 🛡️ 数据安全规范

### 1. 敏感数据处理
- 用户密码：不存储（本项目无密码功能）
- 文件内容：服务器本地存储，不上传云端
- 聊天记录：仅保留最近1000条消息

### 2. 数据清理
- 定期清理过期文件（30天）
- 清理离线用户记录（7天）
- 清理过多的历史消息（保留最新1000条）

### 3. 数据验证
- 所有用户输入必须验证
- SQL注入防护
- XSS攻击防护
- 文件类型和大小验证

---

**版本**: v1.0.0  
**最后更新**: 2025-01-XX  
**数据库版本**: SQLite 3.40+