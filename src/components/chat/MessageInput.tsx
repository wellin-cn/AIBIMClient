import { useState, useRef, useEffect } from 'react'
import { Button, Input } from '@components/ui'
import { useSocket } from '../../hooks/useSocket'
import { useAuthStore, useUIStore } from '../../store'

interface MessageInputProps {
  className?: string
  disabled?: boolean
  placeholder?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
  className = '',
  disabled = false,
  placeholder = '输入消息...',
}) => {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { sendMessage, sendTypingStatus } = useSocket()
  const { currentUser } = useAuthStore()
  const { showEmojiPicker, setShowEmojiPicker } = useUIStore()

  // 输入状态管理
  useEffect(() => {
    if (message.trim()) {
      sendTypingStatus(true)
    } else {
      sendTypingStatus(false)
    }
  }, [message, sendTypingStatus])

  // 清理输入状态
  useEffect(() => {
    return () => {
      sendTypingStatus(false)
    }
  }, [sendTypingStatus])

  const handleSend = async () => {
    if (!message.trim() || disabled || !currentUser) return

    try {
      // 发送消息
      await sendMessage(message.trim())
      
      // 清空输入框
      setMessage('')
      
      // 重新聚焦输入框
      inputRef.current?.focus()
      
      // 清除输入状态
      sendTypingStatus(false)
    } catch (error) {
      console.error('Failed to send message:', error)
      // 这里可以显示错误提示
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // 这里处理文件上传逻辑
      const file = files[0]
      console.log('Selected file:', file.name)
      
      // 模拟文件上传消息
      if (currentUser) {
        sendMessage(`📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      }
      
      // 清空文件输入
      e.target.value = ''
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // 常用表情列表
  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😮', '😢', '😡', '🎉', '🔥']

  return (
    <div className={`bg-secondary border-t border-primary p-4 ${className}`}>
      {/* 表情选择器 */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-tertiary rounded-lg border border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">常用表情</span>
            <Button
              variant="text"
              size="sm"
              onClick={() => setShowEmojiPicker(false)}
            >
              ✕
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-lg p-2 rounded hover:bg-primary-100 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex items-end space-x-3">
        {/* 工具按钮 */}
        <div className="flex space-x-1">
          {/* 表情按钮 */}
          <Button
            variant="text"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="p-2"
            title="添加表情"
          >
            😊
          </Button>

          {/* 文件上传按钮 */}
          <Button
            variant="text"
            size="sm"
            onClick={handleFileUpload}
            disabled={disabled}
            className="p-2"
            title="发送文件"
          >
            📎
          </Button>
        </div>

        {/* 消息输入框 */}
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={disabled ? '连接服务器后可发送消息' : placeholder}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* 发送按钮 */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          variant="primary"
          size="sm"
          className="px-6"
        >
          发送
        </Button>
      </div>

      {/* 输入提示 */}
      <div className="mt-2 flex items-center justify-between text-xs text-tertiary">
        <div className="flex items-center space-x-4">
          <span>按 Enter 发送，Shift + Enter 换行</span>
          {!currentUser && (
            <span className="text-red-500">请先登录</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {message.length > 0 && (
            <span>{message.length}/500</span>
          )}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  )
}