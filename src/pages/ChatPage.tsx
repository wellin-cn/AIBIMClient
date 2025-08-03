import { useState } from 'react'
import { ChatWindow } from '../components/chat/ChatWindow'
import { MessageList } from '../components/chat/MessageList'
import { MessageInput } from '../components/chat/MessageInput'
import { useUIStore, useChatStore } from '../store'
import { useSocket } from '../hooks/useSocket'
import { ConnectionStatus } from '../types'

interface ChatPageProps {
  onLogout: () => void
}

export const ChatPage: React.FC<ChatPageProps> = ({ onLogout }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>()
  
  const { sidebarVisible, setSidebarVisible } = useUIStore()
  const { connectionStatus } = useChatStore()
  const { disconnect } = useSocket()

  const isConnected = connectionStatus === ConnectionStatus.CONNECTED

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const handleUserSelect = (user: any) => {
    setSelectedUserId(user.id)
    // 在移动设备上选择用户后自动隐藏侧边栏
    if (window.innerWidth < 768) {
      setSidebarVisible(false)
    }
  }

  // 统一使用ChatWindow布局
  return (
    <div className="h-screen bg-primary relative">
      <ChatWindow
        onLogout={onLogout}
        onUserSelect={handleUserSelect}
        selectedUserId={selectedUserId}
        messageInputDisabled={!isConnected}
        messageInputPlaceholder={
          isConnected ? "输入消息..." : "连接服务器后可发送消息"
        }
        sidebarVisible={sidebarVisible}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 连接状态遮罩 */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-xl p-6 shadow-lg max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                连接中断
              </h3>
              <p className="text-sm text-secondary mb-4">
                {connectionStatus === ConnectionStatus.CONNECTING 
                  ? '正在连接到服务器...'
                  : connectionStatus === ConnectionStatus.RECONNECTING
                  ? '正在尝试重新连接...'
                  : '与服务器的连接已断开'
                }
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  重新连接
                </button>
                <button
                  onClick={() => {
                    disconnect()
                    onLogout()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  返回登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}