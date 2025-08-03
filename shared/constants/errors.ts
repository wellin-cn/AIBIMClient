/**
 * Error Codes and Messages
 * 
 * Centralized error definitions for consistent error handling
 * across client and server applications.
 */

// Error code enum
export enum ERROR_CODES {
  // General errors (1000-1099)
  INTERNAL_ERROR = 'E1001',
  INVALID_REQUEST = 'E1002',
  VALIDATION_ERROR = 'E1003',
  NOT_FOUND = 'E1004',
  METHOD_NOT_ALLOWED = 'E1005',
  TIMEOUT = 'E1006',
  
  // Authentication/Authorization errors (1100-1199)
  UNAUTHORIZED = 'E1101',
  FORBIDDEN = 'E1102',
  TOKEN_EXPIRED = 'E1103',
  TOKEN_INVALID = 'E1104',
  SESSION_EXPIRED = 'E1105',
  
  // User errors (1200-1299)
  USER_NOT_FOUND = 'E1201',
  USERNAME_TAKEN = 'E1202',
  USERNAME_INVALID = 'E1203',
  USERNAME_TOO_SHORT = 'E1204',
  USERNAME_TOO_LONG = 'E1205',
  USER_BANNED = 'E1206',
  USER_OFFLINE = 'E1207',
  MAX_USERS_REACHED = 'E1208',
  
  // Message errors (1300-1399)
  MESSAGE_TOO_LONG = 'E1301',
  MESSAGE_EMPTY = 'E1302',
  MESSAGE_NOT_FOUND = 'E1303',
  MESSAGE_FORBIDDEN = 'E1304',
  MESSAGE_INVALID_TYPE = 'E1305',
  MESSAGE_SEND_FAILED = 'E1306',
  
  // File errors (1400-1499)
  FILE_TOO_LARGE = 'E1401',
  FILE_TYPE_NOT_ALLOWED = 'E1402',
  FILE_NOT_FOUND = 'E1403',
  FILE_UPLOAD_FAILED = 'E1404',
  FILE_DOWNLOAD_FAILED = 'E1405',
  FILE_CORRUPTED = 'E1406',
  STORAGE_FULL = 'E1407',
  
  // Rate limiting errors (1500-1599)
  RATE_LIMITED = 'E1501',
  TOO_MANY_REQUESTS = 'E1502',
  TOO_MANY_MESSAGES = 'E1503',
  TOO_MANY_CONNECTIONS = 'E1504',
  
  // Server errors (1600-1699)
  SERVICE_UNAVAILABLE = 'E1601',
  MAINTENANCE_MODE = 'E1602',
  DATABASE_ERROR = 'E1603',
  NETWORK_ERROR = 'E1604',
  EXTERNAL_SERVICE_ERROR = 'E1605',
  
  // Socket errors (1700-1799)
  SOCKET_CONNECTION_FAILED = 'E1701',
  SOCKET_DISCONNECTED = 'E1702',
  SOCKET_TIMEOUT = 'E1703',
  SOCKET_ERROR = 'E1704',
  INVALID_SOCKET_EVENT = 'E1705'
}

