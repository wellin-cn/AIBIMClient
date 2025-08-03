import { ButtonHTMLAttributes, forwardRef } from 'react'
import { ComponentProps } from '../../types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ComponentProps {
  variant?: 'primary' | 'secondary' | 'text' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'theme-transition'
  ]

  const variantClasses = {
    primary: [
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      'focus:ring-primary-500 focus:ring-offset-white',
      '[data-theme="dark"] &:focus:ring-offset-slate-900'
    ],
    secondary: [
      'bg-secondary text-primary border border-primary',
      'hover:bg-hover active:bg-active',
      'focus:ring-primary-500 focus:ring-offset-white',
      '[data-theme="dark"] &:focus:ring-offset-slate-900'
    ],
    text: [
      'text-primary hover:bg-hover active:bg-active',
      'focus:ring-primary-500 focus:ring-offset-white',
      '[data-theme="dark"] &:focus:ring-offset-slate-900'
    ],
    danger: [
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      'focus:ring-red-500 focus:ring-offset-white',
      '[data-theme="dark"] &:focus:ring-offset-slate-900'
    ]
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  }

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'