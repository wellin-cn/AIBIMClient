# Shared Library 使用指南 - Client端

## 📖 重要说明

**client/shared/** 目录是一个 **Git Subtree**，指向独立的共享代码库。这个目录包含了前后端共享的类型定义、常量、验证器和工具函数。

⚠️ **重要**：不要直接在 `client/shared/` 目录中修改文件，所有修改都应该在主共享库中进行，然后通过 git subtree 同步。

## 🔗 Shared库概述

### 目录结构
```
client/shared/                   # Git Subtree 目录
├── README.md                    # 库使用指南
├── CHANGELOG.md                 # 版本变更记录
├── types/                       # TypeScript类型定义
│   ├── index.ts                 # 统一导出
│   ├── user.ts                  # 用户相关类型
│   ├── message.ts               # 消息相关类型
│   ├── socket.ts                # Socket事件类型
│   └── api.ts                   # API接口类型
├── constants/                   # 常量定义
│   ├── index.ts                 # 统一导出
│   ├── events.ts                # Socket事件名称
│   ├── errors.ts                # 错误码定义
│   └── config.ts                # 配置常量
├── validators/                  # 数据验证函数
│   ├── index.ts                 # 统一导出
│   ├── user.ts                  # 用户验证
│   └── message.ts              # 消息验证
├── utils/                       # 工具函数
│   ├── index.ts                 # 统一导出
│   ├── format.ts                # 格式化工具
│   └── validate.ts              # 验证工具
└── docs/                        # 详细文档
    ├── api-spec.md              # API接口规范
    ├── socket-events.md         # Socket事件文档
    └── data-models.md           # 数据模型文档
```

## 🚀 在Client端使用Shared库

### 1. Vite配置
在 `vite.config.ts` 中配置路径别名：
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 2. TypeScript配置
在 `tsconfig.json` 中配置路径别名：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["./shared/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. 导入示例
```typescript
// 导入类型定义
import { 
  User, 
  Message, 
  MessageWithStatus,
  ConnectionStatus 
} from '@shared/types'

// 导入常量
import { 
  SOCKET_EVENTS, 
  USER_EVENTS, 
  MESSAGE_EVENTS,
  MAX_MESSAGE_LENGTH,
  ERROR_CODES
} from '@shared/constants'

// 导入验证器
import { 
  validateUsername, 
  isValidUsername 
} from '@shared/validators'

// 导入工具函数
import { 
  formatTimestamp, 
  formatFileSize,
  debounce,
  generateInitials 
} from '@shared/utils'
```

## 🎯 常用使用场景

### 1. Socket.io集成
```typescript
import { 
  SOCKET_EVENTS, 
  USER_EVENTS, 
  MESSAGE_EVENTS 
} from '@shared/constants'
import { 
  UserJoinData, 
  MessageSendData,
  MessageReceivedData 
} from '@shared/types'

// Socket连接配置
const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  autoConnect: false
})

// 发送用户加入事件
const joinChat = (username: string) => {
  const joinData: UserJoinData = {
    username,
    version: '1.0.0',
    clientInfo: {
      platform: 'macOS',
      userAgent: navigator.userAgent
    }
  }
  socket.emit(USER_EVENTS.JOIN, joinData)
}

// 发送消息
const sendMessage = (content: string) => {
  const messageData: MessageSendData = {
    type: 'text',
    content,
    timestamp: Date.now(),
    tempId: generateId('temp')
  }
  socket.emit(MESSAGE_EVENTS.SEND, messageData)
}

// 监听消息接收
socket.on(MESSAGE_EVENTS.RECEIVED, (data: MessageReceivedData) => {
  // 更新UI显示新消息
  addMessageToStore(data)
})
```

### 2. 状态管理（Zustand）
```typescript
import { create } from 'zustand'
import { 
  User, 
  Message, 
  MessageWithStatus,
  ConnectionStatus 
} from '@shared/types'

interface ChatStore {
  // 状态
  messages: MessageWithStatus[]
  users: User[]
  currentUser: User | null
  connectionStatus: ConnectionStatus
  
  // Actions
  addMessage: (message: Message) => void
  updateMessageStatus: (tempId: string, status: MessageStatus) => void
  setUsers: (users: User[]) => void
  setConnectionStatus: (status: ConnectionStatus) => void
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  currentUser: null,
  connectionStatus: 'disconnected',
  
  addMessage: (message) => set(state => ({
    messages: [...state.messages, { ...message, status: 'sent' }]
  })),
  
  updateMessageStatus: (tempId, status) => set(state => ({
    messages: state.messages.map(msg => 
      msg.tempId === tempId ? { ...msg, status } : msg
    )
  })),
  
  setUsers: (users) => set({ users }),
  setConnectionStatus: (status) => set({ connectionStatus: status })
}))
```

### 3. 表单验证
```typescript
import { validateUsername, validateMessageContent } from '@shared/validators'
import { ERROR_CODES } from '@shared/constants'

// 用户名输入验证
const UsernameInput: React.FC = () => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    
    const validation = validateUsername(value)
    if (!validation.isValid) {
      setError(validation.errors[0])
    } else {
      setError('')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={username}
        onChange={(e) => handleUsernameChange(e.target.value)}
        placeholder="Enter username"
      />
      {error && <div className="error">{error}</div>}
    </div>
  )
}

// 消息输入验证
const MessageInput: React.FC = () => {
  const [content, setContent] = useState('')
  const [isValid, setIsValid] = useState(true)

  const handleContentChange = (value: string) => {
    setContent(value)
    
    const validation = validateMessageContent(value)
    setIsValid(validation.isValid)
  }

  const handleSend = () => {
    if (isValid && content.trim()) {
      sendMessage(content.trim())
      setContent('')
    }
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Type your message..."
      />
      <button 
        onClick={handleSend} 
        disabled={!isValid || !content.trim()}
      >
        Send
      </button>
    </div>
  )
}
```

### 4. 格式化和显示
```typescript
import { 
  formatTimestamp, 
  formatRelativeTime,
  formatFileSize,
  generateInitials 
} from '@shared/utils'

// 消息时间显示
const MessageTime: React.FC<{ timestamp: number }> = ({ timestamp }) => {
  return (
    <span className="message-time">
      {formatRelativeTime(timestamp)}
    </span>
  )
}

// 用户头像组件
const UserAvatar: React.FC<{ username: string }> = ({ username }) => {
  const initials = generateInitials(username)
  
  return (
    <div className="user-avatar">
      {initials}
    </div>
  )
}

// 文件大小显示
const FileInfo: React.FC<{ fileName: string; fileSize: number }> = ({ 
  fileName, 
  fileSize 
}) => {
  return (
    <div className="file-info">
      <span className="file-name">{fileName}</span>
      <span className="file-size">({formatFileSize(fileSize)})</span>
    </div>
  )
}
```

### 5. 错误处理
```typescript
import { ERROR_CODES, USER_ERROR_MESSAGES } from '@shared/constants'

// 错误提示组件
const ErrorMessage: React.FC<{ errorCode: string }> = ({ errorCode }) => {
  const userMessage = USER_ERROR_MESSAGES[errorCode as ERROR_CODES]
  
  return (
    <div className="error-message">
      {userMessage || 'An unexpected error occurred'}
    </div>
  )
}

// Socket错误处理
socket.on('user:join:error', (error) => {
  const { code, message } = error
  
  if (code === ERROR_CODES.USERNAME_TAKEN) {
    // 显示用户名已被占用的友好提示
    showError(USER_ERROR_MESSAGES[code])
  } else {
    // 显示通用错误信息
    showError(message)
  }
})
```

## 🎨 UI组件最佳实践

### 1. 使用共享常量
```typescript
import { MAX_MESSAGE_LENGTH, MAX_USERNAME_LENGTH } from '@shared/constants'

const MessageInput: React.FC = () => {
  const [content, setContent] = useState('')
  
  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder={`Type your message (max ${MAX_MESSAGE_LENGTH} characters)...`}
      />
      <div className="char-count">
        {content.length} / {MAX_MESSAGE_LENGTH}
      </div>
    </div>
  )
}
```

### 2. 性能优化
```typescript
import { debounce } from '@shared/utils'

// 搜索输入防抖
const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('')
  
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      // 执行搜索
      performSearch(searchQuery)
    }, 300),
    []
  )
  
  const handleInputChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder="Search messages..."
    />
  )
}
```

## 🔄 Git Subtree 操作

### 查看当前版本
```bash
cd client/
git log --oneline shared/ | head -5
```

### 更新shared库（由架构师执行）
```bash
# 拉取最新的shared库更新
git subtree pull --prefix=shared --squash shared-repo main

# 解决冲突（如有）
git add .
git commit -m "chore: update shared library"
```

### 检查shared库状态
```bash
# 查看shared目录的提交历史
git log --oneline --graph shared/

# 检查shared库是否是最新版本
git subtree push --prefix=shared --dry-run shared-repo main
```

## 📚 参考文档

1. **API规范**: `shared/docs/api-spec.md`
2. **Socket事件**: `shared/docs/socket-events.md`
3. **数据模型**: `shared/docs/data-models.md`
4. **变更日志**: `shared/CHANGELOG.md`

## ⚠️ 注意事项

1. **不要直接修改shared目录**：所有修改都通过主库进行
2. **及时同步更新**：定期检查shared库的更新
3. **保持兼容性**：确保client代码与shared库版本兼容
4. **遵循规范**：严格按照shared库的使用规范开发

## 🆘 常见问题

**Q: 如何知道shared库有更新？**
A: 查看 `shared/CHANGELOG.md` 或联系架构师

**Q: 发现shared库中的bug怎么办？**
A: 立即报告给架构师，不要直接修改shared目录

**Q: 需要新增共享功能怎么办？**
A: 向架构师提出需求，在主库中统一添加

**Q: Vite构建时找不到shared模块怎么办？**
A: 检查 `vite.config.ts` 中的路径别名配置

**Q: TypeScript报错找不到shared类型怎么办？**
A: 检查 `tsconfig.json` 中的路径映射配置

---

**记住**: Shared库是前后端一致性的保证，请严格遵循使用规范！