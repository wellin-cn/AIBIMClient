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
  
  // 用户事件
  user_joined: (user: User) => void
  user_left: (user: User) => void
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

        // 用户加入成功（这是服务端的实际响应事件）
        this.socket.on('user:joined', (data: any) => {
          console.log('🎉 User joined successfully:', data)
          
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
          
          console.log('📝 Normalized user object:', normalizedUser)
          this.notifyAuthListeners(normalizedUser)
          
          // 更新在线用户列表，规范化每个用户对象
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
            
            console.log('👥 Normalized online users:', normalizedUsers)
            this.notifyUserListeners(normalizedUsers)
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
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      const messageData = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      this.socket.emit('send_message', messageData, (response: any) => {
        if (response.success) {
          resolve(response.message)
        } else {
          reject(new Error(response.error || 'Failed to send message'))
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
      console.log('Received message:', message)
      this.notifyMessageListeners(message)
    })

    // 消息状态更新
    this.socket.on('message_status', (data) => {
      console.log('Message status update:', data)
      // 这里可以更新消息状态
    })

    // 用户加入
    this.socket.on('user_joined', (user: User) => {
      console.log('User joined:', user)
      this.notifySystemMessageListeners(`${user.name} 加入了聊天`)
    })

    // 用户离开
    this.socket.on('user_left', (user: User) => {
      console.log('User left:', user)
      this.notifySystemMessageListeners(`${user.name} 离开了聊天`)
    })

    // 用户状态变化
    this.socket.on('user_status_changed', (data) => {
      console.log('User status changed:', data)
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

  // 获取连接状态
  get isConnected(): boolean {
    return this.socket?.connected || false
  }

  // 获取Socket ID
  get socketId(): string | undefined {
    return this.socket?.id
  }
}

// 导出单例实例
export const socketService = new SocketService()