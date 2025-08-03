/**
 * Configuration Constants
 * 
 * Default configuration values used across the application.
 * These can be overridden by environment variables.
 */

// Server configuration defaults
export const SERVER_CONFIG = {
  // Network
  DEFAULT_PORT: 3001,
  DEFAULT_HOST: '0.0.0.0',
  
  // CORS
  CORS_ORIGIN: '*',
  CORS_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  CORS_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  
  // Database
  DATABASE_PATH: './data/app.db',
  DATABASE_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  
  // File storage
  UPLOAD_DIR: './uploads',
  TEMP_DIR: './temp',
  
  // Limits
  MAX_USERS: 100,
  MAX_MESSAGES_HISTORY: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILENAME_LENGTH: 255,
  
  // Cleanup intervals
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  FILE_CLEANUP_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  USER_CLEANUP_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Performance
  REQUEST_TIMEOUT: 30000, // 30 seconds
  BODY_LIMIT: '10mb',
  JSON_LIMIT: '10mb'
} as const

// Client configuration defaults
export const CLIENT_CONFIG = {
  // Server connection
  DEFAULT_SERVER_URL: 'http://localhost:3001',
  CONNECTION_TIMEOUT: 20000,
  
  // Auto-save intervals
  SETTINGS_SAVE_INTERVAL: 5000, // 5 seconds
  CACHE_SAVE_INTERVAL: 10000, // 10 seconds
  
  // UI
  DEFAULT_THEME: 'light' as const,
  DEFAULT_FONT_SIZE: 'medium' as const,
  SIDEBAR_WIDTH: 240,
  MIN_WINDOW_WIDTH: 800,
  MIN_WINDOW_HEIGHT: 600,
  
  // Message display
  MESSAGES_PER_PAGE: 50,
  MAX_MESSAGES_CACHE: 1000,
  MESSAGE_LOAD_THRESHOLD: 10, // Load more when scrolled to within 10 messages of top
  
  // Notifications
  NOTIFICATION_TIMEOUT: 5000, // 5 seconds
  MAX_NOTIFICATIONS: 5,
  
  // Performance
  VIRTUAL_SCROLL_THRESHOLD: 100, // Use virtual scrolling for >100 messages
  DEBOUNCE_DELAY: 300, // Input debounce delay
  THROTTLE_DELAY: 100, // Scroll throttle delay
  
  // Development
  DEBUG_MODE: false,
  LOG_LEVEL: 'info' as const
} as const

// Socket.io configuration
export const SOCKET_CONFIG = {
  // Connection
  TRANSPORTS: ['websocket', 'polling'] as const,
  TIMEOUT: 20000,
  AUTO_CONNECT: false,
  FORCE_NEW: false,
  
  // Reconnection
  RECONNECTION: true,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_ATTEMPTS: 5,
  RANDOM_RECONNECTION_FACTOR: 0.5,
  
  // Heartbeat
  PING_INTERVAL: 25000,
  PING_TIMEOUT: 60000,
  
  // Buffering
  SEND_BUFFER: true,
  RECEIVE_BUFFER_SIZE: 1024
} as const

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  // General API rate limits
  GENERAL: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 60, // requests per window
    MESSAGE: 'Too many requests, please try again later'
  },
  
  // Message sending rate limits
  MESSAGES: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 30, // messages per minute
    MESSAGE: 'Too many messages, please slow down'
  },
  
  // File upload rate limits
  UPLOADS: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 10, // files per hour
    MESSAGE: 'Too many file uploads, please try again later'
  },
  
  // Connection rate limits
  CONNECTIONS: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10, // connection attempts per minute
    MESSAGE: 'Too many connection attempts, please try again later'
  }
} as const

// Validation configuration
export const VALIDATION_CONFIG = {
  // Username validation
  USERNAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]{1,20}$/,
    RESERVED_NAMES: ['admin', 'system', 'bot', 'moderator', 'owner']
  },
  
  // Message validation
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
    ALLOW_EMPTY: false,
    TRIM_WHITESPACE: true
  },
  
  // File validation
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/zip'
    ],
    ALLOWED_EXTENSIONS: [
      '.jpg', '.jpeg', '.png', '.gif',
      '.pdf', '.txt', '.zip'
    ]
  }
} as const

// Security configuration
export const SECURITY_CONFIG = {
  // Password requirements (future feature)
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true
  },
  
  // Session configuration (future feature)
  SESSION: {
    COOKIE_NAME: 'im-chat-session',
    SECRET_LENGTH: 32,
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SECURE: false, // Set to true in production with HTTPS
    HTTP_ONLY: true,
    SAME_SITE: 'lax' as const
  },
  
  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
    STYLE_SRC: ["'self'", "'unsafe-inline'"],
    IMG_SRC: ["'self'", 'data:', 'blob:'],
    CONNECT_SRC: ["'self'", 'ws:', 'wss:'],
    FONT_SRC: ["'self'"],
    OBJECT_SRC: ["'none'"],
    MEDIA_SRC: ["'self'"],
    FRAME_SRC: ["'none'"]
  }
} as const

// Logging configuration
export const LOGGING_CONFIG = {
  // Log levels
  LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    HTTP: 3,
    DEBUG: 4
  },
  
  // Log formats
  FORMATS: {
    CONSOLE: 'simple',
    FILE: 'json',
    ERROR_FILE: 'json'
  },
  
  // File rotation
  ROTATION: {
    MAX_SIZE: '20m',
    MAX_FILES: '14d',
    DATE_PATTERN: 'YYYY-MM-DD'
  },
  
  // Default settings
  DEFAULT_LEVEL: 'info',
  COLORIZE: true,
  TIMESTAMP: true
} as const

// Feature flags
export const FEATURES = {
  // Current features
  TEXT_MESSAGING: true,
  USER_LIST: true,
  MESSAGE_HISTORY: true,
  TYPING_INDICATORS: true,
  
  // Phase 2 features
  FILE_UPLOAD: false,
  FILE_SHARING: false,
  GROUP_CHAT: false,
  
  // Phase 3 features
  VOICE_CHAT: false,
  VIDEO_CHAT: false,
  SCREEN_SHARING: false,
  
  // Future features
  USER_AUTHENTICATION: false,
  MESSAGE_ENCRYPTION: false,
  PUSH_NOTIFICATIONS: false,
  THEMES: true,
  CUSTOM_EMOJIS: false,
  MESSAGE_REACTIONS: false,
  MESSAGE_SEARCH: false
} as const

// Environment-specific overrides
export const ENVIRONMENT_CONFIGS = {
  development: {
    LOG_LEVEL: 'debug',
    DEBUG_MODE: true,
    ENABLE_CORS: true,
    MINIFY_ASSETS: false
  },
  production: {
    LOG_LEVEL: 'info',
    DEBUG_MODE: false,
    ENABLE_CORS: false,
    MINIFY_ASSETS: true
  },
  test: {
    LOG_LEVEL: 'error',
    DEBUG_MODE: false,
    ENABLE_CORS: true,
    MINIFY_ASSETS: false
  }
} as const