import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { ComponentProps } from '../../types'

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, ComponentProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled = false,
  type = 'text',
  ...props
}, ref) => {
  const [, setIsFocused] = useState(false)

  const baseClasses = [
    'w-full px-3 py-2 text-sm rounded-lg border transition-colors theme-transition',
    'placeholder:text-tertiary',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50'
  ]

  const stateClasses = error 
    ? [
        'border-red-300 text-red-900 placeholder:text-red-300',
        'focus:border-red-500 focus:ring-red-500'
      ]
    : [
        'border-primary text-primary',
        'focus:border-primary-500 focus:ring-primary-500'
      ]

  const inputClasses = [
    ...baseClasses,
    ...stateClasses,
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ')

  const containerClasses = [
    'relative',
    fullWidth ? 'w-full' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-tertiary">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-tertiary">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-tertiary'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'