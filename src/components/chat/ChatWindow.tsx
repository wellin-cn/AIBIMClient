import React from 'react'
import { ChatHeader } from './ChatHeader'
import { UserList } from './UserList'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { User } from '../../types'

interface ChatWindowProps {
  onLogout: () => void
  onUserSelect?: (user: User) => void
  selectedUserId?: string
  messageInputDisabled?: boolean
  messageInputPlaceholder?: string
  sidebarVisible?: boolean
  onToggleSidebar?: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onLogout,
  onUserSelect,
  selectedUserId,
  messageInputDisabled = false,
  messageInputPlaceholder = "输入消息...",
  sidebarVisible = true,
  onToggleSidebar,
}) => {
  return (
    <div className="chat-container h-screen flex flex-col">
      {/* 顶部标题栏 */}
      <div className="chat-header flex-shrink-0 h-16 bg-white border-b border-gray-200">
        <ChatHeader
          onLogout={onLogout}
          onToggleSidebar={onToggleSidebar || (() => {})}
          sidebarVisible={sidebarVisible}
        />
      </div>
      
      {/* 主体区域 */}
      <div className="chat-body flex-1 flex overflow-hidden">
        {/* 左侧用户列表 */}
        {sidebarVisible && (
          <div className="user-list-container w-60 flex-shrink-0 flex flex-col border-r border-gray-200">
            <div className="user-list-header flex-shrink-0 p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">在线用户</h3>
            </div>
            <div className="user-list-content flex-1 overflow-y-auto overflow-x-hidden">
              <UserList
                onUserSelect={onUserSelect}
                selectedUserId={selectedUserId}
              />
            </div>
          </div>
        )}
        
        {/* 右侧聊天区域 */}
        <div className="chat-area flex-1 flex flex-col overflow-hidden">
          {/* 消息列表容器 */}
          <div className="message-list-container flex-1 overflow-y-auto overflow-x-hidden">
            {selectedUserId ? (
              <MessageList />
            ) : (
              /* 欢迎页面内容 */
              <div className="h-full flex items-center justify-center bg-secondary">
                <div className="text-center text-secondary max-w-md">
                  <div className="w-20 h-20 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">欢迎使用 IM Chat</h3>
                  <p className="text-sm mb-4">
                    从左侧用户列表选择一个用户开始聊天，或者在群组中与所有人交流。
                  </p>
                  <div className="space-y-2 text-xs">
                    <p>🎯 选择用户开始私聊</p>
                    <p>💬 发送消息与他人交流</p>
                    <p>📎 支持文件和图片分享</p>
                    <p>🌙 支持明暗主题切换</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 消息输入容器 */}
          <div className="message-input-container flex-shrink-0 border-t border-gray-200">
            <MessageInput 
              disabled={messageInputDisabled}
              placeholder={messageInputPlaceholder}
            />
          </div>
        </div>
      </div>
    </div>
  )
}