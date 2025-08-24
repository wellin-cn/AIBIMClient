// 用户相关类型
export interface User {
  id: string
  name: string
  username: string
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
  fileInfo?: FileInfo
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
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

export interface MessageConfirmation {
  tempId: string
  messageId: string
  timestamp: number
  status: MessageStatus
  error?: string
}

// 文件相关类型
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
}

export enum FileUploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface FileUploadProgress {
  tempId: string
  fileName: string
  fileSize: number
  uploadedBytes: number
  status: FileUploadStatus
  progress: number
  error?: string
  uploadedAt?: Date
}

export interface FileUploadStartData {
  tempId: string
  fileName: string
  fileSize: number
}

export interface FileUploadProgressData {
  tempId: string
  uploadedBytes: number
  progress: number
}

export interface FileUploadCompleteData {
  tempId: string
  fileId: string
  fileName: string
  fileSize: number
  fileUrl: string
}

export interface FileUploadErrorData {
  tempId: string
  error: string
}

// 连接状态
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
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
  'user:join': (userData: { username: string; timestamp: string }) => void
  'user:leave': () => void
  'message:send': (message: { content: string; tempId: string; timestamp: number; type?: string }) => void
  'message:resend': (tempId: string) => void
  
  // 服务器发送的事件
  'user:joined': (data: { user: User; onlineUsers: User[]; serverInfo?: any }) => void
  'user:new-member-joined': (data: { newMember: User; onlineUsers: User[] }) => void
  'user:left': (data: { user: User; onlineUsers: User[] }) => void
  'message:received': (message: Message) => void
  'message:sent': (confirmation: MessageConfirmation) => void
  'message:send:error': (data: { tempId: string; code: string; message: string }) => void
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