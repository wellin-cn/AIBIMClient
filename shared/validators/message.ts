/**
 * Message validation functions
 */

import {
  validateString,
  validateRequired,
  validateNumber,
  ValidationResult,
  createValidationResult
} from './index'
import {
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} from '../constants'
import { MessageSendData, CreateMessageData, MessageType } from '../types/message'

/**
 * Validate message content
 */
export const validateMessageContent = (content: string, messageType: MessageType = MessageType.TEXT): ValidationResult => {
  // Required check
  const requiredResult = validateRequired(content)
  if (!requiredResult.isValid) {
    return requiredResult
  }
  
  // Different validation rules for different message types
  switch (messageType) {
    case MessageType.TEXT:
      return validateTextMessageContent(content)
    case MessageType.FILE:
      return validateFileMessageContent(content)
    case MessageType.SYSTEM:
      return validateSystemMessageContent(content)
    default:
      return createValidationResult(false, ['Invalid message type'])
  }
}

/**
 * Validate text message content
 */
export const validateTextMessageContent = (content: string): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Basic string validation
  const stringResult = validateString(
    content,
    MIN_MESSAGE_LENGTH,
    MAX_MESSAGE_LENGTH
  )
  
  if (!stringResult.isValid) {
    return stringResult
  }
  
  // Trim whitespace for validation (but don't modify original)
  const trimmed = content.trim()
  
  // Check if message is only whitespace
  if (trimmed.length === 0) {
    errors.push('Message cannot be empty or contain only whitespace')
  }
  
  // Check for very long lines
  const lines = content.split('\n')
  const longLines = lines.filter(line => line.length > 100)
  if (longLines.length > 0) {
    warnings.push('Message contains very long lines that may be difficult to read')
  }
  
  // Check for many line breaks
  if (lines.length > 20) {
    warnings.push('Message contains many line breaks')
  }
  
  // Check for repeated characters (potential spam)
  const repeatedChars = /(.)\1{10,}/.test(content)
  if (repeatedChars) {
    warnings.push('Message contains many repeated characters')
  }
  
  // Check for all caps (potential shouting)
  const allCaps = /^[A-Z\s\d\W]+$/.test(content) && content.length > 20
  if (allCaps) {
    warnings.push('Message appears to be in all capitals')
  }
  
  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Validate file message content (description)
 */
export const validateFileMessageContent = (content: string): ValidationResult => {
  // File message content is optional description
  if (content.length === 0) {
    return createValidationResult(true)
  }
  
  // Basic string validation with shorter limit for descriptions
  return validateString(content, 0, 200)
}

/**
 * Validate system message content
 */
export const validateSystemMessageContent = (content: string): ValidationResult => {
  // System messages have more lenient validation
  return validateString(content, 1, 500)
}

/**
 * Validate message send data
 */
export const validateMessageSendData = (data: any): ValidationResult => {
  const errors: string[] = []
  
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return createValidationResult(false, ['Message data must be an object'])
  }
  
  // Validate message type
  const validTypes = Object.values(MessageType)
  if (!validTypes.includes(data.type)) {
    errors.push(`Message type must be one of: ${validTypes.join(', ')}`)
  }
  
  // Validate content based on type
  if (data.type) {
    const contentResult = validateMessageContent(data.content, data.type)
    if (!contentResult.isValid) {
      errors.push(...contentResult.errors.map(err => `Content: ${err}`))
    }
  }
  
  // Validate timestamp
  const timestampResult = validateNumber(data.timestamp, 0, Date.now() + 60000) // Allow 1 minute in future
  if (!timestampResult.isValid) {
    errors.push(...timestampResult.errors.map(err => `Timestamp: ${err}`))
  }
  
  // Validate tempId (optional)
  if (data.tempId !== undefined) {
    const tempIdResult = validateString(data.tempId, 1, 50)
    if (!tempIdResult.isValid) {
      errors.push(...tempIdResult.errors.map(err => `Temp ID: ${err}`))
    }
  }
  
  // Validate file data for file messages
  if (data.type === MessageType.FILE && data.fileData) {
    const fileDataResult = validateFileData(data.fileData)
    if (!fileDataResult.isValid) {
      errors.push(...fileDataResult.errors.map(err => `File data: ${err}`))
    }
  }
  
  return createValidationResult(errors.length === 0, errors)
}

/**
 * Validate file data for file messages
 */
