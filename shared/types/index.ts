/**
 * Shared Type Definitions for IM Chat System
 * 
 * This file exports all TypeScript type definitions used across
 * both server and client applications.
 * 
 * @version 1.0.0
 * @author IM Chat Team
 */

// Re-export all types for easy importing
export * from './user'
export * from './message'
export * from './socket'
export * from './api'

// Common utility types
export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt?: number
}

export interface Timestamps {
  createdAt: number
  updatedAt: number
}

// Pagination types
export interface PaginationParams {
  limit?: number        // Default: 50, Max: 100
  before?: number       // Timestamp - get data before this time
  after?: number        // Timestamp - get data after this time
  page?: number         // Page number (alternative to before/after)
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
    hasPrevious: boolean
  }
}

// Common status enums
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export enum UserStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy'
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp?: number
}

export interface ValidationError extends AppError {
  field?: string
  value?: any
}

// Environment configuration
export interface AppConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  SERVER_PORT: number
  DATABASE_PATH: string
  UPLOAD_DIR: string
  MAX_FILE_SIZE: number
  CORS_ORIGIN: string
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
}

// Client configuration
export interface ClientConfig {
  SERVER_URL: string
  APP_NAME: string
  APP_VERSION: string
  MAX_MESSAGE_LENGTH: number
  MAX_USERNAME_LENGTH: number
  RECONNECT_ATTEMPTS: number
  RECONNECT_DELAY: number
}