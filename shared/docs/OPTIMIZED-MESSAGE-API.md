# 📨 优化后的消息发送API指南

## 🎯 概述

基于多用户测试发现的问题，我们对消息发送机制进行了全面优化，确保消息能够可靠发送和接收。

## 🚀 核心优化

### 1. 增强的消息发送API

```typescript
interface OptimizedMessageSending {
  // 发送消息（带重试机制）
  sendMessage(content: string, options?: SendOptions): Promise<MessageResult>
  
  // 批量发送消息
  sendMessages(messages: string[], options?: SendOptions): Promise<MessageResult[]>
  
  // 检查消息发送状态
  checkMessageStatus(messageId: string): Promise<MessageStatus>
}

interface SendOptions {
  timeout?: number        // 超时时间（默认15秒）
  retries?: number        // 重试次数（默认3次）
  priority?: 'low' | 'normal' | 'high'  // 消息优先级
  requireAck?: boolean    // 是否需要确认收到
}

interface MessageResult {
  success: boolean
  messageId: string
  timestamp: Date
  error?: string
  retryCount?: number
}
```

### 2. 改进的Socket事件处理

```typescript
// 新的事件名称（更明确）
const SOCKET_EVENTS = {
  // 消息相关
  SEND_MESSAGE: 'message:send',           // 替代 'send_message'
  MESSAGE_RECEIVED: 'message:received',   // 服务器确认收到
  MESSAGE_DELIVERED: 'message:delivered', // 消息已传递给其他用户
  MESSAGE_FAILED: 'message:failed',       // 消息发送失败
  
  // 连接相关
  CONNECTION_READY: 'connection:ready',   // 连接就绪，可以发送消息
  CONNECTION_UNSTABLE: 'connection:unstable', // 连接不稳定
} as const
```

## 🔧 客户端实现指南

### React Hook 示例

