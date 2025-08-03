/**
 * Message-related type definitions
 */

import { BaseEntity } from './index'
import { UserInfo } from './user'

// Message types
export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  SYSTEM = 'system'
}

// System message subtypes
export enum SystemMessageType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  SERVER_RESTART = 'server_restart',
  MAINTENANCE = 'maintenance',
  ANNOUNCEMENT = 'announcement'
}

// Message status (client-side)
export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

// Base message interface
export interface BaseMessage extends BaseEntity {
  type: MessageType
  content: string
  sender: UserInfo
  timestamp: number
}

// Text message
export interface TextMessage extends BaseMessage {
  type: MessageType.TEXT
  content: string // Max 1000 characters
}

// File message (Phase 2)
export interface FileMessage extends BaseMessage {
  type: MessageType.FILE
  content: string // File description
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  downloadCount?: number
}

// System message
export interface SystemMessage extends BaseMessage {
  type: MessageType.SYSTEM
  sender: {
    id: 'system'
    username: 'System'
  }
  systemType: SystemMessageType
  data?: any // Additional system message data
}

// Union type for all messages
export type Message = TextMessage | FileMessage | SystemMessage

// Message with client-side status
export interface MessageWithStatus extends Message {
  status: MessageStatus
  tempId?: string // Temporary ID for tracking
  retryCount?: number
  errorMessage?: string
}

// Message creation data
export interface CreateMessageData {
  type: MessageType.TEXT
  content: string
  tempId?: string
}

// Message send data (client to server)
export interface MessageSendData {
  type: MessageType.TEXT | MessageType.FILE
  content: string
  timestamp: number
  tempId?: string
  fileData?: {
    fileName: string
    fileSize: number
    mimeType: string
  }
}

// Message received data (server to client)
export interface MessageReceivedData extends Message {
  // Additional metadata can be added here
}

// Message sent confirmation (server to client)
export interface MessageSentData {
  tempId: string
  messageId: string
  timestamp: number
  status: 'success'
}

// Message send error (server to client)
export interface MessageSendErrorData {
  tempId: string
  code: string
  message: string
  details?: any
}

// Message query parameters
export interface MessageQuery {
  limit?: number
  before?: number
  after?: number
  userId?: string
  type?: MessageType
  search?: string
}

// Message history response
export interface MessageHistoryResponse {
  messages: Message[]
  hasMore: boolean
  total: number
  oldestTimestamp?: number
  newestTimestamp?: number
}

// Typing indicator data
export interface TypingData {
  username: string
  timestamp: number
}

// Typing update notification
export interface TypingUpdateData {
  type: 'start' | 'stop'
  user: UserInfo
  timestamp: number
}

// Message statistics
export interface MessageStats {
  totalMessages: number
  messagesPerDay: number
  averageMessageLength: number
  mostActiveUsers: Array<{
    user: UserInfo
    messageCount: number
  }>
}

// File upload data (Phase 2)
export interface FileUploadData {
  fileName: string
  fileSize: number
  mimeType: string
  fileBuffer: ArrayBuffer
}

// File upload response (Phase 2)
export interface FileUploadResponse {
  fileId: string
  fileName: string
  fileSize: number
  fileUrl: string
  mimeType: string
  uploadedAt: number
}

// Message search parameters
export interface MessageSearchParams {
  query: string
  type?: MessageType
  userId?: string
  dateFrom?: number
  dateTo?: number
  limit?: number
  offset?: number
}

// Message search result
export interface MessageSearchResult {
  messages: Message[]
  total: number
  hasMore: boolean
  searchTime: number
}