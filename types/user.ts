/**
 * User-related type definitions
 */

import { BaseEntity, UserStatus } from './index'

// Base user interface
export interface User extends BaseEntity {
  username: string
  lastSeen: number
}

// User information for display purposes
export interface UserInfo {
  id: string
  username: string
}

// Online user with additional session information
export interface OnlineUser extends User {
  socketId: string
  joinedAt: number
  status: UserStatus
  ipAddress?: string
}

// User creation data
export interface CreateUserData {
  username: string
}

// User update data
export interface UpdateUserData {
  username?: string
  lastSeen?: number
  status?: UserStatus
}

// User query parameters
export interface UserQuery {
  status?: UserStatus
  search?: string
  limit?: number
  includeOffline?: boolean
}

// User join event data
export interface UserJoinData {
  username: string
  version?: string
  clientInfo?: {
    platform: string
    userAgent: string
  }
}

// User join response data
export interface UserJoinedData {
  user: OnlineUser
  onlineUsers: OnlineUser[]
  serverInfo: {
    version: string
    maxUsers: number
    currentUsers: number
  }
}

// New member joined notification data (broadcast to other users)
export interface NewMemberJoinedData {
  newMember: OnlineUser
  onlineUsers: OnlineUser[]
}

// User join error data
export interface UserJoinErrorData {
  code: string
  message: string
  details?: {
    suggestions?: string[]
    retryAfter?: number
  }
}

// User leave data
export interface UserLeaveData {
  reason?: 'user_quit' | 'network_error' | 'server_shutdown' | 'kicked'
  message?: string
}

// User left notification data
export interface UserLeftData {
  user: UserInfo
  reason?: string
  onlineUsers: OnlineUser[]
  timestamp: number
}

// Users update notification data
export interface UsersUpdateData {
  type: 'user_joined' | 'user_left' | 'user_status_changed'
  user: UserInfo
  onlineUsers: OnlineUser[]
  onlineCount: number
  timestamp: number
}

// User statistics
export interface UserStats {
  totalUsers: number
  onlineUsers: number
  peakOnlineUsers: number
  averageSessionDuration: number
}

// User preferences (client-side)
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  notifications: {
    sound: boolean
    desktop: boolean
    mentions: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    showLastSeen: boolean
  }
}

// User session data
export interface UserSession {
  userId: string
  socketId: string
  ipAddress: string
  userAgent: string
  connectedAt: number
  lastActivity: number
}