```typescript
// hooks/useOptimizedChat.ts
import { useState, useCallback, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  sender: User
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'failed'
  retryCount: number
}

interface SendMessageOptions {
  timeout?: number
  retries?: number
  priority?: 'low' | 'normal' | 'high'
}

export const useOptimizedChat = (serverUrl: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'ready'>('disconnected')
  const [sendQueue, setSendQueue] = useState<Message[]>([])
  
  const socketRef = useRef<Socket | null>(null)
  const messageTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const retryQueue = useRef<Map<string, number>>(new Map())

  // 连接到服务器
  const connect = useCallback(async (username: string) => {
    try {
      setConnectionStatus('connecting')
      
      const socket = io(serverUrl, {
        auth: { username },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      socketRef.current = socket

      // 连接成功
      socket.on('connect', () => {
        console.log('🟢 Socket connected:', socket.id)
        setConnectionStatus('connected')
        
        // 发送用户加入事件
        socket.emit('user:join', { username }, (response) => {
          if (response?.success) {
            setConnectionStatus('ready')
            console.log('✅ Connection ready for messaging')
            
            // 处理排队的消息
            processSendQueue()
          }
        })
      })

      // 连接失败
      socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error)
        setConnectionStatus('disconnected')
      })

      // 消息接收
      socket.on('message:received', (message) => {
        console.log('📥 Message received:', message)
        updateMessageStatus(message.id, 'delivered')
        addMessage(message)
      })

      // 消息发送确认
      socket.on('message:delivered', (data) => {
        console.log('✅ Message delivered:', data.messageId)
        updateMessageStatus(data.messageId, 'delivered')
        clearMessageTimeout(data.messageId)
      })

      // 消息发送失败
      socket.on('message:failed', (data) => {
        console.error('❌ Message failed:', data)
        handleMessageFailure(data.messageId, data.error)
      })

    } catch (error) {
      console.error('Connection error:', error)
      setConnectionStatus('disconnected')
      throw error
    }
  }, [serverUrl])

  // 优化的消息发送
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ): Promise<MessageResult> => {
    const {
      timeout = 15000,
      retries = 3,
      priority = 'normal'
    } = options

    // 创建消息对象
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      sender: getCurrentUser(), // 需要实现
      timestamp: new Date(),
      status: 'sending',
      retryCount: 0
    }

    // 立即显示在UI中
    addMessage(message)

    // 检查连接状态
    if (connectionStatus !== 'ready') {
      // 添加到发送队列
      setSendQueue(prev => [...prev, message])
      return {
        success: false,
        messageId: message.id,
        timestamp: new Date(),
        error: 'Connection not ready, message queued'
      }
    }

    return attemptSendMessage(message, retries, timeout)
  }, [connectionStatus])

  // 尝试发送消息（带重试）
  const attemptSendMessage = async (
    message: Message, 
    retriesLeft: number, 
    timeout: number
  ): Promise<MessageResult> => {
    return new Promise((resolve) => {
      const socket = socketRef.current
      if (!socket?.connected) {
        resolve({
          success: false,
          messageId: message.id,
          timestamp: new Date(),
          error: 'Socket not connected'
        })
        return
      }

      console.log(`📤 Sending message (${message.retryCount + 1}/${retries + 1}):`, message.content)

      // 设置超时
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Message timeout: ${message.id}`)
        
        if (retriesLeft > 0) {
          console.log(`🔄 Retrying message: ${retriesLeft} attempts left`)
          message.retryCount++
          updateMessageInList(message)
          
          setTimeout(() => {
            attemptSendMessage(message, retriesLeft - 1, timeout).then(resolve)
          }, 1000 * message.retryCount) // 递增延迟
        } else {
          updateMessageStatus(message.id, 'failed')
          resolve({
            success: false,
            messageId: message.id,
            timestamp: new Date(),
            error: 'Message send timeout after retries',
            retryCount: message.retryCount
          })
        }
      }, timeout)

      messageTimeouts.current.set(message.id, timeoutId)

      // 发送消息
      socket.emit('message:send', {
        id: message.id,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        priority: 'normal'
      }, (response) => {
        clearMessageTimeout(message.id)
        
        if (response?.success) {
          console.log('✅ Message sent successfully:', response)
          updateMessageStatus(message.id, 'sent')
          resolve({
            success: true,
            messageId: message.id,
            timestamp: new Date(),
            retryCount: message.retryCount
          })
        } else {
          console.error('❌ Server rejected message:', response)
          
          if (retriesLeft > 0) {
            message.retryCount++
            setTimeout(() => {
              attemptSendMessage(message, retriesLeft - 1, timeout).then(resolve)
            }, 1000)
          } else {
            updateMessageStatus(message.id, 'failed')
            resolve({
              success: false,
              messageId: message.id,
              timestamp: new Date(),
              error: response?.error || 'Server rejected message',
              retryCount: message.retryCount
            })
          }
        }
      })
    })
  }

  // 处理发送队列
  const processSendQueue = useCallback(() => {
    if (connectionStatus !== 'ready' || sendQueue.length === 0) return

    console.log(`📋 Processing send queue: ${sendQueue.length} messages`)
    
    sendQueue.forEach(async (message) => {
      try {
        await attemptSendMessage(message, 3, 15000)
      } catch (error) {
        console.error('Queue message send failed:', error)
        updateMessageStatus(message.id, 'failed')
      }
    })

    setSendQueue([])
  }, [connectionStatus, sendQueue])

  // 处理消息失败
  const handleMessageFailure = useCallback((messageId: string, error: string) => {
    console.error(`❌ Message ${messageId} failed:`, error)
    updateMessageStatus(messageId, 'failed')
    clearMessageTimeout(messageId)
  }, [])

  // 工具函数
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ))
  }

  const updateMessageInList = (updatedMessage: Message) => {
    setMessages(prev => prev.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ))
  }

  const clearMessageTimeout = (messageId: string) => {
    const timeoutId = messageTimeouts.current.get(messageId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      messageTimeouts.current.delete(messageId)
    }
  }

  // 批量发送消息
  const sendMessages = useCallback(async (contents: string[]): Promise<MessageResult[]> => {
    const results = await Promise.allSettled(
      contents.map(content => sendMessage(content))
    )
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        success: false,
        messageId: '',
        timestamp: new Date(),
        error: 'Promise rejected'
      }
    )
  }, [sendMessage])

  // 重试失败的消息
  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.status !== 'failed') return

    message.status = 'sending'
    message.retryCount = 0
    updateMessageInList(message)

    return attemptSendMessage(message, 3, 15000)
  }, [messages])

  // 清理
  useEffect(() => {
    return () => {
      messageTimeouts.current.forEach(timeout => clearTimeout(timeout))
      messageTimeouts.current.clear()
    }
  }, [])

  return {
    // 状态
    messages,
    connectionStatus,
    sendQueue,
    
    // 操作
    connect,
    sendMessage,
    sendMessages,
    retryMessage,
    
    // 工具
    clearMessageTimeout
  }
}

// 类型定义
interface MessageResult {
  success: boolean
  messageId: string
  timestamp: Date
  error?: string
  retryCount?: number
}

interface User {
  id: string
  name: string
  username: string
}

