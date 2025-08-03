import { useState } from 'react'
import { Button, Input, Avatar, Badge } from '@components/ui'
import { useChat } from '@hooks/useChat'
import { useAuthStore, useUIStore } from '../../store'
import { ConnectionStatus, MessageType } from '../../types'

export const StateDemo: React.FC = () => {
  const [demoMessage, setDemoMessage] = useState('')
  const [demoUsername, setDemoUsername] = useState('演示用户')
  
  const {
    messages,
    users,
    onlineUsers,
    connectionStatus,
    typingUsers,
    sendMessage,
    addSystemMessage,
    handleUserJoined,
    handleUserLeft,
    setTypingStatus,
    setConnectionStatus,
  } = useChat()

  const { 
    currentUser, 
    setCurrentUser, 
    setUsername,
    isAuthenticated,
  } = useAuthStore()

  const {
    theme,
    sidebarVisible,
    setSidebarVisible,
    notifications,
    updateNotificationSettings,
  } = useUIStore()

  // 模拟登录
  const handleDemoLogin = () => {
    const user = {
      id: `user_${Date.now()}`,
      name: demoUsername,
      isOnline: true,
    }
    setCurrentUser(user)
    setUsername(demoUsername)
    setConnectionStatus(ConnectionStatus.CONNECTED)
    addSystemMessage(`${demoUsername} 已登录`)
  }

  // 模拟登出
  const handleDemoLogout = () => {
    if (currentUser) {
      addSystemMessage(`${currentUser.name} 已登出`)
      setCurrentUser(null)
      setConnectionStatus(ConnectionStatus.DISCONNECTED)
    }
  }

  // 发送演示消息
  const handleSendDemoMessage = () => {
    if (demoMessage.trim() && isAuthenticated) {
      sendMessage(demoMessage)
      setDemoMessage('')
    }
  }

  // 模拟添加用户
  const handleAddDemoUser = () => {
    const demoUser = {
      id: `user_demo_${Date.now()}`,
      name: `用户${users.length + 1}`,
      isOnline: true,
    }
    handleUserJoined(demoUser)
  }

  // 模拟用户离开
  const handleRemoveDemoUser = () => {
    if (users.length > 0) {
      const lastUser = users[users.length - 1]
      if (lastUser.id !== currentUser?.id) {
        handleUserLeft(lastUser.id)
      }
    }
  }

  // 模拟正在输入
  const handleToggleTyping = () => {
    if (users.length > 0) {
      const demoUser = users.find((u: any) => u.id !== currentUser?.id)
      if (demoUser) {
        const isCurrentlyTyping = typingUsers.some(u => u.id === demoUser.id)
        setTypingStatus(demoUser.id, !isCurrentlyTyping)
      }
    }
  }

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED: return 'success'
      case ConnectionStatus.CONNECTING: return 'warning'
      case ConnectionStatus.RECONNECTING: return 'warning'
      default: return 'error'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-secondary rounded-xl p-6 border border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">🔄 状态管理系统演示</h3>
        
        {/* 认证状态 */}
        <div className="mb-6">
          <h4 className="font-medium text-primary mb-3">认证状态</h4>
          <div className="flex items-center gap-4 mb-3">
            <Badge variant={isAuthenticated ? 'success' : 'error'}>
              {isAuthenticated ? '已登录' : '未登录'}
            </Badge>
            <Badge variant={getStatusColor(connectionStatus)}>
              连接状态: {connectionStatus}
            </Badge>
            <Badge>主题: {theme}</Badge>
          </div>
          
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Input
                placeholder="输入用户名"
                value={demoUsername}
                onChange={(e) => setDemoUsername(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleDemoLogin} disabled={!demoUsername.trim()}>
                模拟登录
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar 
                name={currentUser?.name || ''} 
                size="md" 
                status="online" 
                showStatus 
              />
              <span className="text-primary">当前用户: {currentUser?.name}</span>
              <Button variant="secondary" onClick={handleDemoLogout}>
                登出
              </Button>
            </div>
          )}
        </div>

        {/* 用户管理 */}
        <div className="mb-6">
          <h4 className="font-medium text-primary mb-3">用户管理</h4>
          <div className="flex items-center gap-3 mb-3">
            <Button size="sm" onClick={handleAddDemoUser}>
              添加演示用户
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRemoveDemoUser}>
              移除用户
            </Button>
            <Button size="sm" variant="text" onClick={handleToggleTyping}>
              切换输入状态
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-secondary">
              在线用户 ({onlineUsers.length})：
            </p>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((user: any) => (
                <div key={user.id} className="flex items-center gap-2 bg-tertiary px-3 py-1 rounded-lg">
                  <Avatar name={user.name} size="sm" status="online" showStatus />
                  <span className="text-sm text-primary">{user.name}</span>
                </div>
              ))}
            </div>
            
            {typingUsers.length > 0 && (
              <p className="text-xs text-secondary">
                {typingUsers.map(u => u.name).join(', ')} 正在输入...
              </p>
            )}
          </div>
        </div>

        {/* 消息管理 */}
        <div className="mb-6">
          <h4 className="font-medium text-primary mb-3">消息管理</h4>
          <div className="flex items-center gap-3 mb-3">
            <Input
              placeholder="输入演示消息"
              value={demoMessage}
              onChange={(e) => setDemoMessage(e.target.value)}
              disabled={!isAuthenticated}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendDemoMessage()}
            />
            <Button 
              onClick={handleSendDemoMessage}
              disabled={!demoMessage.trim() || !isAuthenticated}
            >
              发送
            </Button>
          </div>
          
          <div className="bg-tertiary rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-secondary text-center">暂无消息</p>
            ) : (
              messages.slice(-5).map((message: any) => (
                <div key={message.id} className="flex items-start gap-2">
                  <Avatar name={message.sender.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-tertiary">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === MessageType.SYSTEM && (
                        <Badge size="sm" variant="info">系统</Badge>
                      )}
                    </div>
                    <p className="text-sm text-secondary">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* UI状态管理 */}
        <div>
          <h4 className="font-medium text-primary mb-3">UI状态管理</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sidebarVisible}
                  onChange={(e) => setSidebarVisible(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-primary">显示侧边栏</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.sound}
                  onChange={(e) => updateNotificationSettings({ sound: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-primary">声音通知</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.desktop}
                  onChange={(e) => updateNotificationSettings({ desktop: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-primary">桌面通知</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.mentions}
                  onChange={(e) => updateNotificationSettings({ mentions: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-primary">提及通知</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 状态统计 */}
      <div className="bg-secondary rounded-xl p-6 border border-primary">
        <h4 className="font-medium text-primary mb-3">状态统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-tertiary rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{messages.length}</div>
            <div className="text-xs text-secondary">消息总数</div>
          </div>
          <div className="bg-tertiary rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-xs text-secondary">用户总数</div>
          </div>
          <div className="bg-tertiary rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{onlineUsers.length}</div>
            <div className="text-xs text-secondary">在线用户</div>
          </div>
          <div className="bg-tertiary rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{typingUsers.length}</div>
            <div className="text-xs text-secondary">正在输入</div>
          </div>
        </div>
      </div>
    </div>
  )
}