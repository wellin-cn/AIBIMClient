import { io, Socket } from 'socket.io-client'
import { ConnectionStatus, Message, User, MessageStatus } from '../types'
import { testSocketConnection, logSocketEvents } from '../utils/socketDebug'

export interface SocketEvents {
  // 连接事件
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  
  // 认证事件
  auth_success: (data: { user: User; users: User[] }) => void
  auth_error: (error: string) => void
  
  // 消息事件
  message: (message: Message) => void
  message_status: (data: { messageId: string; status: MessageStatus }) => void
  
  // 用户事件 - 更新为新API规范
  'user:joined': (data: { user: User; onlineUsers: User[]; serverInfo?: any }) => void
  'user:new-member-joined': (data: { newMember: User; onlineUsers: User[] }) => void
  'user:left': (data: { user: User; onlineUsers: User[] }) => void
  user_status_changed: (data: { userId: string; isOnline: boolean }) => void
  
  // 输入状态事件
  typing_start: (data: { userId: string; userName: string }) => void
  typing_stop: (data: { userId: string }) => void
  
  // 系统事件
  system_message: (message: string) => void
}

export class SocketService {
  private socket: Socket | null = null
  private connectionListeners: Array<(status: ConnectionStatus) => void> = []
  private messageListeners: Array<(message: Message) => void> = []
  private userListeners: Array<(users: User[]) => void> = []
  private typingListeners: Array<(userId: string, isTyping: boolean) => void> = []
  private systemMessageListeners: Array<(message: string) => void> = []
  private authListeners: Array<(user: User | null, error?: string) => void> = []
  private newMemberListeners: Array<(newMember: User, allUsers: User[]) => void> = []
  
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  
  constructor() {
    this.setupEventListeners()
  }

  // 连接到服务器
  connect(serverUrl: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Attempting to connect to:', serverUrl)
        console.log('👤 Username:', username)
        
        // 测试连接前的准备工作
        testSocketConnection(serverUrl).then(isReachable => {
          if (!isReachable) {
            console.warn('⚠️ Server might not be reachable, but continuing with connection attempt...')
          }
        })
        
        this.disconnect() // 确保没有旧连接
        
        this.socket = io(serverUrl, {
          auth: {
            username: username.trim(),
          },
          transports: ['polling', 'websocket'], // 先尝试polling，再升级到websocket
          timeout: 20000,
          forceNew: true,
          autoConnect: true,
          upgrade: true,
        })

        this.setupSocketEventListeners()
        
        // 添加调试事件监听
        logSocketEvents(this.socket)
        
        // 连接成功
        this.socket.on('connect', () => {
          console.log('🟢 Socket connected successfully!')
          console.log('Socket ID:', this.socket?.id)
          console.log('Transport:', this.socket?.io.engine.transport.name)
          this.reconnectAttempts = 0
          
          // 发送用户加入事件（这是服务端期望的协议）
          const joinData = {
            username: username.trim(),
            timestamp: new Date().toISOString()
          }
          
          console.log('📤 Sending user:join event:', joinData)
          this.socket?.emit('user:join', joinData)
          
          this.notifyConnectionListeners(ConnectionStatus.CONNECTED)
          resolve()
        })

        // 连接错误
        this.socket.on('connect_error', (error: any) => {
          console.error('🔴 Socket connection error:', error)
          console.error('Error details:', {
            message: error.message,
            description: error.description || 'No description',
            context: error.context || 'Unknown context',
            type: error.type || 'Unknown type',
            stack: error.stack
          })
          this.notifyConnectionListeners(ConnectionStatus.DISCONNECTED)
          reject(error)
        })

        // 用户加入成功（根据新API规范，仅用于自身登录确认）
        this.socket.on('user:joined', (data: any) => {
          console.log('🎉 Self login successful (user:joined):', data)
          
          // 规范化服务器返回的用户对象，确保符合客户端类型
          const normalizedUser = {
            id: data.user?.id || Date.now().toString(),
            name: data.user?.name || data.user?.username || username.trim(),
            username: data.user?.username || username.trim(), 
            status: data.user?.status || 'online',
            isOnline: data.user?.isOnline ?? true,
            avatar: data.user?.avatar || undefined,
            lastSeen: data.user?.lastSeen ? new Date(data.user.lastSeen) : new Date()
          }
          
          console.log('📝 Normalized current user object:', normalizedUser)
          this.notifyAuthListeners(normalizedUser)
          
          // 更新初始在线用户列表
          if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
            const normalizedUsers = data.onlineUsers.map((user: any) => ({
              id: user.id || Date.now().toString(),
              name: user.name || user.username || 'Unknown User',
              username: user.username || user.name || 'unknown',
              status: user.status || 'online',
              isOnline: user.isOnline ?? true,
              avatar: user.avatar || undefined,
              lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date()
            }))
            
            console.log('👥 Initial online users list:', normalizedUsers)
            this.notifyUserListeners(normalizedUsers)
          }
          
          // 显示服务器信息（如果有）
          if (data.serverInfo) {
            console.log('🖥️ Server info:', data.serverInfo)
          }
        })