function getCurrentUser(): User {
  // 实现获取当前用户的逻辑
  return {
    id: 'current-user-id',
    name: 'Current User',
    username: 'currentuser'
  }
}
```

### Vue Composition API 示例

```typescript
// composables/useOptimizedChat.ts
import { ref, computed, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

export function useOptimizedChat(serverUrl: string) {
  const messages = ref<Message[]>([])
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'ready'>('disconnected')
  const sendQueue = ref<Message[]>([])
  
  let socket: Socket | null = null
  const messageTimeouts = new Map<string, NodeJS.Timeout>()

  // 连接状态计算属性
  const isReady = computed(() => connectionStatus.value === 'ready')
  const canSendMessages = computed(() => isReady.value && socket?.connected)

  // 连接到服务器
  const connect = async (username: string) => {
    connectionStatus.value = 'connecting'
    
    socket = io(serverUrl, {
      auth: { username },
      transports: ['websocket', 'polling'],
      timeout: 20000
    })

    socket.on('connect', () => {
      connectionStatus.value = 'connected'
      
      socket?.emit('user:join', { username }, (response) => {
        if (response?.success) {
          connectionStatus.value = 'ready'
          processSendQueue()
        }
      })
    })

    socket.on('connect_error', () => {
      connectionStatus.value = 'disconnected'
    })

    socket.on('message:received', (message) => {
      addMessage(message)
    })
  }

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!canSendMessages.value) {
      throw new Error('Cannot send message: connection not ready')
    }

    const message: Message = {
      id: generateMessageId(),
      content,
      sender: getCurrentUser(),
      timestamp: new Date(),
      status: 'sending',
      retryCount: 0
    }

    addMessage(message)
    return attemptSendMessage(message, 3, 15000)
  }

  // 其他方法实现...
  
  // 清理
  onUnmounted(() => {
    messageTimeouts.forEach(timeout => clearTimeout(timeout))
    socket?.disconnect()
  })

  return {
    messages: readonly(messages),
    connectionStatus: readonly(connectionStatus),
    isReady,
    canSendMessages,
    connect,
    sendMessage
  }
}
```

## 🎨 UI状态显示组件

### React 组件示例

```tsx
// components/MessageStatusIndicator.tsx
import React from 'react'
import { Message } from '../types'

interface Props {
  message: Message
  onRetry?: (messageId: string) => void
}

export const MessageStatusIndicator: React.FC<Props> = ({ message, onRetry }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      case 'sent':
        return <span className="text-blue-500">✓</span>
      case 'delivered':
        return <span className="text-green-500">✓✓</span>
      case 'failed':
        return (
          <button 
            onClick={() => onRetry?.(message.id)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
            title="点击重试"
          >
            ⚠️
          </button>
        )
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (message.status) {
      case 'sending':
        return `发送中${message.retryCount > 0 ? ` (重试 ${message.retryCount})` : ''}`
      case 'sent':
        return '已发送'
      case 'delivered':
        return '已送达'
      case 'failed':
        return `发送失败${message.retryCount > 0 ? ` (已重试 ${message.retryCount} 次)` : ''}`
      default:
        return ''
    }
  }

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-500">
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  )
}

// components/ConnectionStatusBanner.tsx
import React from 'react'

interface Props {
  status: 'disconnected' | 'connecting' | 'connected' | 'ready'
  onReconnect?: () => void
}

