/**
 * User validation functions
 */

import {
  validateString,
  validateRequired,
  ValidationResult,
  createValidationResult,
  combineValidationResults
} from './index'
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  USERNAME_REGEX
} from '../constants'
import { UserJoinData, CreateUserData } from '../types/user'

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'system',
  'bot',
  'moderator',
  'mod',
  'owner',
  'root',
  'user',
  'guest',
  'anonymous',
  'null',
  'undefined',
  'deleted',
  'banned'
]

/**
 * Validate username format and constraints
 */
export const validateUsername = (username: string): ValidationResult => {
  // Required check
  const requiredResult = validateRequired(username)
  if (!requiredResult.isValid) {
    return requiredResult
  }
  
  // String validation with length and pattern
  const stringResult = validateString(
    username,
    MIN_USERNAME_LENGTH,
    MAX_USERNAME_LENGTH,
    USERNAME_REGEX
  )
  
  if (!stringResult.isValid) {
    return stringResult
  }
  
  // Check for reserved usernames
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return createValidationResult(false, [
      `Username '${username}' is reserved and cannot be used`
    ])
  }
  
  // Check for potentially problematic patterns
  const warnings: string[] = []
  
  // Warn about usernames that start or end with underscore
  if (username.startsWith('_') || username.endsWith('_')) {
    warnings.push('Usernames starting or ending with underscore may cause display issues')
  }
  
  // Warn about usernames with consecutive underscores
  if (username.includes('__')) {
    warnings.push('Usernames with consecutive underscores may be difficult to read')
  }
  
  // Warn about all numeric usernames
  if (/^\d+$/.test(username)) {
    warnings.push('All-numeric usernames may be confusing with user IDs')
  }
  
  return createValidationResult(true, [], warnings)
}

/**
 * Validate user join data
 */
export const validateUserJoinData = (data: any): ValidationResult => {
  const errors: string[] = []
  
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return createValidationResult(false, ['User join data must be an object'])
  }
  
  // Validate username
  const usernameResult = validateUsername(data.username)
  if (!usernameResult.isValid) {
    errors.push(...usernameResult.errors.map(err => `Username: ${err}`))
  }
  
  // Validate version (optional)
  if (data.version !== undefined) {
    const versionResult = validateString(data.version, 0, 20)
    if (!versionResult.isValid) {
      errors.push(...versionResult.errors.map(err => `Version: ${err}`))
    }
  }
  
  // Validate client info (optional)
  if (data.clientInfo !== undefined) {
    if (typeof data.clientInfo !== 'object' || data.clientInfo === null) {
      errors.push('Client info must be an object')
    } else {
      // Validate platform
      if (data.clientInfo.platform !== undefined) {
        const platformResult = validateString(data.clientInfo.platform, 0, 50)
        if (!platformResult.isValid) {
          errors.push(...platformResult.errors.map(err => `Client platform: ${err}`))
        }
      }
      
      // Validate user agent
      if (data.clientInfo.userAgent !== undefined) {
        const userAgentResult = validateString(data.clientInfo.userAgent, 0, 500)
        if (!userAgentResult.isValid) {
          errors.push(...userAgentResult.errors.map(err => `User agent: ${err}`))
        }
      }
    }
  }
  
  return createValidationResult(errors.length === 0, errors, usernameResult.warnings)
}

/**
 * Validate user creation data
 */
export const validateCreateUserData = (data: any): ValidationResult => {
  const errors: string[] = []
  
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return createValidationResult(false, ['User creation data must be an object'])
  }
  
  // Validate username
  const usernameResult = validateUsername(data.username)
  if (!usernameResult.isValid) {
    errors.push(...usernameResult.errors.map(err => `Username: ${err}`))
  }
  
  return createValidationResult(errors.length === 0, errors, usernameResult.warnings)
}

/**
 * Validate user update data
 */
