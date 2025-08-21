// 核心数据类型定义

export interface User {
  id: string;
  username: string;
  createdAt: Date;
  lastSeen: Date;
}

export interface Message {
  id: string;
  type: 'text' | 'file' | 'system';
  content: string;
  senderId: string;
  timestamp: Date;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
}

export interface OnlineUser {
  socketId: string;
  userId: string;
  username: string;
  joinedAt: Date;
  lastPing?: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Socket事件类型
export interface SocketEvents {
  // 用户事件
  'user:join': (data: { username: string }) => void;
  'user:joined': (data: { user: User; onlineUsers: OnlineUser[] }) => void;
  'user:left': (data: { user: User; onlineUsers: OnlineUser[] }) => void;
  'users:update': (data: { onlineUsers: OnlineUser[] }) => void;
  
  // 消息事件
  'message:send': (data: Omit<Message, 'id' | 'senderId' | 'timestamp'>) => void;
  'message:received': (data: Message) => void;
  
  // 错误事件
  'error': (data: { message: string; code?: string }) => void;
  
  // 连接事件
  'disconnect': () => void;
}

// 数据库原始数据类型（SQLite返回的数据）
export interface UserRow {
  id: string;
  username: string;
  created_at: string;
  last_seen: string;
}

export interface MessageRow {
  id: string;
  type: string;
  content: string;
  sender_id: string;
  timestamp: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
}

export interface OnlineUserRow {
  socket_id: string;
  user_id: string;
  username: string;
  joined_at: string;
  last_ping?: string;
}

// 请求类型
export interface GetMessagesQuery {
  limit?: number;
  before?: string; // timestamp
  after?: string;  // timestamp
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  connections: number;
  version: string;
  database: 'connected' | 'error';
}