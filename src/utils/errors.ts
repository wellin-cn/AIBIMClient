import { ApiErrorCodes, AppError, ValidationError } from '../types/api';

// Custom error classes
export class ApplicationError extends Error implements AppError {
  public code: string;
  public details?: any;
  public timestamp: number;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationErrorClass extends ApplicationError implements ValidationError {
  public field?: string;
  public value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(ApiErrorCodes.VALIDATION_ERROR, message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

// Error factory functions
export const createError = {
  invalidRequest: (message: string, details?: any) => 
    new ApplicationError(ApiErrorCodes.INVALID_REQUEST, message, details),
    
  notFound: (resource: string) => 
    new ApplicationError(ApiErrorCodes.NOT_FOUND, `${resource} not found`),
    
  validation: (message: string, field?: string, value?: any) => 
    new ValidationErrorClass(message, field, value),
    
  usernameTaken: (username: string) => 
    new ApplicationError(ApiErrorCodes.USERNAME_TAKEN, 'Username already taken', { username }),
    
  usernameInvalid: (username: string) => 
    new ApplicationError(ApiErrorCodes.USERNAME_INVALID, 'Username is invalid', { username }),
    
  messageTooLong: (length: number, maxLength: number) => 
    new ApplicationError(ApiErrorCodes.MESSAGE_TOO_LONG, 
      `Message too long: ${length} characters (max: ${maxLength})`),
    
  messageEmpty: () => 
    new ApplicationError(ApiErrorCodes.MESSAGE_EMPTY, 'Message cannot be empty'),
    
  rateLimited: (retryAfter?: number) => 
    new ApplicationError(ApiErrorCodes.RATE_LIMITED, 'Rate limit exceeded', { retryAfter }),
    
  fileTooLarge: (size: number, maxSize: number) => 
    new ApplicationError(ApiErrorCodes.FILE_TOO_LARGE, 
      `File too large: ${size} bytes (max: ${maxSize})`),
    
  fileTypeNotAllowed: (type: string) => 
    new ApplicationError(ApiErrorCodes.FILE_TYPE_NOT_ALLOWED, 
      `File type not allowed: ${type}`),
    
  serviceUnavailable: (service: string) => 
    new ApplicationError(ApiErrorCodes.SERVICE_UNAVAILABLE, 
      `Service unavailable: ${service}`),
    
  databaseError: (operation: string) => 
    new ApplicationError(ApiErrorCodes.DATABASE_ERROR, 
      `Database operation failed: ${operation}`),
    
  internal: (message: string, details?: any) => 
    new ApplicationError(ApiErrorCodes.INTERNAL_ERROR, message, details)
};

// Error response helper
export const formatErrorResponse = (error: Error): AppError => {
  if (error instanceof ApplicationError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp
    };
  }
  
  // Handle unknown errors
  return {
    code: ApiErrorCodes.INTERNAL_ERROR,
    message: 'Internal server error',
    timestamp: Date.now()
  };
};