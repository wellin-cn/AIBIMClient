import { useCallback, useState } from 'react'
import { NotificationProps } from '../components/ui'

export interface NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  duration?: number
  showCloseButton?: boolean
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  // 添加通知
  const addNotification = useCallback((
    message: string, 
    options: NotificationOptions = {}
  ) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const notification: NotificationProps = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration ?? 5000,
      showCloseButton: options.showCloseButton ?? true,
    }

    setNotifications(prev => [...prev, notification])
    return id
  }, [])

  // 添加成功通知
  const addSuccess = useCallback((message: string, title?: string) => {
    return addNotification(message, { type: 'success', title })
  }, [addNotification])

  // 添加错误通知
  const addError = useCallback((message: string, title?: string) => {
    return addNotification(message, { type: 'error', title, duration: 8000 })
  }, [addNotification])

  // 添加警告通知
  const addWarning = useCallback((message: string, title?: string) => {
    return addNotification(message, { type: 'warning', title })
  }, [addNotification])

  // 添加信息通知
  const addInfo = useCallback((message: string, title?: string) => {
    return addNotification(message, { type: 'info', title })
  }, [addNotification])

  // 添加用户加入通知
  const addUserJoinedNotification = useCallback((username: string) => {
    return addNotification(`${username} 加入了聊天室`, {
      type: 'success',
      title: '新成员加入',
      duration: 4000,
    })
  }, [addNotification])

  // 添加用户离开通知
  const addUserLeftNotification = useCallback((username: string) => {
    return addNotification(`${username} 离开了聊天室`, {
      type: 'info',
      title: '成员离开',
      duration: 3000,
    })
  }, [addNotification])

  // 移除通知
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // 清除所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // 移除特定类型的通知
  const dismissByType = useCallback((type: 'info' | 'success' | 'warning' | 'error') => {
    setNotifications(prev => prev.filter(notification => notification.type !== type))
  }, [])

  return {
    notifications,
    addNotification,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    addUserJoinedNotification,
    addUserLeftNotification,
    dismissNotification,
    clearAllNotifications,
    dismissByType,
  }
}