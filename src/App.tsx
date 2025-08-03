import { useState } from 'react'
import { useTheme } from '@hooks/useTheme'
import { Button, Input, Avatar, Badge, Modal } from '@components/ui'
import { StateDemo } from './components/demo/StateDemo'
import { LoginPage } from './pages/LoginPage'
import { ChatPage } from './pages/ChatPage'
import { useAuthStore, useChatStore } from './store'
import { useSocket } from './hooks/useSocket'
import { ConnectionStatus } from './types'

type AppMode = 'demo' | 'chat'
type DemoTab = 'components' | 'state'

function App() {
  const { toggleTheme, isDark, theme } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState<DemoTab>('components')
  const [appMode, setAppMode] = useState<AppMode>('demo')
  
  const { isAuthenticated, logout: authLogout } = useAuthStore()
  const { setConnectionStatus, clearMessages } = useChatStore()
  const { disconnect } = useSocket()

  // 处理登录成功
  const handleLoginSuccess = () => {
    console.log('📱 handleLoginSuccess called, user authenticated!')
    // 不需要手动设置连接状态，由socket service管理
    // setConnectionStatus(ConnectionStatus.CONNECTED)
  }

  // 处理登出
  const handleLogout = () => {
    disconnect()
    authLogout()
    clearMessages()
    setConnectionStatus(ConnectionStatus.DISCONNECTED)
    setAppMode('demo')
  }

  // 切换到聊天模式
  const switchToChatMode = () => {
    setAppMode('chat')
  }

  // 根据认证状态和模式渲染不同界面
  if (appMode === 'chat') {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />
    }
    return <ChatPage onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-primary theme-transition">
      {/* Header */}
      <header className="bg-secondary border-b border-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">IM Chat Client</h1>
            <Badge variant="success">演示模式</Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-secondary">
              当前主题: {theme === 'system' ? '系统' : isDark ? '深色' : '浅色'}
            </span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={toggleTheme}
              >
                {isDark ? '🌞' : '🌙'} 切换主题
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={switchToChatMode}
              >
                🚀 启动聊天
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Welcome Section */}
          <div className="bg-secondary rounded-xl p-6 border border-primary">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              🎉 Electron + React IM客户端
            </h2>
            <p className="text-secondary mb-6">
              基于 Electron + React + TypeScript + Tailwind CSS 构建的现代化桌面IM应用
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-tertiary rounded-lg">
                <h3 className="font-medium text-primary mb-2">✅ 开发环境</h3>
                <p className="text-sm text-secondary">Vite + TypeScript + 热重载</p>
              </div>
              <div className="p-4 bg-tertiary rounded-lg">
                <h3 className="font-medium text-primary mb-2">🎨 设计系统</h3>
                <p className="text-sm text-secondary">Design Tokens + 主题切换</p>
              </div>
              <div className="p-4 bg-tertiary rounded-lg">
                <h3 className="font-medium text-primary mb-2">🧩 组件库</h3>
                <p className="text-sm text-secondary">基础UI组件 + 布局系统</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation and Content */}
          <div className="bg-secondary rounded-xl p-6 border border-primary">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-primary">功能演示</h3>
              <div className="flex bg-tertiary rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('components')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeTab === 'components' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  UI组件
                </button>
                <button
                  onClick={() => setActiveTab('state')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeTab === 'state' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  状态管理
                </button>
              </div>
            </div>

            {activeTab === 'components' ? (
              <div>
                <h4 className="font-medium text-primary mb-4">UI组件演示</h4>
                <div className="space-y-6">
                  {/* Buttons */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">按钮组件</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">主要按钮</Button>
                      <Button variant="secondary">次要按钮</Button>
                      <Button variant="text">文字按钮</Button>
                      <Button variant="danger">危险按钮</Button>
                      <Button variant="primary" size="sm">小按钮</Button>
                      <Button variant="primary" loading>加载中</Button>
                    </div>
                  </div>

                  {/* Input */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">输入框组件</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <Input 
                        label="用户名"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <Input 
                        label="密码"
                        type="password"
                        placeholder="请输入密码"
                      />
                    </div>
                  </div>

                  {/* Avatars */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">头像组件</h4>
                    <div className="flex items-center space-x-4">
                      <Avatar name="张三" size="sm" status="online" showStatus />
                      <Avatar name="李四" size="md" status="away" showStatus />
                      <Avatar name="王五" size="lg" status="busy" showStatus />
                      <Avatar name="赵六" size="xl" status="offline" showStatus />
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">徽章组件</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>默认</Badge>
                      <Badge variant="success">成功</Badge>
                      <Badge variant="warning">警告</Badge>
                      <Badge variant="error">错误</Badge>
                      <Badge variant="info">信息</Badge>
                      <Badge dot variant="success" />
                      <span className="text-secondary">在线状态</span>
                    </div>
                  </div>

                  {/* Modal Demo */}
                  <div>
                    <h4 className="font-medium text-primary mb-3">模态框组件</h4>
                    <Button onClick={() => setShowModal(true)}>
                      打开模态框
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <StateDemo />
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-secondary rounded-xl p-6 border border-primary">
            <h3 className="text-lg font-semibold text-primary mb-4">开发进度</h3>
            <ul className="space-y-2 text-secondary">
              <li>✅ 开发环境和工程化 - 已完成</li>
              <li>✅ 设计系统和基础组件 - 已完成</li>
              <li>✅ 状态管理系统 (Zustand) - 已完成</li>
              <li>✅ 核心页面和组件实现 - 已完成</li>
              <li>🔄 WebSocket 连接和实时通信 - 下一步</li>
              <li>📁 文件传输和高级功能 - 计划中</li>
            </ul>
            
            <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h4 className="font-medium text-primary mb-2">🎯 当前状态</h4>
              <p className="text-sm text-secondary mb-3">
                核心聊天界面已完成，包含完整的用户界面和状态管理。
              </p>
              <Button
                variant="primary"
                onClick={switchToChatMode}
                className="w-full"
              >
                🚀 体验聊天界面
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="演示模态框"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            这是一个演示模态框，展示了我们的设计系统和组件库。
          </p>
          <div className="flex items-center space-x-3">
            <Avatar name="演示用户" size="md" status="online" showStatus />
            <div>
              <p className="font-medium text-primary">演示用户</p>
              <p className="text-sm text-secondary">在线</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={() => setShowModal(false)}>
              确定
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default App