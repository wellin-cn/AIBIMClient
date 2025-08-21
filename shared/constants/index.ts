/**
 * Shared Constants for IM Chat System
 * 
 * This file exports all constants used across both server and client applications.
 * 
 * @version 1.0.0
 */

// Re-export all constants
export * from './events'
export * from './errors'
export * from './config'

// Application constants
export const APP_NAME = 'IM Chat'
export const APP_VERSION = '1.0.0'
export const API_VERSION = 'v1'

// Default values
export const DEFAULT_SERVER_PORT = 3001
export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 100

// Time constants (in milliseconds)
export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const WEEK = 7 * DAY

// Validation constants
export const MIN_USERNAME_LENGTH = 1
export const MAX_USERNAME_LENGTH = 20
export const MIN_MESSAGE_LENGTH = 1
export const MAX_MESSAGE_LENGTH = 1000
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILENAME_LENGTH = 255

// Connection constants
export const SOCKET_TIMEOUT = 20000
export const RECONNECT_ATTEMPTS = 5
export const RECONNECT_DELAY = 1000
export const RECONNECT_DELAY_MAX = 5000
export const PING_INTERVAL = 25000
export const PING_TIMEOUT = 60000

// Database constants
export const MAX_MESSAGES_HISTORY = 1000
export const MAX_USERS_DISPLAY = 100
export const DATABASE_CLEANUP_INTERVAL = 24 * HOUR

// Rate limiting constants
export const RATE_LIMIT_WINDOW = 60 * SECOND // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 60
export const RATE_LIMIT_MAX_MESSAGES = 30
export const RATE_LIMIT_MAX_FILE_UPLOADS = 5

// File upload constants
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/zip'
] as const

export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.pdf',
  '.txt',
  '.zip'
] as const

// Regular expressions
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{1,20}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const URL_REGEX = /^https?:\/\/.+/

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// Environment types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
} as const

// Log levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const