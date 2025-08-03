import { useEffect, useRef, useState } from 'react'
import { Avatar, Badge, Button } from '@components/ui'
import { useChatStore, useAuthStore } from '../../store'
import { Message, MessageType, MessageStatus } from '../../types'

interface MessageListProps {
  className?: string
}

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
  showAvatar: boolean
  showTime: boolean
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  showAvatar,
  showTime,
}) => {
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENDING:
        return '⏳'
      case MessageStatus.SENT:
        return '✓'
      case MessageStatus.FAILED:
        return '❌'
      default:
        return ''
    }
  }

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENDING:
        return 'text-yellow-500'
      case MessageStatus.SENT:
        return 'text-gray-400'
      case MessageStatus.FAILED:
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  // 系统消息样式
  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-tertiary rounded-full px-3 py-1 text-xs text-secondary">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start space-x-3 mb-4 ${
      isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
    }`}>
      {/* 头像 */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <Avatar
            name={message.sender.name}
            size="md"
            status={message.sender.isOnline ? 'online' : 'offline'}
            showStatus={!isCurrentUser}
          />
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : ''}`}>
        {/* 发送者和时间 */}
        {showTime && (
          <div className={`flex items-center space-x-2 mb-1 ${
            isCurrentUser ? 'justify-end' : ''
          }`}>
            {!isCurrentUser && (
              <span className="text-sm font-medium text-primary">
                {message.sender.name}
              </span>
            )}
            <span className="text-xs text-tertiary">
              {(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* 消息气泡 */}
        <div className={`inline-block max-w-xs lg:max-w-md xl:max-w-lg ${
          isCurrentUser ? 'ml-auto' : ''
        }`}>
          <div className={`rounded-lg px-4 py-2 ${
            isCurrentUser
              ? 'bg-primary-500 text-white'
              : 'bg-tertiary text-primary'
          } ${message.status === MessageStatus.FAILED ? 'border-2 border-red-300' : ''}`}>
            <p className="text-sm break-words">{message.content}</p>
            
            {/* 消息状态 */}
            {isCurrentUser && message.status && (
              <div className={`text-xs mt-1 ${getStatusColor(message.status)}`}>
                {getStatusIcon(message.status)}
                {message.status === MessageStatus.FAILED && (
                  <span className="ml-1">发送失败</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const MessageList: React.FC<MessageListProps> = ({ className = '' }) => {
  const { messages } = useChatStore()
  const { currentUser } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 检查是否需要显示滚动到底部按钮
  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom && messages && messages.length > 0)
    }
  }

  // 处理滚动事件
  const handleScroll = () => {
    setIsUserScrolling(true)
    checkScrollPosition()
    
    // 延迟重置用户滚动状态
    setTimeout(() => {
      setIsUserScrolling(false)
    }, 1000)
  }

  // 新消息时自动滚动
  useEffect(() => {
    if (!isUserScrolling && messages && messages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, isUserScrolling])

  // 初始化滚动位置
  useEffect(() => {
    scrollToBottom()
  }, [])

  // 处理消息分组（相同用户连续发送的消息）
  const processMessages = () => {
    if (!messages || !Array.isArray(messages)) return []
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1]
      const nextMessage = messages[index + 1]
      
      const isCurrentUser = message.sender.id === currentUser?.id
      const isSameSender = prevMessage?.sender.id === message.sender.id
      const isLastInGroup = nextMessage?.sender.id !== message.sender.id
      
      // 时间间隔超过5分钟或不同发送者时显示时间
      const timeDiff = prevMessage 
        ? (message.timestamp instanceof Date ? message.timestamp.getTime() : message.timestamp) - 
          (prevMessage.timestamp instanceof Date ? prevMessage.timestamp.getTime() : prevMessage.timestamp)
        : Infinity
      const showTime = !isSameSender || timeDiff > 5 * 60 * 1000
      
      // 是否显示头像（群组最后一条消息或系统消息）
      const showAvatar = isLastInGroup || message.type === MessageType.SYSTEM

      return {
        message,
        isCurrentUser,
        showAvatar,
        showTime,
      }
    })
  }

  const processedMessages = processMessages()

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center text-secondary">
          <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium mb-2">开始对话</h3>
          <p className="text-sm">发送一条消息开始聊天吧！</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full relative ${className}`}>
      {/* 消息列表容器 - 独立滚动区域 */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden px-4 py-4"
        onScroll={handleScroll}
      >
        {/* 消息列表 */}
        <div className="space-y-1">
          {(processedMessages || []).map(({ message, isCurrentUser, showAvatar, showTime }) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              showAvatar={showAvatar}
              showTime={showTime}
            />
          ))}
        </div>
        
        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 滚动到底部按钮 */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="primary"
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full w-10 h-10 shadow-lg"
          >
            ↓
          </Button>
        </div>
      )}

      {/* 消息数量提示 */}
      {messages.length > 0 && (
        <div className="absolute top-2 right-4">
          <Badge variant="info" size="sm">
            {messages.length} 条消息
          </Badge>
        </div>
      )}
    </div>
  )
}