export const ConnectionStatusBanner: React.FC<Props> = ({ status, onReconnect }) => {
  if (status === 'ready') return null

  const getStatusConfig = () => {
    switch (status) {
      case 'disconnected':
        return {
          color: 'bg-red-500',
          text: '连接已断开',
          action: '重新连接',
          showAction: true
        }
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: '正在连接...',
          action: '',
          showAction: false
        }
      case 'connected':
        return {
          color: 'bg-blue-500',
          text: '正在准备...',
          action: '',
          showAction: false
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  return (
    <div className={`${config.color} text-white p-3 flex items-center justify-between`}>
      <span>{config.text}</span>
      {config.showAction && (
        <button 
          onClick={onReconnect}
          className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm hover:bg-opacity-30"
        >
          {config.action}
        </button>
      )}
    </div>
  )
}
```

### Vue 组件示例

```vue
<!-- components/MessageStatusIndicator.vue -->
<template>
  <div class="flex items-center space-x-1 text-xs text-gray-500">
    <component :is="statusIcon" />
    <span>{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Message } from '../types'

interface Props {
  message: Message
}

const props = defineProps<Props>()
const emit = defineEmits<{
  retry: [messageId: string]
}>()

const statusIcon = computed(() => {
  switch (props.message.status) {
    case 'sending':
      return 'div'  // 旋转加载图标
    case 'sent':
      return () => h('span', { class: 'text-blue-500' }, '✓')
    case 'delivered':
      return () => h('span', { class: 'text-green-500' }, '✓✓')
    case 'failed':
      return () => h('button', {
        class: 'text-red-500 hover:text-red-700 cursor-pointer',
        onClick: () => emit('retry', props.message.id)
      }, '⚠️')
    default:
      return null
  }
})

const statusText = computed(() => {
  const { status, retryCount } = props.message
  switch (status) {
    case 'sending':
      return `发送中${retryCount > 0 ? ` (重试 ${retryCount})` : ''}`
    case 'sent':
      return '已发送'
    case 'delivered':
      return '已送达'
    case 'failed':
      return `发送失败${retryCount > 0 ? ` (已重试 ${retryCount} 次)` : ''}`
    default:
      return ''
  }
})
</script>
```

## 🔧 错误处理和重试机制

### 智能重试策略

```typescript
class MessageRetryManager {
  private retryAttempts = new Map<string, number>()
  private retryTimeouts = new Map<string, NodeJS.Timeout>()
  
  private readonly RETRY_DELAYS = [1000, 2000, 5000] // 递增延迟
  private readonly MAX_RETRIES = 3

  async retryMessage(message: Message, attempt: number = 0): Promise<MessageResult> {
    if (attempt >= this.MAX_RETRIES) {
      return {
        success: false,
        messageId: message.id,
        timestamp: new Date(),
        error: 'Max retry attempts exceeded',
        retryCount: attempt
      }
    }

    // 记录重试次数
    this.retryAttempts.set(message.id, attempt)
    
    // 计算延迟时间
    const delay = this.calculateRetryDelay(attempt)
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await this.attemptSend(message)
          if (result.success) {
            this.cleanup(message.id)
            resolve(result)
          } else {
            // 递归重试
            const retryResult = await this.retryMessage(message, attempt + 1)
            resolve(retryResult)
          }
        } catch (error) {
          const retryResult = await this.retryMessage(message, attempt + 1)
          resolve(retryResult)
        }
      }, delay)
      
      this.retryTimeouts.set(message.id, timeoutId)
    })
  }

  private calculateRetryDelay(attempt: number): number {
    // 指数退避 + 随机抖动
    const baseDelay = this.RETRY_DELAYS[Math.min(attempt, this.RETRY_DELAYS.length - 1)]
    const jitter = Math.random() * 1000 // 0-1秒随机延迟
    return baseDelay + jitter
  }

  private cleanup(messageId: string) {
    this.retryAttempts.delete(messageId)
    
    const timeout = this.retryTimeouts.get(messageId)
    if (timeout) {
      clearTimeout(timeout)
      this.retryTimeouts.delete(messageId)
    }
  }

  cancelRetry(messageId: string) {
    this.cleanup(messageId)
  }

  getRetryCount(messageId: string): number {
    return this.retryAttempts.get(messageId) || 0
  }
}
```

### 网络状态监控

```typescript
class NetworkMonitor {
  private isOnline = navigator.onLine
  private listeners: Array<(online: boolean) => void> = []

  constructor() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  private handleOnline = () => {
    this.isOnline = true
    this.notifyListeners(true)
  }

  private handleOffline = () => {
    this.isOnline = false
    this.notifyListeners(false)
  }

  onNetworkChange(callback: (online: boolean) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online))
  }

  get online() {
    return this.isOnline
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }
}
```

## 📊 性能监控

```typescript
class MessagePerformanceMonitor {
  private metrics = new Map<string, MessageMetrics>()

  startTiming(messageId: string) {
    this.metrics.set(messageId, {
      messageId,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      retries: 0,
      success: false
    })
  }

  endTiming(messageId: string, success: boolean, retries: number = 0) {
    const metric = this.metrics.get(messageId)
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
      metric.success = success
      metric.retries = retries

      this.reportMetrics(metric)
    }
  }

  private reportMetrics(metric: MessageMetrics) {
    console.log('📊 Message Performance:', {
      messageId: metric.messageId,
      duration: `${metric.duration.toFixed(2)}ms`,
      success: metric.success,
      retries: metric.retries,
      averageTime: this.getAverageTime()
    })

    // 可以发送到分析服务
    if (metric.duration > 5000) {
      console.warn('⚠️ Slow message detected:', metric)
    }
  }

  private getAverageTime(): number {
    const completed = Array.from(this.metrics.values()).filter(m => m.endTime > 0)
    if (completed.length === 0) return 0
    
    const total = completed.reduce((sum, m) => sum + m.duration, 0)
    return total / completed.length
  }

  getMetrics() {
    return Array.from(this.metrics.values())
  }
}

interface MessageMetrics {
  messageId: string
  startTime: number
  endTime: number
  duration: number
  retries: number
  success: boolean
}
```

## 🎉 总结

通过这些优化，我们提供了：

1. **可靠的消息发送机制** - 带重试和超时处理
2. **智能连接管理** - 自动检测连接状态
3. **用户友好的UI反馈** - 清晰的状态指示
4. **完整的错误处理** - 优雅的失败恢复
5. **性能监控** - 实时性能追踪

这些改进确保了在各种网络条件下都能提供良好的用户体验。