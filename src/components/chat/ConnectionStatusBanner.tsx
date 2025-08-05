/**
 * 连接状态横幅组件
 * 
 * 显示连接状态并提供重连操作
 */

import React from 'react'
import { ConnectionStatus } from '../../hooks/useReliableChat'

interface ConnectionStatusBannerProps {
  status: ConnectionStatus
  queueSize?: number
  onReconnect?: () => void
  onClearQueue?: () => void
  className?: string
}

export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  status,
  queueSize = 0,
  onReconnect,
  onClearQueue,
  className = ''
}) => {
  // 连接正常时不显示横幅
  if (status === ConnectionStatus.CONNECTED && queueSize === 0) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case ConnectionStatus.DISCONNECTED:
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: '🔴',
          title: '连接已断开',
          description: '无法发送消息，请检查网络连接',
          actionText: '重新连接',
          showAction: true,
          urgent: true
        }
      
      case ConnectionStatus.CONNECTING:
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          icon: '🟡',
          title: '正在连接...',
          description: '请稍候，正在建立连接',
          actionText: '',
          showAction: false,
          urgent: false
        }
      
      case ConnectionStatus.RECONNECTING:
        return {
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          icon: '🔄',
          title: '正在重新连接...',
          description: '连接中断，正在尝试重新连接',
          actionText: '',
          showAction: false,
          urgent: false
        }
      
      case ConnectionStatus.CONNECTED:
        if (queueSize > 0) {
          return {
            bgColor: 'bg-blue-500',
            textColor: 'text-white',
            icon: '📋',
            title: `${queueSize} 条消息等待发送`,
            description: '连接已恢复，正在处理积压消息',
            actionText: '清空队列',
            showAction: true,
            urgent: false
          }
        }
        break
      
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  const handleAction = () => {
    if (status === ConnectionStatus.DISCONNECTED) {
      onReconnect?.()
    } else if (queueSize > 0) {
      onClearQueue?.()
    }
  }

  return (
    <div className={`
      ${config.bgColor} ${config.textColor} p-3 
      flex items-center justify-between relative overflow-hidden
      ${config.urgent ? 'animate-pulse' : ''}
      ${className}
    `}>
      {/* 背景动画效果 */}
      {status === ConnectionStatus.CONNECTING || status === ConnectionStatus.RECONNECTING ? (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      ) : null}
      
      <div className="flex items-center space-x-3 relative z-10">
        <span className="text-lg">{config.icon}</span>
        <div>
          <div className="font-medium">{config.title}</div>
          <div className="text-sm opacity-90">{config.description}</div>
        </div>
      </div>
      
      {config.showAction && (
        <div className="flex items-center space-x-2 relative z-10">
          {/* 队列信息 */}
          {queueSize > 0 && status === ConnectionStatus.CONNECTED && (
            <div className="text-sm bg-white/20 px-2 py-1 rounded">
              {queueSize} 条待发送
            </div>
          )}
          
          {/* 操作按钮 */}
          <button 
            onClick={handleAction}
            className="
              bg-white/20 hover:bg-white/30 px-4 py-2 rounded 
              text-sm font-medium transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-white/50
            "
          >
            {config.actionText}
          </button>
        </div>
      )}
    </div>
  )
}

// 简化版连接状态指示器
interface SimpleConnectionStatusProps {
  status: ConnectionStatus
  className?: string
}

export const SimpleConnectionStatus: React.FC<SimpleConnectionStatusProps> = ({
  status,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return { icon: '🟢', text: '已连接', color: 'text-green-600' }
      case ConnectionStatus.CONNECTING:
        return { icon: '🟡', text: '连接中', color: 'text-yellow-600' }
      case ConnectionStatus.RECONNECTING:
        return { icon: '🔄', text: '重连中', color: 'text-orange-600' }
      case ConnectionStatus.DISCONNECTED:
        return { icon: '🔴', text: '已断开', color: 'text-red-600' }
      default:
        return { icon: '⚪', text: '未知', color: 'text-gray-600' }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`flex items-center space-x-1 text-sm ${config.color} ${className}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  )
}