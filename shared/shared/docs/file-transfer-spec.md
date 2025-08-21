# 文件传输功能规范 - Phase 2

## 📋 功能概述
**最小可用标准**：支持局域网内的基础文件传输，用户可以发送和接收文件，无需复杂的权限管理。

### 核心功能
- 文件拖拽上传
- 基础文件类型支持
- 实时上传进度显示
- 文件下载
- 文件消息展示

### 不包含功能（Phase 3）
- 文件夹上传
- 断点续传
- 文件预览
- 文件分享链接
- 文件版本管理

## 🔄 用户交互流程

### 1. 文件上传流程
```
1. 用户拖拽文件到聊天输入区域
2. 显示文件信息确认弹窗（文件名、大小、类型）
3. 用户确认后开始上传
4. 显示上传进度条
5. 上传完成后自动发送文件消息
6. 其他用户收到文件消息通知
```

### 2. 文件接收流程
```
1. 用户收到文件消息
2. 显示文件信息（文件名、大小、发送者）
3. 点击下载按钮
4. 显示下载进度
5. 下载完成，系统默认下载位置保存
```

## 📋 文件限制（最小可用标准）

### 文件大小限制
- **单文件最大**: 50MB
- **总上传限制**: 每用户每小时最多500MB

### 支持的文件类型
```javascript
const ALLOWED_FILE_TYPES = {
  // 文档类型
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  
  // 图片类型
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  
  // 压缩文件
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  
  // 其他常用类型
  'application/json': '.json',
  'text/csv': '.csv'
}
```

### 安全限制
- 禁止执行文件（.exe, .bat, .sh等）
- 禁止脚本文件（.js, .py, .php等）
- 文件名长度限制：最大100字符
- 文件路径安全检查，防止路径遍历攻击

## 🔌 Socket事件扩展

### 新增客户端事件

#### 文件上传开始
```typescript
// 事件名: file:upload:start
interface FileUploadStartData {
  fileName: string
  fileSize: number
  mimeType: string
  tempId: string  // 用于跟踪上传状态
}
```

#### 文件上传进度
```typescript
// 事件名: file:upload:progress
interface FileUploadProgressData {
  tempId: string
  bytesUploaded: number
  totalBytes: number
  percentage: number
}
```

### 新增服务端响应事件

#### 文件上传完成
```typescript
// 事件名: file:upload:complete
interface FileUploadCompleteData {
  tempId: string
  fileId: string
  fileUrl: string
  message: FileMessage  // 自动生成的文件消息
}
```

#### 文件上传失败
```typescript
// 事件名: file:upload:error
interface FileUploadErrorData {
  tempId: string
  code: string
  message: string
}
```

## 🗄️ 数据存储策略

### 文件存储结构
```
server/uploads/
├── 2025/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── file_1642147200000_abc123.pdf
│   │   │   └── file_1642147300000_def456.jpg
│   │   └── 16/
│   └── 02/
└── temp/  # 上传临时文件
```

### 文件命名规则
```javascript
// 格式: file_{timestamp}_{randomId}.{extension}
const fileName = `file_${Date.now()}_${randomString(8)}.${extension}`
```

### 数据库记录
```sql
-- 文件表（新增）
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  FOREIGN KEY (uploaded_by) REFERENCES users (id)
);
```

## 🎨 UI组件设计

### 1. 文件拖拽区域
```
┌─────────────────────────────┐
│   [📁] 拖拽文件到此处上传    │
│     或点击选择文件          │
└─────────────────────────────┘
```

### 2. 上传进度显示
```
┌─────────────────────────────┐
│ 📄 document.pdf (2.5MB)     │
│ ████████████░░░░ 75%        │
│ 正在上传... (1.8MB/2.5MB)   │
└─────────────────────────────┘
```

### 3. 文件消息气泡
```
┌─────────────────────────────┐
│ Alice 10:30                 │
│ ┌─────────────────────────┐ │
│ │ 📄 项目文档.pdf         │ │
│ │ 2.5MB                   │ │
│ │ [⬇️ 下载] [👁️ 预览]    │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## 🔒 安全措施（最小标准）

### 文件验证
1. **MIME类型检查** - 验证文件真实类型
2. **文件大小限制** - 防止大文件攻击
3. **文件名安全** - 过滤特殊字符，防止路径遍历
4. **扩展名检查** - 白名单机制

### 存储安全
1. **隔离存储** - 上传文件与程序文件分离
2. **访问权限** - 文件服务器只读权限
3. **临时文件清理** - 定期清理上传失败的临时文件

## 📊 性能要求

### 上传性能
- **并发上传**: 单用户最多3个文件同时上传
- **上传速度**: 局域网环境 > 10MB/s
- **进度更新**: 每100KB更新一次进度

### 存储管理
- **文件清理**: 30天后自动删除无引用文件
- **存储限制**: 服务器总存储限制10GB
- **监控告警**: 存储使用率超过80%时告警

## 🧪 测试要点

### 功能测试
- [ ] 支持的文件类型能正常上传
- [ ] 文件大小限制生效
- [ ] 禁止文件类型被拒绝
- [ ] 上传进度显示准确
- [ ] 文件下载功能正常
- [ ] 多用户文件共享正常

### 安全测试
- [ ] 恶意文件类型被拒绝
- [ ] 超大文件被拒绝
- [ ] 文件名特殊字符处理正确
- [ ] 路径遍历攻击防护有效

### 性能测试
- [ ] 多文件并发上传稳定
- [ ] 大文件上传不影响聊天功能
- [ ] 长时间运行存储稳定

## 🎯 开发优先级

### P0 - 核心功能（必须实现）
1. 基础文件上传API
2. 文件下载API
3. 文件拖拽上传组件
4. 文件消息显示组件

### P1 - 重要功能（应该实现）
1. 上传进度显示
2. 文件类型和大小验证
3. 错误处理和用户提示
4. 文件存储管理

### P2 - 优化功能（可以实现）
1. 上传取消功能
2. 文件信息预览
3. 批量文件上传
4. 存储空间统计

---

**版本**: v2.0.0-beta  
**目标**: 最小可用的文件传输功能  
**时间预估**: 开发3-4天，测试1天