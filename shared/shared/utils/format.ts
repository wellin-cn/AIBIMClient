/**
 * Formatting utility functions
 */

/**
 * Format timestamp to human readable date string
 */
export const formatTimestamp = (
  timestamp: number,
  options: {
    includeTime?: boolean
    includeDate?: boolean
    locale?: string
    timezone?: string
  } = {}
): string => {
  const {
    includeTime = true,
    includeDate = true,
    locale = 'en-US',
    timezone = 'UTC'
  } = options
  
  const date = new Date(timestamp)
  
  if (!includeDate && !includeTime) {
    return ''
  }
  
  let formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone
  }
  
  if (includeDate) {
    formatOptions = {
      ...formatOptions,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  }
  
  if (includeTime) {
    formatOptions = {
      ...formatOptions,
      hour: '2-digit',
      minute: '2-digit'
    }
  }
  
  return date.toLocaleString(locale, formatOptions)
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (
  timestamp: number,
  locale: string = 'en-US'
): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) {
    return seconds < 5 ? 'just now' : `${seconds} seconds ago`
  } else if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  } else if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`
  } else if (weeks < 4) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  } else if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`
  } else {
    return years === 1 ? '1 year ago' : `${years} years ago`
  }
}

/**
 * Format file size in human readable format
 */
export const formatFileSize = (
  bytes: number,
  decimals: number = 2
): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format duration in milliseconds to human readable format
 */
export const formatDuration = (
  milliseconds: number,
  options: {
    includeMilliseconds?: boolean
    shortFormat?: boolean
  } = {}
): string => {
  const { includeMilliseconds = false, shortFormat = false } = options
  
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  const parts: string[] = []
  
  if (days > 0) {
    parts.push(`${days}${shortFormat ? 'd' : ` day${days !== 1 ? 's' : ''}`}`)
  }
  
  if (hours % 24 > 0) {
    parts.push(`${hours % 24}${shortFormat ? 'h' : ` hour${hours % 24 !== 1 ? 's' : ''}`}`)
  }
  
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60}${shortFormat ? 'm' : ` minute${minutes % 60 !== 1 ? 's' : ''}`}`)
  }
  
  if (seconds % 60 > 0 || parts.length === 0) {
    parts.push(`${seconds % 60}${shortFormat ? 's' : ` second${seconds % 60 !== 1 ? 's' : ''}`}`)
  }
  
  if (includeMilliseconds && milliseconds % 1000 > 0) {
    parts.push(`${milliseconds % 1000}${shortFormat ? 'ms' : ` millisecond${milliseconds % 1000 !== 1 ? 's' : ''}`}`)
  }
  
  if (shortFormat) {
    return parts.join(' ')
  }
  
  if (parts.length === 1) {
    return parts[0]
  } else if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`
  } else {
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
  }
}

/**
 * Format number with thousands separators
 */
export const formatNumber = (
  number: number,
  locale: string = 'en-US'
): string => {
  return number.toLocaleString(locale)
}

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals: number = 1
): string => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Truncate text to specified length
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Format username for display (add @ prefix if needed)
 */
export const formatUsername = (username: string, includeAt: boolean = false): string => {
  if (includeAt && !username.startsWith('@')) {
    return `@${username}`
  }
  return username
}

/**
 * Format message preview for notifications
 */
export const formatMessagePreview = (
  content: string,
  maxLength: number = 50
): string => {
  // Remove extra whitespace and line breaks
  const cleaned = content.replace(/\s+/g, ' ').trim()
  return truncateText(cleaned, maxLength)
}

/**
 * Format error message for user display
 */
export const formatErrorMessage = (
  error: string | Error,
  fallback: string = 'An unexpected error occurred'
): string => {
  if (typeof error === 'string') {
    return error || fallback
  }
  
  if (error instanceof Error) {
    return error.message || fallback
  }
  
  return fallback
}

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Generate initials from a name
 */
export const generateInitials = (name: string, maxLength: number = 2): string => {
  const words = name.trim().split(/\s+/)
  const initials = words
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
  
  return initials || name.charAt(0).toUpperCase()
}

/**
 * Format connection status for display
 */
export const formatConnectionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'connected': 'Connected',
    'connecting': 'Connecting...',
    'disconnected': 'Disconnected',
    'reconnecting': 'Reconnecting...',
    'error': 'Connection Error'
  }
  
  return statusMap[status] || capitalize(status)
}

/**
 * Format user count for display
 */
export const formatUserCount = (count: number): string => {
  if (count === 0) return 'No users online'
  if (count === 1) return '1 user online'
  return `${formatNumber(count)} users online`
}

/**
 * Format message timestamp for chat display
 */
export const formatChatTimestamp = (timestamp: number): string => {
  const now = new Date()
  const messageDate = new Date(timestamp)
  const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    // Today - show only time
    return messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffInDays === 1) {
    // Yesterday
    return `Yesterday ${messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  } else if (diffInDays < 7) {
    // This week - show day name
    return messageDate.toLocaleDateString([], { 
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    // Older - show full date
    return messageDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}