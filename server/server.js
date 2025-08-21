const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// 安全相关中间件
app.use(cors())
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// 健康检查端点
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IM Chat Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// 在线用户列表
const onlineUsers = new Map()

// Socket.io事件处理
io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id)

  // 用户加入
  socket.on('user:join', (data) => {
    console.log('👤 User join request:', data)
    
    const user = {
      id: Math.random().toString(36).substr(2, 16),
      name: data.username,
      username: data.username,
      status: 'online',
      isOnline: true,
      avatar: undefined,
      lastSeen: new Date()
    }

    // 保存用户信息
    onlineUsers.set(socket.id, user)

    // 发送认证成功响应
    socket.emit('user:joined', {
      user,
      onlineUsers: Array.from(onlineUsers.values()),
      serverInfo: {
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    })

    // 广播新用户加入
    socket.broadcast.emit('user:new', {
      user,
      onlineUsers: Array.from(onlineUsers.values())
    })

    console.log('✅ User joined successfully:', user.name)
  })

  // 用户断开连接
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id)
    if (user) {
      console.log('👋 User disconnected:', user.name)
      onlineUsers.delete(socket.id)
      io.emit('user:left', {
        userId: user.id,
        onlineUsers: Array.from(onlineUsers.values())
      })
    }
  })

  // 发送消息
  socket.on('message:send', (data) => {
    const user = onlineUsers.get(socket.id)
    if (!user) {
      socket.emit('message:error', {
        error: 'Not authenticated',
        messageId: data.tempId
      })
      return
    }

    const message = {
      id: Math.random().toString(36).substr(2, 16),
      content: data.content,
      sender: user,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    }

    console.log('📨 New message:', {
      from: user.name,
      content: data.content
    })

    // 发送给所有客户端
    io.emit('message:received', message)
  })

  // 正在输入状态
  socket.on('typing:start', () => {
    const user = onlineUsers.get(socket.id)
    if (user) {
      socket.broadcast.emit('user:typing', {
        userId: user.id,
        username: user.name
      })
    }
  })

  socket.on('typing:stop', () => {
    const user = onlineUsers.get(socket.id)
    if (user) {
      socket.broadcast.emit('user:typing:stop', {
        userId: user.id,
        username: user.name
      })
    }
  })
})

// 启动服务器
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 WebSocket server ready`)
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`)
})
