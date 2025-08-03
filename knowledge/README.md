# Client端开发指南

## 项目概述

这是IM聊天应用的客户端，基于Electron + React构建，提供跨平台的桌面聊天应用体验。

## 技术栈

- **Electron**: ^28.0.0 - 桌面应用框架
- **React**: ^18.2.0 - UI框架  
- **TypeScript**: ^5.3.0 - 类型安全
- **Vite**: ^5.0.0 - 构建工具
- **Socket.io-client**: ^4.7.0 - WebSocket客户端
- **Zustand**: ^4.4.0 - 状态管理
- **Tailwind CSS**: ^3.4.0 - 样式框架

## 项目结构

```
client/
├── src/
│   ├── main/                   # Electron主进程
│   │   ├── main.ts             # 主进程入口
│   │   └── preload.ts          # 预加载脚本
│   ├── renderer/               # 渲染进程（React应用）
│   │   ├── components/         # React组件
│   │   │   ├── Chat/           # 聊天相关组件
│   │   │   ├── Layout/         # 布局组件
│   │   │   ├── UserList/       # 用户列表组件
│   │   │   └── common/         # 通用组件
│   │   ├── hooks/              # 自定义React Hooks
│   │   ├── store/              # Zustand状态管理
│   │   ├── services/           # 业务逻辑服务
│   │   ├── types/              # TypeScript类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── styles/             # 样式文件
│   │   ├── App.tsx             # 根组件
│   │   └── main.tsx            # React入口
│   └── assets/                 # 静态资源
├── public/                     # 公共文件
├── dist-electron/              # 构建输出
├── package.json
├── electron-builder.yml        # 打包配置
└── vite.config.ts             # Vite配置
```

## 核心功能模块

### 1. Socket服务 (services/socket.ts)
- WebSocket连接管理
- 消息发送和接收
- 连接状态监控
- 自动重连机制

### 2. 状态管理 (store/)
- **chatStore**: 聊天消息、用户列表管理
- **uiStore**: UI状态、主题设置
- **userStore**: 当前用户信息

### 3. 组件架构
- **ChatWindow**: 主聊天界面
- **MessageList**: 消息列表展示
- **MessageInput**: 消息输入组件
- **UserList**: 在线用户列表
- **LoginForm**: 用户登录界面

## 数据流架构

```
User Action → Component → Store → Service → Socket → Server
     ↑                                              ↓
UI Update ← Component ← Store ← Service ← Socket ← Server Response
```

## 核心组件设计

### ChatWindow
```typescript
interface ChatWindowProps {
  className?: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  const { messages, users } = useChatStore()
  const { socket } = useSocket()
  
  return (
    <div className={`chat-window ${className}`}>
      <UserList users={users} />
      <div className="chat-content">
        <MessageList messages={messages} />
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  )
}
```

### MessageList
```typescript
interface MessageListProps {
  messages: Message[]
  onMessageClick?: (message: Message) => void
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onMessageClick 
}) => {
  const listRef = useRef<HTMLDivElement>(null)
  
  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])
  
  return (
    <div ref={listRef} className="message-list">
      {messages.map(message => (
        <MessageItem 
          key={message.id}
          message={message}
          onClick={onMessageClick}
        />
      ))}
    </div>
  )
}
```

## 状态管理

### Chat Store
```typescript
interface ChatStore {
  messages: Message[]
  users: User[]
  currentUser: User | null
  isConnected: boolean
  
  // Actions
  addMessage: (message: Message) => void
  setUsers: (users: User[]) => void
  setCurrentUser: (user: User) => void
  setConnected: (connected: boolean) => void
  clearMessages: () => void
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  currentUser: null,
  isConnected: false,
  
  addMessage: (message) => set(state => ({
    messages: [...state.messages, message]
  })),
  
  setUsers: (users) => set({ users }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setConnected: (connected) => set({ isConnected: connected }),
  clearMessages: () => set({ messages: [] })
}))
```

## 自定义Hooks

