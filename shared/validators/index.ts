/**
 * Shared Validation Functions
 * 
 * This file exports all validation functions used across
 * both server and client applications.
 */

// Re-export all validators
export * from './user'
export * from './message'

// Common validation utilities
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ValidationOptions {
  strict?: boolean
  allowEmpty?: boolean
  trim?: boolean
}

// Base validation function type
export type ValidatorFunction<T = any> = (
  value: T,
  options?: ValidationOptions
) => ValidationResult

// Create a validation result
export const createValidationResult = (
  isValid: boolean,
  errors: string[] = [],
  warnings: string[] = []
): ValidationResult => ({
  isValid,
  errors,
  warnings: warnings.length > 0 ? warnings : undefined
})

// Combine multiple validation results
export const combineValidationResults = (
  ...results: ValidationResult[]
): ValidationResult => {
  const allErrors = results.flatMap(r => r.errors)
  const allWarnings = results.flatMap(r => r.warnings || [])
  
  return createValidationResult(
    results.every(r => r.isValid),
    allErrors,
    allWarnings
  )
}

// Common string validation
export const validateString = (
  value: any,
  minLength: number = 0,
  maxLength: number = Infinity,
  pattern?: RegExp
): ValidationResult => {
  const errors: string[] = []
  
  // Type check
  if (typeof value !== 'string') {
    errors.push('Value must be a string')
    return createValidationResult(false, errors)
  }
  
  // Length checks
  if (value.length < minLength) {
    errors.push(`Value must be at least ${minLength} characters long`)
  }
  
  if (value.length > maxLength) {
    errors.push(`Value must be no more than ${maxLength} characters long`)
  }
  
  // Pattern check
  if (pattern && !pattern.test(value)) {
    errors.push('Value does not match required pattern')
  }
  
  return createValidationResult(errors.length === 0, errors)
}

// Common number validation
export const validateNumber = (
  value: any,
  min: number = -Infinity,
  max: number = Infinity,
  integer: boolean = false
): ValidationResult => {
  const errors: string[] = []
  
  // Type check
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push('Value must be a valid number')
    return createValidationResult(false, errors)
  }
  
  // Range checks
  if (value < min) {
    errors.push(`Value must be at least ${min}`)
  }
  
  if (value > max) {
    errors.push(`Value must be no more than ${max}`)
  }
  
  // Integer check
  if (integer && !Number.isInteger(value)) {
    errors.push('Value must be an integer')
  }
  
  return createValidationResult(errors.length === 0, errors)
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return createValidationResult(false, ['Invalid email format'])
  }
  
  return createValidationResult(true)
}

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  try {
    new URL(url)
    return createValidationResult(true)
  } catch {
    return createValidationResult(false, ['Invalid URL format'])
  }
}

// Required field validation
export const validateRequired = (value: any): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return createValidationResult(false, ['This field is required'])
  }
  
  return createValidationResult(true)
}

// Array validation
export const validateArray = (
  value: any,
  minLength: number = 0,
  maxLength: number = Infinity,
  itemValidator?: ValidatorFunction
): ValidationResult => {
  const errors: string[] = []
  
  // Type check
  if (!Array.isArray(value)) {
    errors.push('Value must be an array')
    return createValidationResult(false, errors)
  }
  
  // Length checks
  if (value.length < minLength) {
    errors.push(`Array must have at least ${minLength} items`)
  }
  
  if (value.length > maxLength) {
    errors.push(`Array must have no more than ${maxLength} items`)
  }
  
  // Item validation
  if (itemValidator) {
    value.forEach((item, index) => {
      const itemResult = itemValidator(item)
      if (!itemResult.isValid) {
        errors.push(...itemResult.errors.map(err => `Item ${index}: ${err}`))
      }
    })
  }
  
  return createValidationResult(errors.length === 0, errors)
}

// Object validation
export const validateObject = (
  value: any,
  schema: Record<string, ValidatorFunction>
): ValidationResult => {
  const errors: string[] = []
  
  // Type check
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    errors.push('Value must be an object')
    return createValidationResult(false, errors)
  }
  
  // Validate each field in schema
  for (const [key, validator] of Object.entries(schema)) {
    const fieldResult = validator(value[key])
    if (!fieldResult.isValid) {
      errors.push(...fieldResult.errors.map(err => `${key}: ${err}`))
    }
  }
  
  return createValidationResult(errors.length === 0, errors)
}

// Sanitization functions
export const sanitizeString = (value: string, options: {
  trim?: boolean
  toLowerCase?: boolean
  removeHtml?: boolean
} = {}): string => {
  let result = value
  
  if (options.trim !== false) {
    result = result.trim()
  }
  
  if (options.toLowerCase) {
    result = result.toLowerCase()
  }
  
  if (options.removeHtml) {
    result = result.replace(/<[^>]*>/g, '')
  }
  
  return result
}

// File validation
export const validateFile = (
  file: { name: string; size: number; type: string },
  allowedTypes: string[] = [],
  maxSize: number = Infinity
): ValidationResult => {
  const errors: string[] = []
  
  // Size check
  if (file.size > maxSize) {
    errors.push(`File size (${file.size} bytes) exceeds maximum allowed size (${maxSize} bytes)`)
  }
  
  // Type check
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
  }
  
  // Name check
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File must have a name')
  }
  
  return createValidationResult(errors.length === 0, errors)
}