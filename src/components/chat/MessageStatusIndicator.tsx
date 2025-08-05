/**
 * 消息状态指示器组件
 * 
 * 显示消息的发送状态，支持重试操作
 */

import React from 'react'
import { Message, MessageStatus } from '../../types'

interface MessageStatusIndicatorProps {
  message: Message
  onRetry?: (messageId: string) => void
  showTimestamp?: boolean
  compact?: boolean
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  message,
  onRetry,
  showTimestamp = false,
  compact = false
}) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.SENDING:
        return (
          <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
        )
      case MessageStatus.SENT:
        return <span className="text-blue-500 text-sm">✓</span>
      case MessageStatus.DELIVERED:
        return <span className="text-green-500 text-sm">✓✓</span>
      case MessageStatus.FAILED:
        return (
          <button 
            onClick={() => onRetry?.(message.id)}
            className="text-red-500 hover:text-red-700 cursor-pointer text-sm"
            title="点击重试发送"
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
      case MessageStatus.SENDING:
        return '发送中...'
      case MessageStatus.SENT:
        return '已发送'
      case MessageStatus.DELIVERED:
        return '已送达'
      case MessageStatus.FAILED:
        return '发送失败'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (message.status) {
      case MessageStatus.SENDING:
        return 'text-blue-500'
      case MessageStatus.SENT:
        return 'text-blue-500'
      case MessageStatus.DELIVERED:
        return 'text-green-500'
      case MessageStatus.FAILED:
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚'
    }
    
    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    }
    
    // 小于24小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }
    
    // 显示具体时间
    return timestamp.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-1">
        {getStatusIcon()}
        {showTimestamp && (
          <span className="text-xs text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className={getStatusColor()}>
          {getStatusText()}
        </span>
      </div>
      
      {showTimestamp && (
        <span className="text-gray-400">
          {formatTimestamp(message.timestamp)}
        </span>
      )}
      
      {message.status === MessageStatus.FAILED && onRetry && (
        <button
          onClick={() => onRetry(message.id)}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          重试
        </button>
      )}
    </div>
  )
}

// 批量状态指示器
interface MessageBatchStatusProps {
  messages: Message[]
  onRetryAll?: () => void
}

export const MessageBatchStatus: React.FC<MessageBatchStatusProps> = ({
  messages,
  onRetryAll
}) => {
  const stats = messages.reduce((acc, msg) => {
    const status = msg.status || MessageStatus.SENT
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<MessageStatus, number>)

  const failedCount = stats[MessageStatus.FAILED] || 0
  const sendingCount = stats[MessageStatus.SENDING] || 0
  const totalCount = messages.length

  if (totalCount === 0) return null

  return (
    <div className="flex items-center space-x-4 text-xs text-gray-600 p-2 bg-gray-50 rounded">
      <span>
        总计 {totalCount} 条消息
      </span>
      
      {sendingCount > 0 && (
        <span className="text-blue-500">
          发送中 {sendingCount} 条
        </span>
      )}
      
      {failedCount > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-red-500">
            失败 {failedCount} 条
          </span>
          {onRetryAll && (
            <button
              onClick={onRetryAll}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              重试全部
            </button>
          )}
        </div>
      )}
    </div>
  )
}