export const validateUserUpdateData = (data: any): ValidationResult => {
  const errors: string[] = []
  
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return createValidationResult(false, ['User update data must be an object'])
  }
  
  // Validate username (optional)
  if (data.username !== undefined) {
    const usernameResult = validateUsername(data.username)
    if (!usernameResult.isValid) {
      errors.push(...usernameResult.errors.map(err => `Username: ${err}`))
    }
  }
  
  // Validate lastSeen (optional)
  if (data.lastSeen !== undefined) {
    if (typeof data.lastSeen !== 'number' || data.lastSeen < 0) {
      errors.push('Last seen must be a positive number (timestamp)')
    }
  }
  
  // Validate status (optional)
  if (data.status !== undefined) {
    const validStatuses = ['online', 'offline', 'away', 'busy']
    if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`)
    }
  }
  
  return createValidationResult(errors.length === 0, errors)
}

/**
 * Validate user ID format
 */
export const validateUserId = (userId: string): ValidationResult => {
  // Check if it matches the expected format: user_${timestamp}_${random}
  const userIdRegex = /^user_\d+_[a-z0-9]+$/
  
  if (!userIdRegex.test(userId)) {
    return createValidationResult(false, ['Invalid user ID format'])
  }
  
  return createValidationResult(true)
}

/**
 * Validate user query parameters
 */
export const validateUserQuery = (query: any): ValidationResult => {
  const errors: string[] = []
  
  if (typeof query !== 'object' || query === null) {
    return createValidationResult(false, ['Query must be an object'])
  }
  
  // Validate status filter (optional)
  if (query.status !== undefined) {
    const validStatuses = ['online', 'offline', 'away', 'busy']
    if (!validStatuses.includes(query.status)) {
      errors.push(`Status filter must be one of: ${validStatuses.join(', ')}`)
    }
  }
  
  // Validate search term (optional)
  if (query.search !== undefined) {
    const searchResult = validateString(query.search, 0, 50)
    if (!searchResult.isValid) {
      errors.push(...searchResult.errors.map(err => `Search term: ${err}`))
    }
  }
  
  // Validate limit (optional)
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'number' || query.limit < 1 || query.limit > 100) {
      errors.push('Limit must be a number between 1 and 100')
    }
  }
  
  // Validate includeOffline flag (optional)
  if (query.includeOffline !== undefined) {
    if (typeof query.includeOffline !== 'boolean') {
      errors.push('Include offline must be a boolean')
    }
  }
  
  return createValidationResult(errors.length === 0, errors)
}

/**
 * Sanitize username by removing invalid characters and trimming
 */
export const sanitizeUsername = (username: string): string => {
  return username
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove invalid characters
    .substring(0, MAX_USERNAME_LENGTH) // Truncate if too long
}

/**
 * Generate username suggestions when the desired username is taken
 */
export const generateUsernameSuggestions = (
  baseUsername: string,
  takenUsernames: string[] = []
): string[] => {
  const suggestions: string[] = []
  const sanitized = sanitizeUsername(baseUsername)
  
  if (sanitized.length === 0) {
    return ['user1', 'user2', 'user3']
  }
  
  // Add numbers to the end
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${sanitized}${i}`
    if (suggestion.length <= MAX_USERNAME_LENGTH && !takenUsernames.includes(suggestion)) {
      suggestions.push(suggestion)
    }
  }
  
  // Add underscore and numbers
  if (sanitized.length < MAX_USERNAME_LENGTH - 2) {
    for (let i = 1; i <= 3; i++) {
      const suggestion = `${sanitized}_${i}`
      if (!takenUsernames.includes(suggestion)) {
        suggestions.push(suggestion)
      }
    }
  }
  
  // Add current year
  const year = new Date().getFullYear().toString().slice(-2)
  const yearSuggestion = `${sanitized}${year}`
  if (yearSuggestion.length <= MAX_USERNAME_LENGTH && !takenUsernames.includes(yearSuggestion)) {
    suggestions.push(yearSuggestion)
  }
  
  return suggestions.slice(0, 5) // Return up to 5 suggestions
}