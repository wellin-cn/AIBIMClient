import { useState } from 'react'
import { Avatar, Badge, Button, Input } from '@components/ui'
import { useChatStore, useAuthStore } from '../../store'
import { User } from '../../types'

interface UserListProps {
  onUserSelect?: (user: User) => void
  selectedUserId?: string
}

export const UserList: React.FC<UserListProps> = ({
  onUserSelect,
  selectedUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showOfflineUsers, setShowOfflineUsers] = useState(false)
  
  const { users, onlineUsers, isTyping } = useChatStore()
  const { currentUser } = useAuthStore()

  // 过滤用户列表（防止users为undefined）
  const filteredUsers = (users || []).filter(user => {
    // 排除当前用户
    if (user.id === currentUser?.id) return false
    
    // 搜索过滤
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // 在线状态过滤
    if (!showOfflineUsers && !onlineUsers.has(user.id)) {
      return false
    }
    
    return true
  })

  // 按在线状态排序
  const sortedUsers = filteredUsers.sort((a, b) => {
    const aOnline = onlineUsers.has(a.id)
    const bOnline = onlineUsers.has(b.id)
    
    if (aOnline === bOnline) {
      return a.name.localeCompare(b.name)
    }
    
    return bOnline ? 1 : -1
  })

  const onlineCount = users.filter(user => 
    user.id !== currentUser?.id && onlineUsers.has(user.id)
  ).length

  const totalCount = users.filter(user => user.id !== currentUser?.id).length

  return (
    <div className="h-full flex flex-col bg-secondary">
      {/* 用户列表头部 */}
      <div className="flex-shrink-0 p-4 border-b border-tertiary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary">用户列表</h3>
          <Badge variant="info" size="sm">
            {onlineCount}/{totalCount}
          </Badge>
        </div>
        
        {/* 搜索框 */}
        <Input
          placeholder="搜索用户..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm"
        />
        
        {/* 显示选项 */}
        <div className="mt-3 flex items-center space-x-2">
          <label className="flex items-center space-x-1 text-xs text-secondary">
            <input
              type="checkbox"
              checked={showOfflineUsers}
              onChange={(e) => setShowOfflineUsers(e.target.checked)}
              className="rounded"
            />
            <span>显示离线用户</span>
          </label>
        </div>
      </div>

      {/* 用户列表内容 - 独立滚动区域 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {sortedUsers.length === 0 ? (
          <div className="p-4 text-center text-secondary">
            <p className="text-sm">
              {searchTerm ? '没有找到匹配的用户' : '暂无其他用户在线'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedUsers.map((user) => {
              const isOnline = onlineUsers.has(user.id)
              const isSelected = selectedUserId === user.id
              const userIsTyping = isTyping[user.id]
              
              return (
                <button
                  key={user.id}
                  onClick={() => onUserSelect?.(user)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-primary-100 border border-primary-300'
                      : 'hover:bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={user.name}
                      size="md"
                      status={isOnline ? 'online' : 'offline'}
                      showStatus
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`font-medium truncate ${
                          isOnline ? 'text-primary' : 'text-secondary'
                        }`}>
                          {user.name}
                        </p>
                        
                        {userIsTyping && (
                          <Badge size="sm" variant="info">正在输入</Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-tertiary">
                        {isOnline ? '在线' : `最后在线: ${
                          user.lastSeen 
                            ? new Date(user.lastSeen).toLocaleString()
                            : '未知'
                        }`}
                      </p>
                    </div>
                    
                    {/* 新消息提示 */}
                    {/* 这里可以添加未读消息数量的显示 */}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 用户列表底部 */}
      <div className="flex-shrink-0 p-4 border-t border-tertiary">
        <div className="space-y-2">
          {/* 当前用户信息 */}
          {currentUser && (
            <div className="flex items-center space-x-3 p-2 bg-tertiary rounded-lg">
              <Avatar
                name={currentUser.name}
                size="sm"
                status="online"
                showStatus
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  {currentUser.name} (你)
                </p>
                <p className="text-xs text-secondary">在线</p>
              </div>
            </div>
          )}
          
          {/* 快速操作 */}
          <div className="flex space-x-2">
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                // 这里可以添加刷新用户列表的逻辑
              }}
              className="flex-1"
            >
              🔄 刷新
            </Button>
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                // 这里可以添加邀请用户的逻辑
              }}
              className="flex-1"
            >
              ➕ 邀请
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}