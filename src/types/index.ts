// 用户相关类型
export interface User {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
}

// 消息相关类型
export interface Message {
  id: string
  content: string
  sender: User
  timestamp: Date
  type: MessageType
  status?: MessageStatus
}

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  IMAGE = 'image',
  FILE = 'file'
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed'
}

// 连接状态
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting'
}

// 应用状态
export interface AppState {
  currentUser: User | null
  connectionStatus: ConnectionStatus
  serverUrl: string
  theme: 'light' | 'dark'
}

// Socket事件类型
export interface SocketEvents {
  // 客户端发送的事件
  'user:join': (userData: { name: string }) => void
  'user:leave': () => void
  'message:send': (message: { content: string }) => void
  
  // 服务器发送的事件
  'user:joined': (user: User) => void
  'user:left': (userId: string) => void
  'user:list': (users: User[]) => void
  'message:received': (message: Message) => void
  'message:history': (messages: Message[]) => void
  'error': (error: { code: string; message: string }) => void
}

// 组件Props通用类型
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 本地设置类型
export interface UserSettings {
  username?: string
  serverUrl?: string
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  notifications: boolean
  autoConnect: boolean
}

// 窗口控制相关
export interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
}