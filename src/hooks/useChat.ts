import { useCallback } from 'react'
import { useChatStore, useAuthStore } from '../store'
import { Message, MessageType, MessageStatus, User } from '../types'

export const useChat = () => {
  const {
    messages,
    users,
    onlineUsers,
    connectionStatus,
    isTyping,
    addMessage,
    updateMessage,
    setUsers,
    addUser,
    removeUser,
    updateUserStatus,
    setUserTyping,
    setConnectionStatus,
    setError,
    clearError,
  } = useChatStore()

  const { currentUser } = useAuthStore()

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    if (!currentUser || !content.trim()) return null

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      sender: currentUser,
      timestamp: new Date(),
      type: MessageType.TEXT,
      status: MessageStatus.SENDING,
    }

    addMessage(message)
    return message
  }, [currentUser, addMessage])

  // 更新消息状态
  const updateMessageStatus = useCallback((messageId: string, status: MessageStatus) => {
    updateMessage(messageId, { status })
  }, [updateMessage])

  // 接收消息
  const receiveMessage = useCallback((messageData: Omit<Message, 'id' | 'timestamp'> & { 
    id?: string
    timestamp?: string | Date 
  }) => {
    const message: Message = {
      id: messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: messageData.content,
      sender: messageData.sender,
      timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
      type: messageData.type,
      status: MessageStatus.SENT,
    }

    addMessage(message)
    return message
  }, [addMessage])

  // 添加系统消息
  const addSystemMessage = useCallback((content: string) => {
    const systemUser: User = {
      id: 'system',
      name: 'System',
      isOnline: true,
    }

    const message: Message = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: systemUser,
      timestamp: new Date(),
      type: MessageType.SYSTEM,
      status: MessageStatus.SENT,
    }

    addMessage(message)
    return message
  }, [addMessage])

  // 处理用户加入
  const handleUserJoined = useCallback((user: User) => {
    addUser(user)
    addSystemMessage(`${user.name} 加入了聊天`)
  }, [addUser, addSystemMessage])

  // 处理用户离开
  const handleUserLeft = useCallback((userId: string) => {
    const user = users.find((u: any) => u.id === userId)
    if (user) {
      removeUser(userId)
      addSystemMessage(`${user.name} 离开了聊天`)
    }
  }, [users, removeUser, addSystemMessage])

  // 设置用户正在输入状态
  const setTypingStatus = useCallback((userId: string, isTyping: boolean) => {
    setUserTyping(userId, isTyping)
    
    // 自动清除输入状态
    if (isTyping) {
      setTimeout(() => {
        setUserTyping(userId, false)
      }, 3000)
    }
  }, [setUserTyping])

  // 获取正在输入的用户列表
  const getTypingUsers = useCallback(() => {
    return Object.keys(isTyping)
      .filter(userId => isTyping[userId] && userId !== currentUser?.id)
      .map(userId => users.find((user: any) => user.id === userId))
      .filter(Boolean) as User[]
  }, [isTyping, users, currentUser])

  // 获取在线用户列表
  const getOnlineUsersList = useCallback(() => {
    return users.filter((user: any) => onlineUsers.has(user.id))
  }, [users, onlineUsers])

  // 错误处理
  const handleError = useCallback((error: string) => {
    setError(error)
    console.error('Chat error:', error)
  }, [setError])

  return {
    // 状态
    messages,
    users,
    onlineUsers: getOnlineUsersList(),
    connectionStatus,
    typingUsers: getTypingUsers(),
    currentUser,
    
    // 消息操作
    sendMessage,
    receiveMessage,
    updateMessageStatus,
    addSystemMessage,
    
    // 用户操作
    handleUserJoined,
    handleUserLeft,
    setTypingStatus,
    updateUserStatus,
    setUsers,
    
    // 连接操作
    setConnectionStatus,
    
    // 错误处理
    handleError,
    clearError,
  }
}