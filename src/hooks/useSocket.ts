import { useEffect, useCallback } from 'react'
import { socketService } from '../services/socketService'
import { useAuthStore, useChatStore } from '../store'
import { ConnectionStatus, MessageType, MessageStatus } from '../types'
import { useNotifications } from './useNotifications'

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

  const {
    addUserJoinedNotification,
    addError,
    addSuccess,
    notifications,
    dismissNotification,
  } = useNotifications()

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
      const errorMessage = error instanceof Error ? error.message : '连接失败'
      setLoginError(errorMessage)
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
      addError(`连接失败: ${errorMessage}`, '连接错误')
    } finally {
      setLoggingIn(false)
    }
  }, [setLoggingIn, setLoginError, setConnectionStatus, setUsers, setCurrentUser, addError])

  // 断开连接
  const disconnect = useCallback(() => {
    socketService.disconnect()
    setCurrentUser(null)
    clearMessages()
    setConnectionStatus(ConnectionStatus.DISCONNECTED)
  }, [setCurrentUser, clearMessages, setConnectionStatus])

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    console.log('🚀 [useSocket] sendMessage called:', {
      content,
      contentLength: content.length,
      isConnected: socketService.isConnected,
      currentUser: currentUser?.name,
      timestamp: new Date().toISOString()
    })

    if (!socketService.isConnected || !currentUser) {
      const errorMsg = !socketService.isConnected ? 'Socket not connected' : 'User not authenticated'
      console.error('❌ [useSocket] Cannot send message:', {
        error: errorMsg,
        isConnected: socketService.isConnected,
        hasCurrentUser: !!currentUser,
        socketId: socketService.socketId
      })
      throw new Error('Not connected or not authenticated')
    }

    // 创建临时消息对象
    const tempMessage = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: currentUser,
      timestamp: new Date(),
      type: MessageType.TEXT,
      status: MessageStatus.SENDING,
    }

    console.log('📝 [useSocket] Created temp message:', {
      tempId: tempMessage.id,
      content: tempMessage.content,
      senderName: tempMessage.sender.name,
      status: tempMessage.status
    })

    // 立即显示在界面上
    console.log('💾 [useSocket] Adding message to store...')
    addMessage(tempMessage)

    try {
      // 发送到服务器
      console.log('📡 [useSocket] Calling socketService.sendMessage...')
      const serverMessage = await socketService.sendMessage(content)
      console.log('✅ [useSocket] Received server response:', {
        serverId: serverMessage.id,
        tempId: tempMessage.id,
        serverTimestamp: serverMessage.timestamp
      })
      
      // 更新为服务器返回的消息
      console.log('🔄 [useSocket] Updating message in store...')
      updateMessage(tempMessage.id, {
        id: serverMessage.id,
        status: MessageStatus.SENT,
        timestamp: serverMessage.timestamp,
      })
      console.log('✅ [useSocket] Message successfully updated!')
    } catch (error) {
      console.error('❌ [useSocket] Send message failed:', {
        error: error instanceof Error ? error.message : error,
        errorStack: error instanceof Error ? error.stack : undefined,
        tempMessageId: tempMessage.id,
        content,
        timestamp: new Date().toISOString()
      })
      
      // 发送失败，更新状态
      console.log('🔄 [useSocket] Updating message status to FAILED...')
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
        username: 'system',
        isOnline: true,
      },
      timestamp: new Date(),
      type: MessageType.SYSTEM,
      status: MessageStatus.SENT,
    }
    addMessage(systemMessage)
  }, [addMessage])

  // 诊断函数 - 用于调试
  const diagnoseConnection = useCallback(() => {
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      socket: {
        isConnected: socketService.isConnected,
        socketId: socketService.socketId,
        transport: (socketService as any).socket?.io?.engine?.transport?.name,
        readyState: (socketService as any).socket?.io?.engine?.readyState,
        hasSocket: !!(socketService as any).socket
      },
      user: {
        hasCurrentUser: !!currentUser,
        userName: currentUser?.name,
        userId: currentUser?.id
      },
      store: {
        connectionStatus: useChatStore.getState().connectionStatus,
        messageCount: useChatStore.getState().messages.length,
        userCount: useChatStore.getState().users.length
      }
    }

    console.log('🔍 [useSocket] Connection Diagnosis:', diagnosticInfo)
    return diagnosticInfo
  }, [currentUser])

  // 自动诊断 - 在组件挂载时执行
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🏥 [useSocket] Auto-diagnosing connection state...')
      diagnoseConnection()
    }, 2000) // 2秒后执行诊断

    return () => clearTimeout(timer)
  }, [])

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
        // 显示登录成功通知
        addSuccess(`欢迎，${user.name}！`, '登录成功')
        console.log('✅ User authenticated successfully, waiting for user list updates...')
      }
    })

    // 接收消息
    const unsubscribeMessage = socketService.onMessage((message) => {
      console.log('📥 [useSocket] Received message via listener:', {
        messageId: message.id,
        content: message.content,
        senderName: message.sender?.name,
        timestamp: message.timestamp,
        isFromCurrentUser: currentUser?.id === message.sender?.id
      })
      
      // 只有当消息不是来自当前用户时才添加到store
      // 发送者的消息已经通过sendMessage流程添加过了
      if (currentUser && message.sender?.id !== currentUser.id) {
        console.log('📥 [useSocket] Adding received message from other user to store')
        addMessage(message)
      } else {
        console.log('📥 [useSocket] Skipping message from current user (already added locally)')
      }
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

    // 新成员加入通知 - 适配新API规范
    const unsubscribeNewMember = socketService.onNewMemberJoined((newMember, allUsers) => {
      console.log('🎉 New member joined via hook:', newMember.name)
      
      // 更新用户列表
      setUsers(allUsers)
      
      // 显示加入通知（除了自己）
      if (currentUser && newMember.id !== currentUser.id) {
        // 显示系统消息
        addSystemMessage(`${newMember.name} 加入了聊天室`)
        // 显示通知提醒
        addUserJoinedNotification(newMember.name)
      }
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
      unsubscribeNewMember()
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
    
    // 通知系统
    notifications,
    dismissNotification,
    
    // 调试功能
    diagnoseConnection,
  }
}