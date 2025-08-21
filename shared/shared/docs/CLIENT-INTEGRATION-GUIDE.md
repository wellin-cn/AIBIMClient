# 客户端集成指南

## 服务器信息

### 基本配置
- **服务器地址**: `http://localhost:3001`
- **WebSocket地址**: `ws://localhost:3001` 或 `http://localhost:3001`
- **支持的协议**: HTTP/HTTPS, WebSocket, Socket.io
- **CORS配置**: 允许 `http://localhost:3000` 的请求

### 重要说明
如果客户端运行在不同端口（非3000），需要通知服务器端修改CORS配置。

## Socket.io 连接配置

### 基本连接
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 60000,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### 连接事件处理
```javascript
// 连接成功
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

// 连接断开
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// 连接错误
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// 重连
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});
```

## 用户加入聊天

### 发送用户加入请求
```javascript
socket.emit('user:join', {
  username: 'your_username'
});
```

### 监听加入成功响应
```javascript
socket.on('user:joined', (data) => {
  console.log('Join successful:', data);
  // data 包含:
  // {
  //   user: {
  //     id: string,
  //     username: string,
  //     socketId: string,
  //     joinedAt: number,
  //     status: 'online',
  //     ipAddress: string
  //   },
  //   onlineUsers: Array,
  //   serverInfo: {
  //     version: string,
  //     maxUsers: number,
  //     currentUsers: number
  //   }
  // }
});
```

## 消息发送与接收

### 发送消息
```javascript
const tempId = Date.now().toString(); // 临时ID用于追踪

socket.emit('message:send', {
  content: 'Hello, world!',
  tempId: tempId
});
```

### 监听发送确认
```javascript
socket.on('message:sent', (data) => {
  console.log('Message sent successfully:', data);
  // data 包含:
  // {
  //   tempId: string,
  //   messageId: string,
  //   timestamp: number,
  //   status: 'success'
  // }
});
```

### 监听接收消息
```javascript
socket.on('message:received', (message) => {
  console.log('New message:', message);
  // message 包含:
  // {
  //   id: string,
  //   type: 'text' | 'file' | 'system',
  //   content: string,
  //   sender: {
  //     id: string,
  //     username: string
  //   },
  //   timestamp: number
  // }
});
```

## 心跳机制

### 发送心跳
```javascript
setInterval(() => {
  socket.emit('ping');
}, 25000); // 每25秒发送一次
```

### 监听心跳响应
```javascript
socket.on('pong', () => {
  console.log('Heartbeat received');
});
```

## 文件上传功能

### HTTP文件上传
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('http://localhost:3001/api/files/upload', {
      method: 'POST',
      body: formData,
      // 注意：不要设置 Content-Type header，让浏览器自动设置
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};
```

### Socket.io 文件传输
```javascript
// 发送文件开始传输
socket.emit('file:upload:start', {
  fileName: 'example.pdf',
  fileSize: 1024000,
  mimeType: 'application/pdf'
});

// 监听传输准备就绪
socket.on('file:upload:ready', (data) => {
  // 开始发送文件块
  const chunkSize = 64 * 1024; // 64KB chunks
  // ... 实现文件分块传输
});

// 发送文件块
socket.emit('file:upload:chunk', {
  uploadId: 'upload_id',
  chunkIndex: 0,
  chunk: arrayBuffer,
  isLast: false
});

// 监听上传完成
socket.on('file:upload:complete', (data) => {
  console.log('File upload completed:', data);
});
```

## REST API 接口

### 健康检查
```javascript
fetch('http://localhost:3001/')
  .then(response => response.json())
  .then(data => console.log(data));
// 返回: { message: 'Server is running', version: '1.0.0' }
```

### 获取历史消息
```javascript
const getMessages = async (limit = 50, before = null) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (before) params.append('before', before.toString());
  
  const response = await fetch(`http://localhost:3001/api/messages?${params}`);
  return await response.json();
};
```

### 获取最近消息
```javascript
const getRecentMessages = async (limit = 50) => {
  const response = await fetch(`http://localhost:3001/api/messages/recent?limit=${limit}`);
  return await response.json();
};
```

### 获取消息统计
```javascript
const getMessageStats = async () => {
  const response = await fetch('http://localhost:3001/api/messages/stats');
  return await response.json();
};
```

## 错误处理

### Socket.io 错误
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // 处理服务器返回的错误
});
```

### HTTP 错误处理
```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API call failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

## 完整示例

### React Hook 示例
```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      setConnected(true);
      setSocket(newSocket);
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
    });
    
    newSocket.on('user:joined', (data) => {
      setUser(data.user);
    });
    
    newSocket.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    return () => {
      newSocket.close();
    };
  }, []);

  const joinChat = (username) => {
    if (socket) {
      socket.emit('user:join', { username });
    }
  };

  const sendMessage = (content) => {
    if (socket && user) {
      const tempId = Date.now().toString();
      socket.emit('message:send', { content, tempId });
    }
  };

  return {
    connected,
    user,
    messages,
    joinChat,
    sendMessage
  };
};

export default useChat;
```

## 注意事项

1. **CORS配置**: 确保客户端运行的端口与服务器CORS配置匹配
2. **心跳机制**: 建议实现心跳保持连接活跃
3. **重连机制**: 处理网络断开时的自动重连
4. **错误处理**: 妥善处理各种错误情况
5. **文件上传**: 大文件建议使用分块上传
6. **消息去重**: 使用tempId追踪消息状态，避免重复显示

## 故障排除

### 连接问题
- 检查服务器是否运行在 `http://localhost:3001`
- 确认CORS配置是否正确
- 查看浏览器控制台的错误信息

### Socket.io 问题
- 确保使用正确的Socket.io客户端版本
- 检查传输方式配置
- 验证事件名称是否正确

### 文件上传问题
- 检查文件大小限制（当前限制50MB）
- 确认文件类型是否被允许
- 查看服务器日志获取详细错误信息

## 联系支持
如有问题，请联系服务器端开发团队，并提供：
- 客户端运行端口
- 具体错误信息
- 浏览器控制台日志
- 网络请求详情

