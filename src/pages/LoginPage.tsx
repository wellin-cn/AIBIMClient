import { useState, useEffect } from 'react'
import { Button, Input, Avatar, Badge } from '@components/ui'
import { useAuthStore } from '../store'
import { useSocket } from '../hooks/useSocket'

interface LoginPageProps {
  onLoginSuccess: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    serverUrl: '',
  })
  const [errors, setErrors] = useState({
    username: '',
    serverUrl: '',
  })

  const {
    username: storedUsername,
    serverUrl: storedServerUrl,
    autoConnect,
    isLoggingIn,
    loginError,
    login,
    setUsername,
    setServerUrl,
    setAutoConnect,
    clearLoginError,
    currentUser,
    isAuthenticated,
  } = useAuthStore()

  // 初始化表单数据
  useEffect(() => {
    setFormData({
      username: storedUsername || '',
      serverUrl: storedServerUrl || 'http://localhost:3001',
    })
  }, [storedUsername, storedServerUrl])

  // 登录成功后跳转 - 添加日志和防抖
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('🎉 Login successful, calling onLoginSuccess callback...')
      // 延迟调用，避免立即重新渲染导致组件卸载
      setTimeout(() => {
        onLoginSuccess()
      }, 100)
    }
  }, [isAuthenticated, currentUser, onLoginSuccess])

  // 清除登录错误
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => {
        clearLoginError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [loginError, clearLoginError])

  const validateForm = () => {
    const newErrors = {
      username: '',
      serverUrl: '',
    }

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.trim().length < 2) {
      newErrors.username = '用户名至少需要2个字符'
    } else if (formData.username.trim().length > 20) {
      newErrors.username = '用户名不能超过20个字符'
    }

    if (!formData.serverUrl.trim()) {
      newErrors.serverUrl = '请输入服务器地址'
    } else if (!formData.serverUrl.startsWith('http://') && !formData.serverUrl.startsWith('https://')) {
      newErrors.serverUrl = '服务器地址必须以 http:// 或 https:// 开头'
    }

    setErrors(newErrors)
    return !newErrors.username && !newErrors.serverUrl
  }

  const handleInputChange = (field: 'username' | 'serverUrl') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 实时更新存储的值
    if (field === 'username') {
      setUsername(value)
    } else if (field === 'serverUrl') {
      setServerUrl(value)
    }

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // 清除登录错误
    if (loginError) {
      clearLoginError()
    }
  }

  const { connect } = useSocket()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // 调用登录action（更新store状态）
      login(formData.username.trim(), formData.serverUrl.trim())
      
      // 实际连接到WebSocket服务器
      await connect(formData.serverUrl.trim(), formData.username.trim())
      
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleQuickLogin = (username: string) => {
    setFormData(prev => ({ ...prev, username }))
    setUsername(username)
    clearLoginError()
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">IM Chat Client</h1>
          <p className="text-secondary">连接到聊天服务器开始对话</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-secondary rounded-xl p-6 border border-primary shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入 */}
            <div>
              <Input
                label="用户名"
                placeholder="请输入您的用户名"
                value={formData.username}
                onChange={handleInputChange('username')}
                error={errors.username}
                disabled={isLoggingIn}
                className="w-full"
              />
            </div>

            {/* 服务器地址 */}
            <div>
              <Input
                label="服务器地址"
                placeholder="http://localhost:3001"
                value={formData.serverUrl}
                onChange={handleInputChange('serverUrl')}
                error={errors.serverUrl}
                disabled={isLoggingIn}
                className="w-full"
              />
            </div>

            {/* 自动连接选项 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoConnect"
                checked={autoConnect}
                onChange={(e) => setAutoConnect(e.target.checked)}
                disabled={isLoggingIn}
                className="rounded"
              />
              <label htmlFor="autoConnect" className="text-sm text-primary">
                记住登录状态，下次自动连接
              </label>
            </div>

            {/* 登录错误显示 */}
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <span className="text-sm">⚠️ {loginError}</span>
                </div>
              </div>
            )}

            {/* 登录按钮 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoggingIn}
              disabled={!formData.username.trim() || !formData.serverUrl.trim()}
              className="w-full"
            >
              {isLoggingIn ? '连接中...' : '连接到服务器'}
            </Button>
          </form>

          {/* 快速登录选项 */}
          <div className="mt-6 pt-6 border-t border-tertiary">
            <p className="text-sm text-secondary mb-3">快速登录：</p>
            <div className="grid grid-cols-2 gap-2">
              {['演示用户', '测试用户', 'Alice', 'Bob'].map((name) => (
                <button
                  key={name}
                  onClick={() => handleQuickLogin(name)}
                  disabled={isLoggingIn}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-tertiary hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Avatar name={name} size="sm" />
                  <span className="text-sm text-primary">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 连接状态显示 */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Badge 
              variant={isLoggingIn ? 'warning' : 'info'}
              dot={isLoggingIn}
            >
              {isLoggingIn ? '连接中' : '离线'}
            </Badge>
            <span className="text-xs text-secondary">
              {isLoggingIn ? '正在连接到服务器...' : '准备连接'}
            </span>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-xs text-tertiary">
          <p>基于 Electron + React 构建</p>
          <p className="mt-1">支持实时通信和文件传输</p>
          <p className="mt-2 text-blue-600">
            💡 按F12打开开发者工具查看连接日志
          </p>
        </div>
      </div>
    </div>
  )
}