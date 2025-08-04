import React, { useEffect, useState } from 'react'

export interface NotificationProps {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  onDismiss?: (id: string) => void
  showCloseButton?: boolean
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
  showCloseButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(id), 300) // Allow fade animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, id, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(id), 300)
  }

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800'
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800'
      case 'error':
        return 'bg-red-100 border-red-400 text-red-800'
      default:
        return 'bg-blue-100 border-blue-400 text-blue-800'
    }
  }

  const getIconEmoji = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`
      fixed top-4 right-4 z-50 min-w-80 max-w-md p-4 border-l-4 rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${getTypeClasses()}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-lg mr-3">
          {getIconEmoji()}
        </div>
        
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>

        {showCloseButton && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-3 text-lg opacity-70 hover:opacity-100 transition-opacity"
            aria-label="关闭通知"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// Notification Manager Component
export interface NotificationManagerProps {
  notifications: NotificationProps[]
  onDismiss: (id: string) => void
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 p-4 pointer-events-auto">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ 
              transform: `translateY(${index * 4}px)`,
              zIndex: 1000 - index 
            }}
          >
            <Notification
              {...notification}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </div>
    </div>
  )
}