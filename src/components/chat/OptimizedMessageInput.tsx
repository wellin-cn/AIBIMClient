/**
 * 优化的消息输入组件
 * 
 * 特性：
 * - 发送状态显示
 * - 失败重试
 * - 队列状态
 * - 智能输入提示
 */

import React, { useState, useRef } from 'react'
import { Button, Input } from '../ui'
import { useReliableChat } from '../../hooks/useReliableChat'
import { ConnectionStatus } from '../../types'

interface OptimizedMessageInputProps {
  className?: string
  disabled?: boolean
  placeholder?: string
  onMessageSent?: (messageId: string) => void
  onMessageFailed?: (error: string) => void
}

export const OptimizedMessageInput: React.FC<OptimizedMessageInputProps> = ({
  className = '',
  disabled = false,
  placeholder = '输入消息...',
  onMessageSent,
  onMessageFailed
}) => {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    sendMessage, 
    connectionStatus, 
    isConnected, 
    queueSize,
    isRetrying
  } = useReliableChat('http://localhost:3001')

  // 输入状态计算
  const canSend = isConnected && message.trim() && !isSending && !disabled
  
  // 连接状态提示
  const getConnectionHint = () => {
    switch (connectionStatus) {
      case ConnectionStatus.DISCONNECTED:
        return '未连接到服务器'
      case ConnectionStatus.CONNECTING:
        return '正在连接...'
      case ConnectionStatus.RECONNECTING:
        return '正在重新连接...'
      case ConnectionStatus.CONNECTED:
        return queueSize > 0 ? `${queueSize} 条消息待发送` : '已连接'
      default:
        return ''
    }
  }

  // 发送消息
  const handleSend = async () => {
    if (!canSend) return

    const messageContent = message.trim()
    setIsSending(true)
    setLastError(null)

    try {
      console.log('📤 [OptimizedMessageInput] Sending message:', messageContent)
      
      const result = await sendMessage(messageContent, {
        timeout: 15000,
        retries: 3
      })

      if (result.success) {
        console.log('✅ [OptimizedMessageInput] Message sent successfully')
        setMessage('')
        onMessageSent?.(result.messageId)
        
        // 重新聚焦输入框
        inputRef.current?.focus()
      } else {
        console.error('❌ [OptimizedMessageInput] Message send failed:', result.error)
        setLastError(result.error || '发送失败')
        onMessageFailed?.(result.error || '发送失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发送失败'
      console.error('❌ [OptimizedMessageInput] Send error:', error)
      setLastError(errorMessage)
      onMessageFailed?.(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  // Enter键发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 清除错误
  const clearError = () => {
    setLastError(null)
  }

  // 输入变化处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    if (lastError) {
      clearError()
    }
  }

  // 获取发送按钮状态
  const getSendButtonProps = () => {
    if (isSending || isRetrying) {
      return {
        disabled: true,
        children: isSending ? '发送中...' : '重试中...',
        variant: 'primary' as const
      }
    }

    if (!isConnected) {
      return {
        disabled: true,
        children: '未连接',
        variant: 'secondary' as const
      }
    }

    if (!message.trim()) {
      return {
        disabled: true,
        children: '发送',
        variant: 'secondary' as const
      }
    }

    return {
      disabled: false,
      children: '发送',
      variant: 'primary' as const
    }
  }

  return (
    <div className={`bg-secondary border-t border-primary p-4 ${className}`}>
      {/* 错误提示 */}
      {lastError && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg flex items-center justify-between">
          <span className="text-red-700 text-sm">❌ {lastError}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 状态提示 */}
      {(queueSize > 0 || isRetrying) && (
        <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded-lg">
          <span className="text-blue-700 text-sm">
            {isRetrying && '🔄 正在重试发送消息...'}
            {queueSize > 0 && !isRetrying && `📋 ${queueSize} 条消息等待发送`}
          </span>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex items-center space-x-3">
        {/* 消息输入框 */}
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={!isConnected ? '等待连接...' : placeholder}
            disabled={disabled || !isConnected}
            className="w-full"
            maxLength={500}
          />
        </div>

        {/* 发送按钮 */}
        <Button
          onClick={handleSend}
          {...getSendButtonProps()}
          className="px-6 min-w-[80px]"
        />
      </div>

      {/* 底部状态栏 */}
      <div className="mt-2 flex items-center justify-between text-xs text-tertiary">
        <div className="flex items-center space-x-4">
          <span>按 Enter 发送，Shift + Enter 换行</span>
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
            }
          `}>
            {getConnectionHint()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {message.length > 0 && (
            <span className={`
              ${message.length > 450 ? 'text-red-500' : 'text-gray-500'}
            `}>
              {message.length}/500
            </span>
          )}
          
          {isSending && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
              <span>发送中...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}