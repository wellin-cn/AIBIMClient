/**
 * Validation utility functions
 */

import { USERNAME_REGEX, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../constants'

/**
 * Check if a string is a valid username
 */
export const isValidUsername = (username: string): boolean => {
  return typeof username === 'string' && 
         username.length >= 1 && 
         username.length <= 20 && 
         USERNAME_REGEX.test(username)
}

/**
 * Check if a string is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a value is not empty (not null, undefined, or empty string)
 */
export const isNotEmpty = (value: any): boolean => {
  return value !== null && value !== undefined && value !== ''
}

/**
 * Check if a string contains only alphanumeric characters
 */
export const isAlphanumeric = (str: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(str)
}

/**
 * Check if a number is within a specific range
 */
export const isInRange = (
  value: number, 
  min: number, 
  max: number, 
  inclusive: boolean = true
): boolean => {
  if (inclusive) {
    return value >= min && value <= max
  } else {
    return value > min && value < max
  }
}

/**
 * Check if a file is valid (size and type)
 */
export const isValidFile = (file: {
  size: number
  type: string
  name: string
}): boolean => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return false
  }
  
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return false
  }
  
  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    return false
  }
  
  return true
}

/**
 * Check if a timestamp is valid (not in the future beyond reasonable threshold)
 */
export const isValidTimestamp = (
  timestamp: number, 
  maxFutureMs: number = 60000
): boolean => {
  const now = Date.now()
  return timestamp > 0 && timestamp <= now + maxFutureMs
}

/**
 * Check if a string is a valid message ID format
 */
export const isValidMessageId = (id: string): boolean => {
  return /^msg_\d+_[a-z0-9]+$/.test(id)
}

/**
 * Check if a string is a valid user ID format
 */
export const isValidUserId = (id: string): boolean => {
  return /^user_\d+_[a-z0-9]+$/.test(id)
}

/**
 * Check if a string is a valid file ID format
 */
export const isValidFileId = (id: string): boolean => {
  return /^file_\d+_[a-z0-9]+$/.test(id)
}

/**
 * Check if a string contains HTML tags
 */
export const containsHtml = (str: string): boolean => {
  return /<[^>]*>/g.test(str)
}

/**
 * Check if a string appears to be spam
 */
export const isSpamContent = (content: string): boolean => {
  // Check for excessive repetition
  const repeatedChars = /(.)\1{10,}/.test(content)
  const repeatedWords = /\b(\w+)\s+\1\s+\1/i.test(content)
  
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  const excessiveCaps = capsRatio > 0.7 && content.length > 10
  
  // Check for spam keywords
  const spamKeywords = [
    'click here', 'free money', 'urgent', 'act now', 
    'limited time', 'buy now', 'discount', 'offer expires'
  ]
  const hasSpamKeywords = spamKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )
  
  return repeatedChars || repeatedWords || excessiveCaps || hasSpamKeywords
}

/**
 * Check if a message content is appropriate (not offensive)
 */
export const isAppropriateContent = (content: string): boolean => {
  // Basic profanity filter (can be extended)
  const offensiveWords = [
    // Add offensive words here based on your requirements
    // This is a simplified example
  ]
  
  const lowerContent = content.toLowerCase()
  return !offensiveWords.some(word => lowerContent.includes(word))
}

/**
 * Validate IP address format (IPv4)
 */
export const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4Regex.test(ip)) return false
  
  const parts = ip.split('.')
  return parts.every(part => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255
  })
}

/**
 * Check if a port number is valid
 */
export const isValidPort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}

/**
 * Check if a hex color is valid
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

/**
 * Check if a JSON string is valid
 */
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Check if an array has no duplicate values
 */
export const hasNoDuplicates = <T>(array: T[]): boolean => {
  return new Set(array).size === array.length
}

/**
 * Check if all required fields are present in an object
 */
export const hasRequiredFields = <T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean => {
  return requiredFields.every(field => 
    obj.hasOwnProperty(field) && obj[field] !== undefined && obj[field] !== null
  )
}

/**
 * Check if a password meets strength requirements
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters
  if (password.length < 8) return false
  
  // Contains uppercase letter
  if (!/[A-Z]/.test(password)) return false
  
  // Contains lowercase letter
  if (!/[a-z]/.test(password)) return false
  
  // Contains number
  if (!/\d/.test(password)) return false
  
  // Contains special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false
  
  return true
}

/**
 * Check if a string is a valid semantic version
 */
export const isValidSemver = (version: string): boolean => {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  return semverRegex.test(version)
}

/**
 * Check if a date is in the past
 */
export const isInPast = (date: Date | number): boolean => {
  const timestamp = typeof date === 'number' ? date : date.getTime()
  return timestamp < Date.now()
}

/**
 * Check if a date is in the future
 */
export const isInFuture = (date: Date | number): boolean => {
  const timestamp = typeof date === 'number' ? date : date.getTime()
  return timestamp > Date.now()
}

/**
 * Check if a string is a valid base64 encoded data
 */
export const isValidBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}