        // 用户加入失败
        this.socket.on('user:join:error', (data: any) => {
          console.error('❌ User join failed:', data)
          this.notifyAuthListeners(null, data.error || 'Failed to join')
          reject(new Error(data.error || 'Failed to join'))
        })

        // 兼容旧的认证事件（如果服务端还在使用）
        this.socket.on('auth_success', (data) => {
          console.log('Authentication successful (legacy):', data.user)
          this.notifyAuthListeners(data.user)
        })

        this.socket.on('auth_error', (error) => {
          console.error('Authentication failed (legacy):', error)
          this.notifyAuthListeners(null, error)
          reject(new Error(error))
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.notifyConnectionListeners(ConnectionStatus.DISCONNECTED)
  }

  // 发送消息
  sendMessage(content: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      console.log('🔗 [SocketService] sendMessage called:', {
        content,
        contentLength: content.length,
        isConnected: this.socket?.connected,
        socketId: this.socket?.id,
        transportType: this.socket?.io?.engine?.transport?.name,
        timestamp: new Date().toISOString()
      })

      if (!this.socket?.connected) {
        console.error('❌ [SocketService] Socket not connected:', {
          hasSocket: !!this.socket,
          connected: this.socket?.connected,
          socketId: this.socket?.id,
          readyState: this.socket?.io?.engine?.readyState
        })
        reject(new Error('Socket not connected'))
        return
      }

      const messageData = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      console.log('📤 [SocketService] Emitting send_message event:', {
        messageData,
        socketId: this.socket.id,
        transport: this.socket.io?.engine?.transport?.name
      })

      // 设置超时处理
      const timeout = setTimeout(() => {
        console.error('⏰ [SocketService] Message send timeout after 10 seconds')
        reject(new Error('Message send timeout'))
      }, 10000)

      this.socket.emit('send_message', messageData, (response: any) => {
        clearTimeout(timeout)
        
        console.log('📨 [SocketService] Received response from server:', {
          response,
          hasSuccess: response?.success !== undefined,
          hasMessage: !!response?.message,
          hasError: !!response?.error,
          timestamp: new Date().toISOString()
        })

        if (response && response.success) {
          console.log('✅ [SocketService] Message sent successfully:', {
            messageId: response.message?.id,
            serverTimestamp: response.message?.timestamp
          })
          resolve(response.message)
        } else {
          const errorMessage = response?.error || 'Failed to send message'
          console.error('❌ [SocketService] Server returned error:', {
            error: errorMessage,
            fullResponse: response,
            originalContent: content
          })
          reject(new Error(errorMessage))
        }
      })
    })
  }

  // 发送输入状态
  sendTypingStatus(isTyping: boolean): void {
    if (!this.socket?.connected) return

    if (isTyping) {
      this.socket.emit('typing_start')
    } else {
      this.socket.emit('typing_stop')
    }
  }

  // 获取在线用户列表
  getOnlineUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit('get_users', (response: any) => {
        if (response.success) {
          resolve(response.users)
        } else {
          reject(new Error(response.error || 'Failed to get users'))
        }
      })
    })
  }

  // 设置Socket事件监听器
  private setupSocketEventListeners(): void {
    if (!this.socket) return

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.notifyConnectionListeners(ConnectionStatus.DISCONNECTED)
      
      // 自动重连
      if (reason === 'io server disconnect') {
        // 服务器主动断开，不重连
        return
      }
      
      this.handleReconnect()
    })

    // 接收消息
    this.socket.on('message', (message: Message) => {
      console.log('📥 [SocketService] Received message event:', {
        messageId: message.id,
        content: message.content,
        senderName: message.sender?.name,
        senderId: message.sender?.id,
        timestamp: message.timestamp,
        type: message.type,
        status: message.status,
        fullMessage: message
      })
      this.notifyMessageListeners(message)
      console.log('📢 [SocketService] Notified message listeners')
    })

    // 消息状态更新
    this.socket.on('message_status', (data) => {
      console.log('Message status update:', data)
      // 这里可以更新消息状态
    })

      // 新成员加入通知 - 根据新API规范添加
  this.socket.on('user:new-member-joined', (data: any) => {
    console.log('🎉 New member joined:', data.newMember)
    console.log('📋 Updated user list:', data.onlineUsers)
    
    // 更新在线用户列表
    if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
      const normalizedUsers = data.onlineUsers.map((user: any) => ({
        id: user.id || Date.now().toString(),
        name: user.name || user.username || 'Unknown User',
        username: user.username || user.name || 'unknown',
        status: user.status || 'online',
        isOnline: user.isOnline ?? true,
        avatar: user.avatar || undefined,
        lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date()
      }))
      
      this.notifyUserListeners(normalizedUsers)
    }
    
    // 显示新成员加入通知
    const newMemberName = data.newMember?.username || data.newMember?.name || 'Unknown User'
    this.notifySystemMessageListeners(`${newMemberName} 加入了聊天室`)
    
    // 通知新成员加入监听器
    if (data.newMember) {
      const normalizedNewMember = {
        id: data.newMember.id || Date.now().toString(),
        name: data.newMember.name || data.newMember.username || 'Unknown User',
        username: data.newMember.username || data.newMember.name || 'unknown',
        status: data.newMember.status || 'online',
        isOnline: data.newMember.isOnline ?? true,
        avatar: data.newMember.avatar || undefined,
        lastSeen: data.newMember.lastSeen ? new Date(data.newMember.lastSeen) : new Date()
      }
      
      // 获取标准化的用户列表
      const allUsers = data.onlineUsers && Array.isArray(data.onlineUsers) ? 
        data.onlineUsers.map((user: any) => ({
          id: user.id || Date.now().toString(),
          name: user.name || user.username || 'Unknown User',
          username: user.username || user.name || 'unknown',
          status: user.status || 'online',
          isOnline: user.isOnline ?? true,
          avatar: user.avatar || undefined,
          lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date()
        })) : []
        
      this.notifyNewMemberListeners(normalizedNewMember, allUsers)
    }
  })

  // 用户离开事件 - 适配新API规范
  this.socket.on('user:left', (data: any) => {
    console.log('👋 User left:', data.user)
    
    // 更新在线用户列表
    if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
      const normalizedUsers = data.onlineUsers.map((user: any) => ({
        id: user.id || Date.now().toString(),
        name: user.name || user.username || 'Unknown User',
        username: user.username || user.name || 'unknown',
        status: user.status || 'online',
        isOnline: user.isOnline ?? true,
        avatar: user.avatar || undefined,
        lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date()
      }))
      
      this.notifyUserListeners(normalizedUsers)
    }
    
    // 显示用户离开通知
    const leftUserName = data.user?.username || data.user?.name || 'Unknown User'
    this.notifySystemMessageListeners(`${leftUserName} 离开了聊天室`)
  })

  // 保留旧事件兼容性
  this.socket.on('user_joined', (user: User) => {
    console.log('Legacy user_joined event (deprecated):', user)
  })

    // 用户状态变化
    this.socket.on('user_status_changed', (data) => {
      console.log('User status changed:', data)
    })

    // 保留旧的user_left事件兼容性
    this.socket.on('user_left', (user: User) => {
      console.log('Legacy user_left event (deprecated):', user)
    })

    // 输入状态开始
    this.socket.on('typing_start', (data) => {
      console.log('User started typing:', data)
      this.notifyTypingListeners(data.userId, true)
    })

    // 输入状态结束
    this.socket.on('typing_stop', (data) => {
      console.log('User stopped typing:', data)
      this.notifyTypingListeners(data.userId, false)
    })

    // 系统消息
    this.socket.on('system_message', (message: string) => {
      console.log('System message:', message)
      this.notifySystemMessageListeners(message)
    })

    // 用户列表更新
    this.socket.on('users_update', (users: User[]) => {
      console.log('Users update:', users)
      this.notifyUserListeners(users)
    })
  }

  // 处理重连
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached')
      this.notifyConnectionListeners(ConnectionStatus.DISCONNECTED)
      return
    }

    this.reconnectAttempts++
    this.notifyConnectionListeners(ConnectionStatus.RECONNECTING)

    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
        this.socket.connect()
      }
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  // 事件监听器管理
  private setupEventListeners(): void {
    // 清理现有监听器
    this.connectionListeners = []
    this.messageListeners = []
    this.userListeners = []
    this.typingListeners = []
    this.systemMessageListeners = []
    this.authListeners = []
    this.newMemberListeners = []
  }

  // 添加连接状态监听器
  onConnectionChange(listener: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.push(listener)
    return () => {
      const index = this.connectionListeners.indexOf(listener)
      if (index > -1) {
        this.connectionListeners.splice(index, 1)
      }
    }
  }

  // 添加消息监听器
  onMessage(listener: (message: Message) => void): () => void {
    this.messageListeners.push(listener)
    return () => {
      const index = this.messageListeners.indexOf(listener)
      if (index > -1) {
        this.messageListeners.splice(index, 1)
      }
    }
  }

  // 添加用户列表监听器
  onUsersUpdate(listener: (users: User[]) => void): () => void {
    this.userListeners.push(listener)
    return () => {
      const index = this.userListeners.indexOf(listener)
      if (index > -1) {
        this.userListeners.splice(index, 1)
      }
    }
  }

  // 添加输入状态监听器
  onTypingChange(listener: (userId: string, isTyping: boolean) => void): () => void {
    this.typingListeners.push(listener)
    return () => {
      const index = this.typingListeners.indexOf(listener)
      if (index > -1) {
        this.typingListeners.splice(index, 1)
      }
    }
  }

  // 添加系统消息监听器
  onSystemMessage(listener: (message: string) => void): () => void {
    this.systemMessageListeners.push(listener)
    return () => {
      const index = this.systemMessageListeners.indexOf(listener)
      if (index > -1) {
        this.systemMessageListeners.splice(index, 1)
      }
    }
  }

  // 添加认证监听器
  onAuth(listener: (user: User | null, error?: string) => void): () => void {
    this.authListeners.push(listener)
    return () => {
      const index = this.authListeners.indexOf(listener)
      if (index > -1) {
        this.authListeners.splice(index, 1)
      }
    }
  }

  // 添加新成员加入监听器
  onNewMemberJoined(listener: (newMember: User, allUsers: User[]) => void): () => void {
    this.newMemberListeners.push(listener)
    return () => {
      const index = this.newMemberListeners.indexOf(listener)
      if (index > -1) {
        this.newMemberListeners.splice(index, 1)
      }
    }
  }

  // 通知连接状态监听器
  private notifyConnectionListeners(status: ConnectionStatus): void {
    this.connectionListeners.forEach(listener => listener(status))
  }

  // 通知消息监听器
  private notifyMessageListeners(message: Message): void {
    this.messageListeners.forEach(listener => listener(message))
  }

  // 通知用户列表监听器
  private notifyUserListeners(users: User[]): void {
    this.userListeners.forEach(listener => listener(users))
  }

  // 通知输入状态监听器
  private notifyTypingListeners(userId: string, isTyping: boolean): void {
    this.typingListeners.forEach(listener => listener(userId, isTyping))
  }

  // 通知系统消息监听器
  private notifySystemMessageListeners(message: string): void {
    this.systemMessageListeners.forEach(listener => listener(message))
  }

  // 通知认证监听器
  private notifyAuthListeners(user: User | null, error?: string): void {
    this.authListeners.forEach(listener => listener(user, error))
  }

  // 通知新成员加入监听器
  private notifyNewMemberListeners(newMember: User, allUsers: User[]): void {
    this.newMemberListeners.forEach(listener => listener(newMember, allUsers))
  }

  // 获取连接状态
  get isConnected(): boolean {
    return this.socket?.connected || false
  }

  // 获取Socket ID
  get socketId(): string | undefined {
    return this.socket?.id
  }

  // 诊断函数 - 用于调试
  diagnose(): any {
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      connection: {
        isConnected: this.isConnected,
        socketId: this.socketId,
        hasSocket: !!this.socket,
        connected: this.socket?.connected,
        transport: this.socket?.io?.engine?.transport?.name,
        readyState: this.socket?.io?.engine?.readyState,
        ping: (this.socket?.io?.engine as any)?.ping,
        url: (this.socket?.io as any)?.uri
      },
      listeners: {
        connectionListeners: this.connectionListeners.length,
        messageListeners: this.messageListeners.length,
        userListeners: this.userListeners.length,
        typingListeners: this.typingListeners.length,
        systemMessageListeners: this.systemMessageListeners.length,
        authListeners: this.authListeners.length,
        newMemberListeners: this.newMemberListeners.length
      },
      reconnection: {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        delay: this.reconnectDelay
      }
    }

    console.log('🔍 [SocketService] Full Diagnostic Report:', diagnosticInfo)
    
    // 也在全局对象上暴露，方便在控制台访问
    if (typeof window !== 'undefined') {
      (window as any).socketDiagnostic = diagnosticInfo
      console.log('💡 Diagnostic info saved to window.socketDiagnostic')
    }
    
    return diagnosticInfo
  }
}

// 导出单例实例
export const socketService = new SocketService()

// 在开发环境中将 socketService 暴露到全局，方便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).socketService = socketService
  console.log('🛠️ [SocketService] Service exposed to window.socketService for debugging')
  console.log('💡 Try: window.socketService.diagnose() to see diagnostic info')
}