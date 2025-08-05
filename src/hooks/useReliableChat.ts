/**
 * 可靠的聊天Hook - 解决消息发送超时问题
 * 
 * 特性：
 * - 自动重试机制
 * - 消息队列
 * - 连接状态管理
 * - 错误处理
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Message, User, MessageType, MessageStatus } from '../types'

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting'
}

interface SendMessageOptions {
  timeout?: number
  retries?: number
  priority?: 'low' | 'normal' | 'high'
}

interface MessageResult {
  success: boolean
  messageId: string
  timestamp: Date
  error?: string
  retryCount?: number
}

interface ReliableChatState {
  messages: Message[]
  users: User[]
  connectionStatus: ConnectionStatus
  sendQueue: Message[]
  isRetrying: boolean
  queueSize: number
}

export const useReliableChat = (serverUrl: string) => {
  // 状态管理
  const [state, setState] = useState<ReliableChatState>({
    messages: [],
    users: [],
    connectionStatus: ConnectionStatus.DISCONNECTED,
    sendQueue: [],
    isRetrying: false,
    queueSize: 0
  })

  // Refs
  const socketRef = useRef<Socket | null>(null)
  const messageTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())
  // const retryQueue = useRef<Map<string, number>>(new Map())
  const currentUserRef = useRef<User | null>(null)

  // 连接到服务器
  const connect = useCallback(async (username: string): Promise<void> => {
    try {
      console.log('🔄 [ReliableChat] Starting connection...', { username, serverUrl })
      
      setState(prev => ({ ...prev, connectionStatus: ConnectionStatus.CONNECTING }))

      // 断开现有连接
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      // 创建新连接
      const socket = io(serverUrl, {
        auth: { username },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        upgrade: true,
        rememberUpgrade: false
      })

      socketRef.current = socket

      // 设置连接事件监听
      setupSocketListeners(socket)

      // 等待连接完成
      return new Promise((resolve, reject) => {
        const connectTimer = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 25000)

        socket.on('connect', () => {
          clearTimeout(connectTimer)
          console.log('🟢 [ReliableChat] Socket connected:', socket.id)
          
          // 发送用户加入事件
          socket.emit('user:join', { 
            username, 
            timestamp: new Date().toISOString() 
          }, (response: any) => {
            if (response?.success || response?.user) {
              console.log('✅ [ReliableChat] User join confirmed')
              setState(prev => ({ ...prev, connectionStatus: ConnectionStatus.CONNECTED }))
              
              // 设置当前用户
              currentUserRef.current = response.user || {
                id: Date.now().toString(),
                name: username,
                username,
                isOnline: true
              }

              // 处理发送队列
              processSendQueue()
              resolve()
            } else {
              reject(new Error('User join failed'))
            }
          })
        })

        socket.on('connect_error', (error: any) => {
          clearTimeout(connectTimer)
          console.error('❌ [ReliableChat] Connection failed:', error)
          setState(prev => ({ ...prev, connectionStatus: ConnectionStatus.DISCONNECTED }))
          reject(error)
        })
      })

    } catch (error) {
      console.error('Connection error:', error)
      setState(prev => ({ ...prev, connectionStatus: ConnectionStatus.DISCONNECTED }))
      throw error
    }
  }, [serverUrl])

  // 设置Socket事件监听器
  const setupSocketListeners = (socket: Socket) => {
    // 断开连接
    socket.on('disconnect', (reason: string) => {
      console.log('🔌 [ReliableChat] Disconnected:', reason)
      setState(prev => ({ ...prev, connectionStatus: ConnectionStatus.DISCONNECTED }))
      
      // 自动重连（除非是服务器主动断开）
      if (reason !== 'io server disconnect') {
        setTimeout(() => {
          console.log('🔄 [ReliableChat] Attempting reconnection...')
          setState(prev => ({ ...prev, connectionStatus: ConnectionStatus.RECONNECTING }))
          socket.connect()
        }, 2000)
      }
    })

    // 接收消息 - 使用正确的事件名称
    socket.on('message:received', (data: any) => {
      console.log('📥 [ReliableChat] Received message:received event:', data)
      
      // 将接收到的数据转换为Message格式
      const message: Message = {
        id: data.id || `msg_${Date.now()}`,
        content: data.content,
        sender: {
          id: data.sender?.id || 'unknown',
          name: data.sender?.name || data.sender?.username || 'Unknown User',
          username: data.sender?.username || data.sender?.name || 'unknown',
          isOnline: data.sender?.isOnline ?? true
        },
        timestamp: new Date(data.timestamp),
        type: data.type || 'text',
        status: MessageStatus.RECEIVED
      }
      
      addMessage(message)
    })

    // 用户加入成功
    socket.on('user:joined', (data: any) => {
      console.log('🎉 [ReliableChat] User joined confirmed:', data)
      if (data.onlineUsers) {
        setState(prev => ({ ...prev, users: data.onlineUsers }))
      }
    })

    // 新用户加入通知
    socket.on('user:new-member-joined', (data: any) => {
      console.log('👋 [ReliableChat] New member joined:', data.newMember?.username)
      if (data.onlineUsers) {
        setState(prev => ({ ...prev, users: data.onlineUsers }))
      }
      
      // 显示系统消息
      if (data.newMember) {
        addSystemMessage(`${data.newMember.username} 加入了聊天室`)
      }
    })

    // 用户离开通知
    socket.on('user:left', (data: any) => {
      console.log('👋 [ReliableChat] User left:', data.user?.username)
      if (data.onlineUsers) {
        setState(prev => ({ ...prev, users: data.onlineUsers }))
      }
      
      if (data.user) {
        addSystemMessage(`${data.user.username} 离开了聊天室`)
      }
    })
  }

  // 发送消息（可靠版本）
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ): Promise<MessageResult> => {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty')
    }

    const {
      timeout = 15000,
      retries = 3
    } = options

    // 创建消息对象
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      sender: currentUserRef.current || {
        id: 'unknown',
        name: 'Unknown User',
        username: 'unknown',
        isOnline: true
      },
      timestamp: new Date(),
      type: MessageType.TEXT,
      status: MessageStatus.SENDING
    }

    console.log('📤 [ReliableChat] Sending message:', { 
      id: message.id, 
      content: message.content,
      hasSocket: !!socketRef.current,
      connected: socketRef.current?.connected
    })

    // 立即显示在UI中
    addMessage(message)

    // 检查连接状态
    const socket = socketRef.current
    if (!socket || !socket.connected) {
      console.warn('⚠️ [ReliableChat] Socket not connected, queuing message')
      
      // 添加到发送队列
      setState(prev => ({ 
        ...prev, 
        sendQueue: [...prev.sendQueue, message],
        queueSize: prev.sendQueue.length + 1
      }))
      
      updateMessageStatus(message.id, MessageStatus.FAILED)
      return {
        success: false,
        messageId: message.id,
        timestamp: new Date(),
        error: 'Not connected, message queued'
      }
    }

    // 尝试发送消息
    return attemptSendMessage(message, retries, timeout)
  }, [])

  // 尝试发送消息（带重试）
  const attemptSendMessage = async (
    message: Message, 
    retriesLeft: number, 
    timeout: number
  ): Promise<MessageResult> => {
    return new Promise((resolve) => {
      const socket = socketRef.current
      if (!socket?.connected) {
        updateMessageStatus(message.id, MessageStatus.FAILED)
        resolve({
          success: false,
          messageId: message.id,
          timestamp: new Date(),
          error: 'Socket disconnected during send'
        })
        return
      }

      console.log(`📡 [ReliableChat] Attempting to send message (${3 - retriesLeft + 1}/3):`, message.id)

      // 设置超时处理
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ [ReliableChat] Message timeout:`, message.id)
        
        if (retriesLeft > 0) {
          console.log(`🔄 [ReliableChat] Retrying message (${retriesLeft} attempts left):`, message.id)
          
          setState(prev => ({ ...prev, isRetrying: true }))
          
          // 递增延迟重试
          const retryDelay = (3 - retriesLeft + 1) * 1000
          setTimeout(() => {
            setState(prev => ({ ...prev, isRetrying: false }))
            attemptSendMessage(message, retriesLeft - 1, timeout).then(resolve)
          }, retryDelay)
        } else {
          console.error(`❌ [ReliableChat] Message failed after all retries:`, message.id)
          updateMessageStatus(message.id, MessageStatus.FAILED)
          resolve({
            success: false,
            messageId: message.id,
            timestamp: new Date(),
            error: 'Message send timeout after retries',
            retryCount: 3 - retriesLeft
          })
        }
      }, timeout)

      messageTimeouts.current.set(message.id, timeoutId)

      // 设置消息发送响应监听器
      const handleMessageSent = (data: any) => {
        if (data.tempId === message.id) {
          // 清除超时
          const timeout = messageTimeouts.current.get(message.id)
          if (timeout) {
            clearTimeout(timeout)
            messageTimeouts.current.delete(message.id)
          }

          console.log(`✅ [ReliableChat] Message sent successfully:`, message.id)
          
          // 更新消息状态和服务器ID
          updateMessage(message.id, {
            id: data.messageId,
            status: MessageStatus.SENT,
            timestamp: new Date(data.timestamp)
          })
          
          // 移除监听器
          socket.off('message:sent', handleMessageSent)
          socket.off('message:send:error', handleMessageError)
          
          resolve({
            success: true,
            messageId: data.messageId,
            timestamp: new Date(),
            retryCount: 3 - retriesLeft
          })
        }
      }

      const handleMessageError = (data: any) => {
        if (data.tempId === message.id) {
          // 清除超时
          const timeout = messageTimeouts.current.get(message.id)
          if (timeout) {
            clearTimeout(timeout)
            messageTimeouts.current.delete(message.id)
          }

          console.error(`❌ [ReliableChat] Message send error:`, message.id, data)
          
          // 移除监听器
          socket.off('message:sent', handleMessageSent)
          socket.off('message:send:error', handleMessageError)
          
          if (retriesLeft > 0) {
            // 重试
            setTimeout(() => {
              attemptSendMessage(message, retriesLeft - 1, 15000).then(resolve)
            }, 1000)
          } else {
            updateMessageStatus(message.id, MessageStatus.FAILED)
            resolve({
              success: false,
              messageId: message.id,
              timestamp: new Date(),
              error: `${data.code}: ${data.message}`,
              retryCount: 3 - retriesLeft
            })
          }
        }
      }

      // 添加事件监听器
      socket.on('message:sent', handleMessageSent)
      socket.on('message:send:error', handleMessageError)

      // 发送消息到服务器
      socket.emit('message:send', {
        type: 'text',
        content: message.content,
        timestamp: Date.now(),
        tempId: message.id  // 使用tempId字段名
      })
    })
  }

  // 处理发送队列
  const processSendQueue = useCallback(() => {
    const socket = socketRef.current
    if (!socket?.connected || state.sendQueue.length === 0) return

    console.log(`📋 [ReliableChat] Processing send queue: ${state.sendQueue.length} messages`)
    
    const queuedMessages = [...state.sendQueue]
    setState(prev => ({ ...prev, sendQueue: [], queueSize: 0 }))

    queuedMessages.forEach(async (message) => {
      try {
        updateMessageStatus(message.id, MessageStatus.SENDING)
        await attemptSendMessage(message, 3, 15000)
      } catch (error) {
        console.error('Failed to send queued message:', error)
        updateMessageStatus(message.id, MessageStatus.FAILED)
      }
    })
  }, [state.sendQueue])

  // 重试失败的消息
  const retryMessage = useCallback(async (messageId: string) => {
    const message = state.messages.find(m => m.id === messageId)
    if (!message || message.status !== MessageStatus.FAILED) {
      console.warn('Cannot retry message:', messageId)
      return
    }

    console.log('🔄 [ReliableChat] Retrying message:', messageId)
    updateMessageStatus(messageId, MessageStatus.SENDING)
    
    return attemptSendMessage(message, 3, 15000)
  }, [state.messages])

  // 工具函数
  const addMessage = (message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
  }

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: {
        id: 'system',
        name: 'System',
        username: 'system',
        isOnline: true
      },
      timestamp: new Date(),
      type: MessageType.SYSTEM,
      status: MessageStatus.SENT
    }
    addMessage(systemMessage)
  }

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }))
  }

  const updateMessageStatus = (messageId: string, status: MessageStatus) => {
    updateMessage(messageId, { status })
  }

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    // 清理所有超时
    messageTimeouts.current.forEach(timeout => clearTimeout(timeout))
    messageTimeouts.current.clear()
    
    setState(prev => ({
      ...prev,
      connectionStatus: ConnectionStatus.DISCONNECTED
    }))
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // 导出的接口
  return {
    // 状态
    ...state,
    currentUser: currentUserRef.current,
    isConnected: state.connectionStatus === ConnectionStatus.CONNECTED,
    
    // 操作
    connect,
    disconnect,
    sendMessage,
    retryMessage,
    
    // 工具
    addSystemMessage
  }
}