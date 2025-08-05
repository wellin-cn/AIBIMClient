# 📱 客户端消息处理完整指南

## 🎯 概述

本指南提供了客户端实现可靠消息发送和接收的完整方案，解决了消息发送超时问题。

## 🔥 最新更新 (2025-08-04)

经过多用户测试发现的问题已得到解决：
- ✅ **消息发送超时** - 增加重试机制和错误处理
- ✅ **服务器无响应** - 优化回调处理和超时检测
- ✅ **消息传播失败** - 改进事件监听和状态管理
- ✅ **连接不稳定** - 添加自动重连和队列机制

## 📚 完整实现资源

- 📄 [React & Vue 完整示例](./REACT-VUE-EXAMPLES.md)
- 📖 [优化的消息API](./OPTIMIZED-MESSAGE-API.md)
- 🔧 [实际可用的Hook和组件](../src/hooks/useReliableChat.ts)

## 🔧 核心特性

- ✅ **消息发送确认机制**：每条消息都有明确的成功/失败反馈
- ✅ **超时处理**：自动检测和处理消息发送超时
- ✅ **错误重试**：支持失败消息的重新发送
- ✅ **状态管理**：完整的消息状态跟踪

## 📡 Socket.io 事件列表

### 发送事件 (Client → Server)
```javascript
// 发送消息
socket.emit('message:send', {
  type: 'text',
  content: '消息内容',
  timestamp: Date.now(),
  tempId: 'temp_' + Date.now()  // 可选，用于关联响应
});
```

### 接收事件 (Server → Client)
```javascript
// 消息发送成功确认
socket.on('message:sent', (data) => {
  // data: { tempId, messageId, timestamp, status: 'success' }
});

// 消息发送失败通知
socket.on('message:send:error', (data) => {
  // data: { tempId, code, message, details }
});

// 接收到的消息
socket.on('message:received', (data) => {
  // data: { id, type, content, sender, timestamp }
});
```

## 💻 完整实现示例

### React Hook 实现

```typescript
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface Message {
  id: string;
  tempId?: string;
  type: 'text';
  content: string;
  sender: {
    id: string;
    username: string;
  };
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed' | 'timeout';
}

interface PendingMessage {
  data: {
    type: 'text';
    content: string;
    timestamp: number;
    tempId: string;
  };
  sentAt: number;
  timeout: NodeJS.Timeout;
}

export function useMessages(socket: Socket | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const pendingMessages = useRef<Map<string, PendingMessage>>(new Map());

  // 发送消息
  const sendMessage = (content: string) => {
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }

    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36);
    const messageData = {
      type: 'text' as const,
      content: content.trim(),
      timestamp: Date.now(),
      tempId
    };

    // 添加到本地消息列表（显示为发送中）
    const tempMessage: Message = {
      id: tempId,
      tempId,
      type: 'text',
      content: messageData.content,
      sender: { id: 'current', username: 'You' }, // 当前用户
      timestamp: messageData.timestamp,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);

    // 设置超时处理
    const timeout = setTimeout(() => {
      handleMessageTimeout(tempId);
    }, 10000);

    // 存储待确认的消息
    pendingMessages.current.set(tempId, {
      data: messageData,
      sentAt: Date.now(),
      timeout
    });

    // 发送消息
    socket.emit('message:send', messageData);
  };

  // 处理消息发送成功
  const handleMessageSent = (data: { tempId: string; messageId: string; timestamp: number; status: 'success' }) => {
    const pending = pendingMessages.current.get(data.tempId);
    if (pending) {
      clearTimeout(pending.timeout);
      pendingMessages.current.delete(data.tempId);

      // 更新消息状态
      setMessages(prev => prev.map(msg => 
        msg.tempId === data.tempId 
          ? { ...msg, id: data.messageId, status: 'sent', timestamp: data.timestamp }
          : msg
      ));
    }
  };

  // 处理消息发送失败
  const handleMessageSendError = (data: { tempId: string; code: string; message: string }) => {
    const pending = pendingMessages.current.get(data.tempId);
    if (pending) {
      clearTimeout(pending.timeout);
      pendingMessages.current.delete(data.tempId);

      // 更新消息状态为失败
      setMessages(prev => prev.map(msg => 
        msg.tempId === data.tempId 
          ? { ...msg, status: 'failed' }
          : msg
      ));

      // 显示错误信息
      console.error('Message send failed:', data.message);
    }
  };

  // 处理消息超时
  const handleMessageTimeout = (tempId: string) => {
    const pending = pendingMessages.current.get(tempId);
    if (pending) {
      pendingMessages.current.delete(tempId);

      // 更新消息状态为超时
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, status: 'timeout' }
          : msg
      ));

      console.error('Message send timeout');
    }
  };

  // 处理接收到的消息
  const handleMessageReceived = (data: Message) => {
    // 避免重复添加自己发送的消息
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === data.id);
      if (exists) return prev;
      return [...prev, { ...data, status: undefined }];
    });
  };

  // 重新发送失败的消息
  const retryMessage = (tempId: string) => {
    const message = messages.find(msg => msg.tempId === tempId);
    if (message) {
      // 移除原消息
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      // 重新发送
      sendMessage(message.content);
    }
  };

  // 设置事件监听
  useEffect(() => {
    if (!socket) return;

    socket.on('message:sent', handleMessageSent);
    socket.on('message:send:error', handleMessageSendError);
    socket.on('message:received', handleMessageReceived);

    return () => {
      socket.off('message:sent', handleMessageSent);
      socket.off('message:send:error', handleMessageSendError);
      socket.off('message:received', handleMessageReceived);

      // 清理所有待处理的超时
      pendingMessages.current.forEach(pending => {
        clearTimeout(pending.timeout);
      });
      pendingMessages.current.clear();
    };
  }, [socket]);

  return {
    messages,
    sendMessage,
    retryMessage
  };
}
```