// Error messages mapping
export const ERROR_MESSAGES: Record<ERROR_CODES, string> = {
  // General errors
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error occurred',
  [ERROR_CODES.INVALID_REQUEST]: 'Invalid request format or data',
  [ERROR_CODES.VALIDATION_ERROR]: 'Data validation failed',
  [ERROR_CODES.NOT_FOUND]: 'Requested resource not found',
  [ERROR_CODES.METHOD_NOT_ALLOWED]: 'HTTP method not allowed',
  [ERROR_CODES.TIMEOUT]: 'Request timeout',
  
  // Authentication/Authorization errors
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  [ERROR_CODES.FORBIDDEN]: 'Access forbidden',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Authentication token expired',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.SESSION_EXPIRED]: 'Session has expired',
  
  // User errors
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.USERNAME_TAKEN]: 'Username is already taken',
  [ERROR_CODES.USERNAME_INVALID]: 'Username contains invalid characters',
  [ERROR_CODES.USERNAME_TOO_SHORT]: 'Username is too short',
  [ERROR_CODES.USERNAME_TOO_LONG]: 'Username is too long',
  [ERROR_CODES.USER_BANNED]: 'User is banned from the chat',
  [ERROR_CODES.USER_OFFLINE]: 'User is offline',
  [ERROR_CODES.MAX_USERS_REACHED]: 'Maximum number of users reached',
  
  // Message errors
  [ERROR_CODES.MESSAGE_TOO_LONG]: 'Message is too long',
  [ERROR_CODES.MESSAGE_EMPTY]: 'Message cannot be empty',
  [ERROR_CODES.MESSAGE_NOT_FOUND]: 'Message not found',
  [ERROR_CODES.MESSAGE_FORBIDDEN]: 'Not allowed to access this message',
  [ERROR_CODES.MESSAGE_INVALID_TYPE]: 'Invalid message type',
  [ERROR_CODES.MESSAGE_SEND_FAILED]: 'Failed to send message',
  
  // File errors
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds limit',
  [ERROR_CODES.FILE_TYPE_NOT_ALLOWED]: 'File type not allowed',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found',
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'File upload failed',
  [ERROR_CODES.FILE_DOWNLOAD_FAILED]: 'File download failed',
  [ERROR_CODES.FILE_CORRUPTED]: 'File is corrupted',
  [ERROR_CODES.STORAGE_FULL]: 'Storage space full',
  
  // Rate limiting errors
  [ERROR_CODES.RATE_LIMITED]: 'Rate limit exceeded',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests',
  [ERROR_CODES.TOO_MANY_MESSAGES]: 'Too many messages sent',
  [ERROR_CODES.TOO_MANY_CONNECTIONS]: 'Too many connections',
  
  // Server errors
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ERROR_CODES.MAINTENANCE_MODE]: 'System is under maintenance',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
  
  // Socket errors
  [ERROR_CODES.SOCKET_CONNECTION_FAILED]: 'Socket connection failed',
  [ERROR_CODES.SOCKET_DISCONNECTED]: 'Socket connection lost',
  [ERROR_CODES.SOCKET_TIMEOUT]: 'Socket connection timeout',
  [ERROR_CODES.SOCKET_ERROR]: 'Socket communication error',
  [ERROR_CODES.INVALID_SOCKET_EVENT]: 'Invalid socket event'
}

// User-friendly error messages (for client display)
export const USER_ERROR_MESSAGES: Partial<Record<ERROR_CODES, string>> = {
  [ERROR_CODES.INTERNAL_ERROR]: 'Something went wrong. Please try again.',
  [ERROR_CODES.USERNAME_TAKEN]: 'This username is already taken. Please choose another one.',
  [ERROR_CODES.USERNAME_INVALID]: 'Username can only contain letters, numbers, and underscores.',
  [ERROR_CODES.USERNAME_TOO_SHORT]: 'Username must be at least 1 character long.',
  [ERROR_CODES.USERNAME_TOO_LONG]: 'Username cannot be longer than 20 characters.',
  [ERROR_CODES.MESSAGE_TOO_LONG]: 'Message is too long. Please keep it under 1000 characters.',
  [ERROR_CODES.MESSAGE_EMPTY]: 'Please enter a message.',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Maximum size is 10MB.',
  [ERROR_CODES.FILE_TYPE_NOT_ALLOWED]: 'This file type is not supported.',
  [ERROR_CODES.RATE_LIMITED]: 'You are sending messages too quickly. Please slow down.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ERROR_CODES.SOCKET_CONNECTION_FAILED]: 'Unable to connect to chat server. Please check your connection.',
  [ERROR_CODES.SOCKET_DISCONNECTED]: 'Connection lost. Attempting to reconnect...',
  [ERROR_CODES.MAX_USERS_REACHED]: 'The chat room is full. Please try again later.'
}