### useSocket
```typescript
const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { setConnected } = useChatStore()
  
  const connect = useCallback((serverUrl: string) => {
    const newSocket = io(serverUrl)
    
    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to server')
    })
    
    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })
    
    setSocket(newSocket)
  }, [setConnected])
  
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
  }, [socket])
  
  return { socket, connect, disconnect }
}
```

## UI设计规范

### 布局结构
```
┌─────────────────────────────────────┐
│            App Header               │
├──────────┬──────────────────────────┤
│          │                          │
│   User   │      Chat Window         │
│   List   │                          │
│          │  ┌─────────────────────┐ │
│          │  │   Message List      │ │
│          │  │                     │ │
│          │  └─────────────────────┘ │
│          │  ┌─────────────────────┐ │
│          │  │   Message Input     │ │
│          │  └─────────────────────┘ │
└──────────┴──────────────────────────┘
```

### 主题配置
```typescript
const themes = {
  light: {
    primary: '#3b82f6',      // 蓝色
    secondary: '#64748b',    // 灰色
    background: '#ffffff',   // 白色背景
    surface: '#f8fafc',      // 浅灰表面
    text: '#1e293b',         // 深色文字
    border: '#e2e8f0'        // 边框
  },
  dark: {
    primary: '#3b82f6',      // 蓝色
    secondary: '#64748b',    // 灰色  
    background: '#0f172a',   // 深色背景
    surface: '#1e293b',      // 深灰表面
    text: '#f1f5f9',         // 浅色文字
    border: '#334155'        // 深色边框
  }
}
```

## 开发配置

### 环境变量
```env
# .env
VITE_SERVER_URL=http://localhost:3001
VITE_APP_NAME=IM Chat
VITE_APP_VERSION=1.0.0
```

### 启动脚本
```bash
# 开发模式（渲染进程）
npm run dev

# 构建
npm run build

# Electron开发模式
npm run electron:dev

# 打包应用
npm run electron:build
```

## Electron配置

### 主进程 (main.ts)
```typescript
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('dist/index.html')
  }
}
```

### 打包配置 (electron-builder.yml)
```yaml
appId: com.example.im-chat
productName: IM Chat
directories:
  buildResources: build
files:
  - dist-electron/
  - dist/
  - node_modules/
  - package.json
mac:
  target: dmg
  category: public.app-category.social-networking
  icon: build/icon.png
```

## 性能优化

### React优化
- 使用React.memo避免不必要的重渲染
- useCallback和useMemo缓存计算结果
- 虚拟列表处理大量消息
- 懒加载非关键组件

### Electron优化
- 预加载脚本减少渲染进程权限
- 主进程和渲染进程通信优化
- 内存使用监控
- 应用启动时间优化

## 测试策略

### 单元测试
- 组件渲染测试
- Hook逻辑测试
- 工具函数测试

### 集成测试
- Socket连接测试
- 消息发送接收测试
- 用户交互流程测试

### E2E测试
- 完整用户场景测试
- 多窗口交互测试

## 部署和分发

### 本地构建
```bash
# 构建渲染进程
npm run build

# 构建主进程
npm run build:electron

# 打包应用
npm run dist
```

### 自动更新
- 使用electron-updater
- 配置更新服务器
- 增量更新支持

## 故障排除

### 常见问题
1. **Electron启动失败**: 检查Node.js版本和依赖
2. **Socket连接失败**: 检查服务器地址和CORS配置
3. **界面显示异常**: 检查CSS样式和组件状态
4. **打包失败**: 检查electron-builder配置

### 调试工具
- Chrome DevTools（渲染进程）
- Main Process Console（主进程）
- React Developer Tools
- Redux DevTools（状态管理）

## 下一步开发

根据knowledge/features/中的需求文档：
1. 实现基础的用户登录界面
2. 完成Socket连接和消息收发
3. 设计简洁美观的聊天界面
4. 实现用户列表和状态显示

---

**重要**: 开发时请参考根目录下的knowledge/目录中的详细技术文档和架构设计。