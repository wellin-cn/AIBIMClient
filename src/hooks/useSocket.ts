import { useEffect, useCallback } from 'react'
import { socketService } from '../services/socketService'
import { useAuthStore, useChatStore } from '../store'
import { ConnectionStatus, MessageType, MessageStatus } from '../types'

export const useSocket = () => {
  const {
    currentUser,
    setCurrentUser,
    setLoggingIn,
    setLoginError,
  } = useAuthStore()

  const {
    setConnectionStatus,
    addMessage,
    updateMessage,
    setUsers,
    setUserTyping,
    clearMessages,
    clearError,
  } = useChatStore()

  // 连接到服务器
  const connect = useCallback(async (serverUrl: string, username: string) => {
    try {
      setLoggingIn(true)
      setLoginError(null)
      setConnectionStatus(ConnectionStatus.CONNECTING)
      
      await socketService.connect(serverUrl, username)
      
      // 注意：不在这里设置用户，等待服务器的 user:joined 事件响应
      console.log('✅ Socket connected, waiting for server authentication response...')
      
      // 连接成功后获取用户列表
      try {
        const users = await socketService.getOnlineUsers()
        setUsers(users)
      } catch (error) {
        console.warn('Failed to get initial user list:', error)
      }
      
    } catch (error) {
      console.error('Connection failed:', error)
      setLoginError(error instanceof Error ? error.message : '连接失败')
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
    } finally {
      setLoggingIn(false)
    }
  }, [setLoggingIn, setLoginError, setConnectionStatus, setUsers, setCurrentUser])

  // 断开连接
  const disconnect = useCallback(() => {
    socketService.disconnect()
    setCurrentUser(null)
    clearMessages()
    setConnectionStatus(ConnectionStatus.DISCONNECTED)
  }, [setCurrentUser, clearMessages, setConnectionStatus])

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!socketService.isConnected || !currentUser) {
      throw new Error('Not connected or not authenticated')
    }

    // 创建临时消息对象
    const tempMessage = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: currentUser,
      timestamp: Date.now(),
      type: MessageType.TEXT,
      status: MessageStatus.SENDING,
    }

    // 立即显示在界面上
    addMessage(tempMessage)

    try {
      // 发送到服务器
      const serverMessage = await socketService.sendMessage(content)
      
      // 更新为服务器返回的消息
      updateMessage(tempMessage.id, {
        id: serverMessage.id,
        status: MessageStatus.SENT,
        timestamp: serverMessage.timestamp,
      })
    } catch (error) {
      // 发送失败，更新状态
      updateMessage(tempMessage.id, {
        status: MessageStatus.FAILED,
      })
      throw error
    }
  }, [currentUser, addMessage, updateMessage])

  // 发送输入状态
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (socketService.isConnected && currentUser) {
      socketService.sendTypingStatus(isTyping)
    }
  }, [currentUser])

  // 添加系统消息
  const addSystemMessage = useCallback((content: string) => {
    const systemMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: {
        id: 'system',
        name: 'System',
        isOnline: true,
      },
      timestamp: Date.now(),
      type: MessageType.SYSTEM,
      status: MessageStatus.SENT,
    }
    addMessage(systemMessage)
  }, [addMessage])

  // 设置Socket事件监听器 - 只在组件挂载时执行一次
  useEffect(() => {
    console.log('🔧 Setting up socket event listeners...')
    
    // 连接状态变化
    const unsubscribeConnection = socketService.onConnectionChange((status) => {
      console.log('📶 Connection status changed:', status)
      setConnectionStatus(status)
      clearError()
    })

    // 认证结果
    const unsubscribeAuth = socketService.onAuth((user, error) => {
      if (error) {
        console.error('🔴 Authentication failed:', error)
        setLoginError(error)
        setCurrentUser(null)
      } else if (user) {
        console.log('🎉 Authentication successful via server response:', user)
        setCurrentUser(user)
        setLoginError(null)
        addSystemMessage(`${user.name} 已连接到聊天室`)
      }
    })

    // 接收消息
    const unsubscribeMessage = socketService.onMessage((message) => {
      addMessage(message)
    })

    // 用户列表更新
    const unsubscribeUsers = socketService.onUsersUpdate((users) => {
      setUsers(users)
    })

    // 输入状态变化
    const unsubscribeTyping = socketService.onTypingChange((userId, isTyping) => {
      setUserTyping(userId, isTyping)
    })

    // 系统消息
    const unsubscribeSystemMessage = socketService.onSystemMessage((message) => {
      addSystemMessage(message)
    })

    // 清理函数
    return () => {
      console.log('🧹 Cleaning up socket event listeners...')
      unsubscribeConnection()
      unsubscribeAuth()
      unsubscribeMessage()
      unsubscribeUsers()
      unsubscribeTyping()
      unsubscribeSystemMessage()
    }
  }, []) // 空依赖数组，只在挂载时执行一次

  // 组件卸载时断开连接 - 只在真正需要时断开
  useEffect(() => {
    return () => {
      console.log('🔌 useSocket hook cleanup...')
      // 不在这里断开连接，让socket在全局保持连接
      // 只在用户明确登出时才断开
    }
  }, [])

  return {
    // 状态
    isConnected: socketService.isConnected,
    socketId: socketService.socketId,
    
    // 操作
    connect,
    disconnect,
    sendMessage,
    sendTypingStatus,
    addSystemMessage,
  }
}