// Error severity levels
export enum ERROR_SEVERITY {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ERROR_CATEGORY {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  NETWORK = 'network',
  DATABASE = 'database',
  EXTERNAL = 'external'
}

// Error metadata mapping
export const ERROR_METADATA: Record<ERROR_CODES, {
  severity: ERROR_SEVERITY
  category: ERROR_CATEGORY
  retryable: boolean
  userFacing: boolean
}> = {
  // General errors
  [ERROR_CODES.INTERNAL_ERROR]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.INVALID_REQUEST]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: false
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.NOT_FOUND]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.METHOD_NOT_ALLOWED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: false,
    userFacing: false
  },
  [ERROR_CODES.TIMEOUT]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.NETWORK,
    retryable: true,
    userFacing: true
  },
  
  // Authentication/Authorization errors
  [ERROR_CODES.UNAUTHORIZED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.AUTHENTICATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.FORBIDDEN]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.AUTHORIZATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.TOKEN_EXPIRED]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.AUTHENTICATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.TOKEN_INVALID]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.AUTHENTICATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.SESSION_EXPIRED]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.AUTHENTICATION,
    retryable: false,
    userFacing: true
  },
  
  // User errors
  [ERROR_CODES.USER_NOT_FOUND]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.USERNAME_TAKEN]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.USERNAME_INVALID]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.USERNAME_TOO_SHORT]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.USERNAME_TOO_LONG]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.USER_BANNED]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.AUTHORIZATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.USER_OFFLINE]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.MAX_USERS_REACHED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: true,
    userFacing: true
  },
  
  // Message errors
  [ERROR_CODES.MESSAGE_TOO_LONG]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.MESSAGE_EMPTY]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.MESSAGE_NOT_FOUND]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.MESSAGE_FORBIDDEN]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.AUTHORIZATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.MESSAGE_INVALID_TYPE]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: false
  },
  [ERROR_CODES.MESSAGE_SEND_FAILED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  
  // File errors
  [ERROR_CODES.FILE_TOO_LARGE]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.FILE_TYPE_NOT_ALLOWED]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.FILE_NOT_FOUND]: {
    severity: ERROR_SEVERITY.LOW,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.FILE_UPLOAD_FAILED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.FILE_DOWNLOAD_FAILED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.FILE_CORRUPTED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: false,
    userFacing: true
  },
  [ERROR_CODES.STORAGE_FULL]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: false,
    userFacing: true
  },
  
  // Rate limiting errors
  [ERROR_CODES.RATE_LIMITED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.TOO_MANY_REQUESTS]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.TOO_MANY_MESSAGES]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.BUSINESS_LOGIC,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.TOO_MANY_CONNECTIONS]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  
  // Server errors
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.MAINTENANCE_MODE]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.DATABASE_ERROR]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.DATABASE,
    retryable: true,
    userFacing: false
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.NETWORK,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.EXTERNAL,
    retryable: true,
    userFacing: false
  },
  
  // Socket errors
  [ERROR_CODES.SOCKET_CONNECTION_FAILED]: {
    severity: ERROR_SEVERITY.HIGH,
    category: ERROR_CATEGORY.NETWORK,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.SOCKET_DISCONNECTED]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.NETWORK,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.SOCKET_TIMEOUT]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.NETWORK,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.SOCKET_ERROR]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.SYSTEM,
    retryable: true,
    userFacing: true
  },
  [ERROR_CODES.INVALID_SOCKET_EVENT]: {
    severity: ERROR_SEVERITY.MEDIUM,
    category: ERROR_CATEGORY.VALIDATION,
    retryable: false,
    userFacing: false
  }
}

// Helper function to get error details
export const getErrorDetails = (code: ERROR_CODES) => {
  return {
    code,
    message: ERROR_MESSAGES[code],
    userMessage: USER_ERROR_MESSAGES[code],
    metadata: ERROR_METADATA[code]
  }
}

// Helper function to check if error is retryable
export const isRetryableError = (code: ERROR_CODES): boolean => {
  return ERROR_METADATA[code]?.retryable ?? false
}

// Helper function to check if error should be shown to user
export const isUserFacingError = (code: ERROR_CODES): boolean => {
  return ERROR_METADATA[code]?.userFacing ?? false
}