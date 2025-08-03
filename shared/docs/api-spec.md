# API接口规范文档

## 📋 总体规范

### 基础URL
- **开发环境**: `http://localhost:3001`
- **生产环境**: `http://{server-ip}:3001`

### 响应格式
所有API响应遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: number
}
```

### 错误码规范
```typescript
enum ErrorCodes {
  // 通用错误 1000-1099
  INTERNAL_ERROR = 'E1001',
  INVALID_REQUEST = 'E1002',
  VALIDATION_ERROR = 'E1003',
  
  // 用户相关错误 1100-1199
  USER_NOT_FOUND = 'E1101',
  USERNAME_TAKEN = 'E1102',
  USERNAME_INVALID = 'E1103',
  
  // 消息相关错误 1200-1299
  MESSAGE_TOO_LONG = 'E1201',
  MESSAGE_EMPTY = 'E1202',
  MESSAGE_NOT_FOUND = 'E1203',
  
  // 连接相关错误 1300-1399
  CONNECTION_FAILED = 'E1301',
  UNAUTHORIZED = 'E1302',
  RATE_LIMITED = 'E1303'
}
```

## 🔗 REST API端点

### 1. 健康检查
**GET** `/api/health`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-XX",
    "uptime": 3600,
    "connections": 5,
    "version": "1.0.0"
  },
  "timestamp": 1640995200000
}
```

### 2. 获取历史消息
**GET** `/api/messages`

**查询参数**:
- `limit` (number, optional): 限制返回数量，默认50，最大100
- `before` (number, optional): 时间戳，获取此时间之前的消息
- `after` (number, optional): 时间戳，获取此时间之后的消息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123456",
        "type": "text",
        "content": "Hello world!",
        "sender": {
          "id": "user_123",
          "username": "alice"
        },
        "timestamp": 1640995200000
      }
    ],
    "hasMore": true,
    "total": 150
  },
  "timestamp": 1640995200000
}
```

### 3. 文件上传（Phase 2功能）
**POST** `/api/upload`

**请求格式**: `multipart/form-data`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "fileId": "file_123456",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "fileUrl": "/api/files/file_123456",
    "mimeType": "application/pdf"
  },
  "timestamp": 1640995200000
}
```

### 4. 文件下载
**GET** `/api/files/:fileId`

**响应**: 文件流

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "E1203",
    "message": "File not found"
  },
  "timestamp": 1640995200000
}
```

### 5. 获取在线用户（可选）
**GET** `/api/users/online`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "username": "alice",
        "joinedAt": 1640995200000,
        "status": "online"
      }
    ],
    "count": 5
  },
  "timestamp": 1640995200000
}
```

## 📝 请求/响应头

### 标准请求头
```
Content-Type: application/json
Accept: application/json
User-Agent: IM-Client/1.0.0
```

### 标准响应头
```
Content-Type: application/json
Cache-Control: no-cache
X-RateLimit-Remaining: 100
X-RateLimit-Reset: 1640995200
```

## 🔒 安全规范

### 输入验证
- 所有输入必须进行验证和清理
- 用户名：1-20字符，仅允许字母、数字、下划线
- 消息内容：最大1000字符，过滤HTML标签
- 文件上传：限制文件类型和大小

### 频率限制
- API调用：每IP每分钟最多60次请求
- 消息发送：每用户每秒最多5条消息
- 文件上传：每用户每小时最多10个文件

### CORS配置
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📊 性能要求

- **响应时间**: 95%的请求响应时间 < 200ms
- **并发处理**: 支持至少100个并发请求
- **可用性**: 99.9%可用性目标
- **数据传输**: 启用gzip压缩

## 🧪 测试规范

### API测试清单
- [ ] 正常请求返回正确数据
- [ ] 错误请求返回标准错误格式
- [ ] 参数验证正确工作
- [ ] 频率限制生效
- [ ] 响应时间符合要求
- [ ] 并发请求处理正常

---

**版本**: v1.0.0  
**最后更新**: 2025-01-XX  
**维护者**: 技术团队