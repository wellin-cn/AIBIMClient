import { ComponentProps } from '../../types'

interface BadgeProps extends ComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children
}) => {
  const baseClasses = [
    'inline-flex items-center font-medium rounded-full theme-transition'
  ]

  const variantClasses = {
    default: 'bg-secondary text-secondary',
    success: 'bg-green-100 text-green-800 [data-theme="dark"] &:bg-green-900 [data-theme="dark"] &:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 [data-theme="dark"] &:bg-yellow-900 [data-theme="dark"] &:text-yellow-200',
    error: 'bg-red-100 text-red-800 [data-theme="dark"] &:bg-red-900 [data-theme="dark"] &:text-red-200',
    info: 'bg-blue-100 text-blue-800 [data-theme="dark"] &:bg-blue-900 [data-theme="dark"] &:text-blue-200'
  }

  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
    md: dot ? 'w-3 h-3' : 'px-2.5 py-1 text-sm'
  }

  const classes = [
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  if (dot) {
    return <span className={classes} />
  }

  return (
    <span className={classes}>
      {children}
    </span>
  )
}