export const validateFileData = (fileData: any): ValidationResult => {
  const errors: string[] = []
  
  if (typeof fileData !== 'object' || fileData === null) {
    return createValidationResult(false, ['File data must be an object'])
  }
  
  // Validate file name
  if (!fileData.fileName || typeof fileData.fileName !== 'string') {
    errors.push('File name is required and must be a string')
  } else if (fileData.fileName.length > 255) {
    errors.push('File name is too long (max 255 characters)')
  }
  
  // Validate file size
  const sizeResult = validateNumber(fileData.fileSize, 1, MAX_FILE_SIZE, true)
  if (!sizeResult.isValid) {
    errors.push(...sizeResult.errors.map(err => `File size: ${err}`))
  }
  
  // Validate MIME type
  if (!fileData.mimeType || typeof fileData.mimeType !== 'string') {
    errors.push('MIME type is required and must be a string')
  } else if (!ALLOWED_FILE_TYPES.includes(fileData.mimeType)) {
    errors.push(`MIME type '${fileData.mimeType}' is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`)
  }
  
  return createValidationResult(errors.length === 0, errors)
}

/**
 * Validate message query parameters
 */
export const validateMessageQuery = (query: any): ValidationResult => {
  const errors: string[] = []
  
  if (typeof query !== 'object' || query === null) {
    return createValidationResult(false, ['Query must be an object'])
  }
  
  // Validate limit (optional)
  if (query.limit !== undefined) {
    const limitResult = validateNumber(query.limit, 1, 100, true)
    if (!limitResult.isValid) {
      errors.push(...limitResult.errors.map(err => `Limit: ${err}`))
    }
  }
  
  // Validate before timestamp (optional)
  if (query.before !== undefined) {
    const beforeResult = validateNumber(query.before, 0, Date.now() + 60000)
    if (!beforeResult.isValid) {
      errors.push(...beforeResult.errors.map(err => `Before timestamp: ${err}`))
    }
  }
  
  // Validate after timestamp (optional)
  if (query.after !== undefined) {
    const afterResult = validateNumber(query.after, 0, Date.now() + 60000)
    if (!afterResult.isValid) {
      errors.push(...afterResult.errors.map(err => `After timestamp: ${err}`))
    }
  }
  
  // Validate user ID filter (optional)
  if (query.userId !== undefined) {
    const userIdResult = validateString(query.userId, 1, 50)
    if (!userIdResult.isValid) {
      errors.push(...userIdResult.errors.map(err => `User ID: ${err}`))
    }
  }
  
  // Validate message type filter (optional)
  if (query.type !== undefined) {
    const validTypes = Object.values(MessageType)
    if (!validTypes.includes(query.type)) {
      errors.push(`Message type must be one of: ${validTypes.join(', ')}`)
    }
  }
  
  // Validate search term (optional)
  if (query.search !== undefined) {
    const searchResult = validateString(query.search, 1, 100)
    if (!searchResult.isValid) {
      errors.push(...searchResult.errors.map(err => `Search term: ${err}`))
    }
  }
  
  // Validate before and after relationship
  if (query.before !== undefined && query.after !== undefined) {
    if (query.before <= query.after) {
      errors.push('Before timestamp must be greater than after timestamp')
    }
  }
  
  return createValidationResult(errors.length === 0, errors)
}

/**
 * Validate message ID format
 */
export const validateMessageId = (messageId: string): ValidationResult => {
  // Check if it matches the expected format: msg_${timestamp}_${random}
  const messageIdRegex = /^msg_\d+_[a-z0-9]+$/
  
  if (!messageIdRegex.test(messageId)) {
    return createValidationResult(false, ['Invalid message ID format'])
  }
  
  return createValidationResult(true)
}

/**
 * Sanitize message content by removing harmful content
 */
export const sanitizeMessageContent = (content: string): string => {
  return content
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove null characters
    .replace(/\0/g, '')
}

/**
 * Check if message content appears to be spam
 */
export const isSpamMessage = (content: string): boolean => {
  // Check for excessive repetition
  const repeatedWords = /\b(\w+)\s+\1\s+\1/i.test(content)
  const repeatedChars = /(.)\1{5,}/.test(content)
  
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  const excessiveCaps = capsRatio > 0.7 && content.length > 10
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /click here/i,
    /free money/i,
    /urgent/i,
    /act now/i,
    /limited time/i
  ]
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(content))
  
  return repeatedWords || repeatedChars || excessiveCaps || hasSuspiciousPattern
}