/**
 * API-related type definitions
 */

import { Message, MessageQuery, MessageHistoryResponse } from './message'
import { User, OnlineUser, UserQuery } from './user'
import { PaginationParams, PaginationResult, AppError } from './index'

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: AppError
  timestamp: number
  requestId?: string
  version?: string
}

// API error response
export interface ApiErrorResponse {
  success: false
  error: AppError
  timestamp: number
  requestId?: string
}

// API success response
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  timestamp: number
  requestId?: string
}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  uptime: number
  connections: number
  version: string
  environment: string
  services: {
    database: 'ok' | 'error'
    websocket: 'ok' | 'error'
    fileSystem: 'ok' | 'error'
  }
  metrics: {
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
}

// Messages API types
export interface GetMessagesRequest extends MessageQuery, PaginationParams {}

export interface GetMessagesResponse {
  messages: Message[]
  pagination: {
    hasMore: boolean
    total: number
    limit: number
    before?: number
    after?: number
  }
}

// Users API types
export interface GetUsersRequest extends UserQuery, PaginationParams {}

export interface GetUsersResponse {
  users: User[]
  onlineUsers: OnlineUser[]
  stats: {
    total: number
    online: number
    peak: number
  }
}

// File upload types (Phase 2)
export interface FileUploadRequest {
  file: File | Buffer
  description?: string
  metadata?: {
    originalName: string
    mimeType: string
    size: number
  }
}

export interface FileUploadResponse {
  fileId: string
  fileName: string
  fileSize: number
  fileUrl: string
  mimeType: string
  uploadedAt: number
  downloadCount: number
}

// File download types
export interface FileDownloadRequest {
  fileId: string
  range?: {
    start: number
    end: number
  }
}

// System stats API types
export interface SystemStatsResponse {
  server: {
    uptime: number
    version: string
    environment: string
    startTime: number
  }
  connections: {
    total: number
    active: number
    peak: number
    byHour: Array<{
      hour: number
      count: number
    }>
  }
  messages: {
    total: number
    today: number
    perHour: number
    byType: Record<string, number>
  }
  users: {
    total: number
    online: number
    registered: number
    active24h: number
  }
  performance: {
    averageResponseTime: number
    errorRate: number
    memoryUsage: number
    cpuUsage: number
  }
}

// Rate limiting response
export interface RateLimitResponse {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

// API request headers
export interface ApiRequestHeaders {
  'Content-Type'?: string
  'Accept'?: string
  'User-Agent'?: string
  'Authorization'?: string
  'X-Request-ID'?: string
  'X-Client-Version'?: string
}

// API response headers
export interface ApiResponseHeaders {
  'Content-Type': string
  'Cache-Control'?: string
  'X-RateLimit-Limit'?: string
  'X-RateLimit-Remaining'?: string
  'X-RateLimit-Reset'?: string
  'X-Response-Time'?: string
  'X-Request-ID'?: string
}

// Error codes enum
export enum ApiErrorCodes {
  // General errors (1000-1099)
  INTERNAL_ERROR = 'E1001',
  INVALID_REQUEST = 'E1002',
  VALIDATION_ERROR = 'E1003',
  NOT_FOUND = 'E1004',
  METHOD_NOT_ALLOWED = 'E1005',
  
  // Authentication/Authorization errors (1100-1199)
  UNAUTHORIZED = 'E1101',
  FORBIDDEN = 'E1102',
  TOKEN_EXPIRED = 'E1103',
  TOKEN_INVALID = 'E1104',
  
  // User errors (1200-1299)
  USER_NOT_FOUND = 'E1201',
  USERNAME_TAKEN = 'E1202',
  USERNAME_INVALID = 'E1203',
  USER_BANNED = 'E1204',
  
  // Message errors (1300-1399)
  MESSAGE_TOO_LONG = 'E1301',
  MESSAGE_EMPTY = 'E1302',
  MESSAGE_NOT_FOUND = 'E1303',
  MESSAGE_FORBIDDEN = 'E1304',
  
  // File errors (1400-1499)
  FILE_TOO_LARGE = 'E1401',
  FILE_TYPE_NOT_ALLOWED = 'E1402',
  FILE_NOT_FOUND = 'E1403',
  FILE_UPLOAD_FAILED = 'E1404',
  
  // Rate limiting errors (1500-1599)
  RATE_LIMITED = 'E1501',
  TOO_MANY_REQUESTS = 'E1502',
  
  // Server errors (1600-1699)
  SERVICE_UNAVAILABLE = 'E1601',
  MAINTENANCE_MODE = 'E1602',
  DATABASE_ERROR = 'E1603'
}

// HTTP status codes
export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
  headers: Partial<ApiRequestHeaders>
  validateStatus?: (status: number) => boolean
}

// API request options
export interface ApiRequestOptions {
  timeout?: number
  retries?: number
  headers?: Partial<ApiRequestHeaders>
  signal?: AbortSignal
  onUploadProgress?: (progressEvent: any) => void
  onDownloadProgress?: (progressEvent: any) => void
}