### Vue 3 Composition API 实现

```typescript
import { ref, onUnmounted, Ref } from 'vue';
import { Socket } from 'socket.io-client';

export function useMessages(socket: Ref<Socket | null>) {
  const messages = ref<Message[]>([]);
  const pendingMessages = new Map<string, PendingMessage>();

  const sendMessage = (content: string) => {
    if (!socket.value?.connected) {
      throw new Error('Socket not connected');
    }

    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36);
    const messageData = {
      type: 'text' as const,
      content: content.trim(),
      timestamp: Date.now(),
      tempId
    };

    // 添加到本地消息列表
    const tempMessage: Message = {
      id: tempId,
      tempId,
      type: 'text',
      content: messageData.content,
      sender: { id: 'current', username: 'You' },
      timestamp: messageData.timestamp,
      status: 'sending'
    };

    messages.value.push(tempMessage);

    // 超时处理
    const timeout = setTimeout(() => {
      handleMessageTimeout(tempId);
    }, 10000);

    pendingMessages.set(tempId, {
      data: messageData,
      sentAt: Date.now(),
      timeout
    });

    socket.value.emit('message:send', messageData);
  };

  const setupEventListeners = () => {
    if (!socket.value) return;

    socket.value.on('message:sent', (data) => {
      const pending = pendingMessages.get(data.tempId);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingMessages.delete(data.tempId);

        const index = messages.value.findIndex(msg => msg.tempId === data.tempId);
        if (index !== -1) {
          messages.value[index] = {
            ...messages.value[index],
            id: data.messageId,
            status: 'sent',
            timestamp: data.timestamp
          };
        }
      }
    });

    socket.value.on('message:send:error', (data) => {
      const pending = pendingMessages.get(data.tempId);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingMessages.delete(data.tempId);

        const index = messages.value.findIndex(msg => msg.tempId === data.tempId);
        if (index !== -1) {
          messages.value[index].status = 'failed';
        }
      }
    });

    socket.value.on('message:received', (data) => {
      const exists = messages.value.some(msg => msg.id === data.id);
      if (!exists) {
        messages.value.push({ ...data, status: undefined });
      }
    });
  };

  const handleMessageTimeout = (tempId: string) => {
    const pending = pendingMessages.get(tempId);
    if (pending) {
      pendingMessages.delete(tempId);
      const index = messages.value.findIndex(msg => msg.tempId === tempId);
      if (index !== -1) {
        messages.value[index].status = 'timeout';
      }
    }
  };

  // 监听 socket 变化
  watch(socket, (newSocket) => {
    if (newSocket) {
      setupEventListeners();
    }
  }, { immediate: true });

  onUnmounted(() => {
    pendingMessages.forEach(pending => {
      clearTimeout(pending.timeout);
    });
    pendingMessages.clear();
  });

  return {
    messages,
    sendMessage
  };
}
```

## 🎨 UI 状态显示

### 消息状态指示器

```css
.message-status {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.status-sending {
  color: #ffa500;
}

.status-sent {
  color: #00c851;
}

.status-failed, .status-timeout {
  color: #ff4444;
  cursor: pointer;
}
```

```jsx
function MessageStatus({ status, onRetry }) {
  switch (status) {
    case 'sending':
      return <span className="message-status status-sending">发送中...</span>;
    case 'sent':
      return <span className="message-status status-sent">✓</span>;
    case 'failed':
      return (
        <span className="message-status status-failed" onClick={onRetry}>
          ⚠️ 发送失败，点击重试
        </span>
      );
    case 'timeout':
      return (
        <span className="message-status status-timeout" onClick={onRetry}>
          ⏰ 发送超时，点击重试
        </span>
      );
    default:
      return null;
  }
}
```

## 🛠️ 错误处理最佳实践

1. **网络断线处理**：
```javascript
socket.on('disconnect', () => {
  // 标记所有发送中的消息为失败
  pendingMessages.forEach((pending, tempId) => {
    clearTimeout(pending.timeout);
    updateMessageStatus(tempId, 'failed');
  });
  pendingMessages.clear();
});
```

2. **重连后重发**：
```javascript
socket.on('connect', () => {
  // 可以选择重新发送失败的消息
  const failedMessages = messages.filter(msg => 
    msg.status === 'failed' || msg.status === 'timeout'
  );
  
  failedMessages.forEach(msg => {
    if (confirm(`重新发送消息: ${msg.content}?`)) {
      retryMessage(msg.tempId);
    }
  });
});
```

## 📝 注意事项

1. **tempId 生成**：确保 tempId 的唯一性，建议包含时间戳和随机数
2. **内存管理**：及时清理超时定时器和待处理消息
3. **用户体验**：提供明确的状态指示和重试选项
4. **网络优化**：考虑批量发送和消息队列
5. **数据持久化**：重要消息可考虑本地存储备份

---

**🎯 通过本指南，您可以实现一个完全可靠的消息收发系统，彻底解决消息发送超时问题！**