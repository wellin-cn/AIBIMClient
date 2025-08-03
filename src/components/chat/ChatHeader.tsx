import { Button, Avatar, Badge } from '@components/ui'
import { useAuthStore, useChatStore } from '../../store'
import { useSocket } from '../../hooks/useSocket'
import { ConnectionStatus } from '../../types'

interface ChatHeaderProps {
  onLogout: () => void
  onToggleSidebar: () => void
  sidebarVisible: boolean
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onLogout,
  onToggleSidebar,
  sidebarVisible,
}) => {
  const { currentUser } = useAuthStore()
  const { connectionStatus, onlineUsers } = useChatStore()
  const { disconnect } = useSocket()

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return { variant: 'success' as const, text: '已连接', dot: false }
      case ConnectionStatus.CONNECTING:
        return { variant: 'warning' as const, text: '连接中', dot: true }
      case ConnectionStatus.RECONNECTING:
        return { variant: 'warning' as const, text: '重连中', dot: true }
      case ConnectionStatus.DISCONNECTED:
        return { variant: 'error' as const, text: '已断开', dot: false }
      default:
        return { variant: 'info' as const, text: '未知', dot: false }
    }
  }

  const statusInfo = getConnectionStatusInfo()

  return (
    <header className="bg-secondary border-b border-primary px-4 py-3 flex items-center justify-between">
      {/* 左侧 - 应用信息和侧边栏切换 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="text"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2"
        >
          {sidebarVisible ? '◀' : '▶'}
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">💬</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">IM Chat</h1>
            <p className="text-xs text-secondary">
              {onlineUsers.size} 人在线
            </p>
          </div>
        </div>
      </div>

      {/* 中间 - 连接状态 */}
      <div className="flex items-center space-x-2">
        <Badge 
          variant={statusInfo.variant}
          dot={statusInfo.dot}
          size="sm"
        >
          {statusInfo.text}
        </Badge>
        
        {connectionStatus === ConnectionStatus.CONNECTED && (
          <span className="text-xs text-secondary">
            服务器连接正常
          </span>
        )}
      </div>

      {/* 右侧 - 用户信息和操作 */}
      <div className="flex items-center space-x-3">
        {/* 当前用户信息 */}
        {currentUser && (
          <div className="flex items-center space-x-2">
            <Avatar 
              name={currentUser.name} 
              size="sm" 
              status="online" 
              showStatus 
            />
            <span className="text-sm font-medium text-primary hidden sm:block">
              {currentUser.name}
            </span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2">
          {/* 刷新连接 */}
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              // 刷新页面重新连接
              window.location.reload()
            }}
            disabled={connectionStatus === ConnectionStatus.CONNECTING}
            title="刷新连接"
          >
            🔄
          </Button>

          {/* 设置 */}
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              // 这里可以打开设置模态框
            }}
            title="设置"
          >
            ⚙️
          </Button>

          {/* 登出 */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              disconnect()
              onLogout()
            }}
            title="登出"
          >
            🚪
          </Button>
        </div>
      </div>
    </header>
  )
}