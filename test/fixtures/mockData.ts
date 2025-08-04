/**
 * 测试用的模拟数据
 */

import { User, Message, MessageType, MessageStatus } from '../../src/types'

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    username: 'zhangsan',
    isOnline: true,
    status: 'online',
    avatar: undefined,
    lastSeen: new Date()
  },
  {
    id: '2',
    name: '李四',
    username: 'lisi',
    isOnline: true,
    status: 'online',
    avatar: undefined,
    lastSeen: new Date()
  },
  {
    id: '3',
    name: '王五',
    username: 'wangwu',
    isOnline: false,
    status: 'offline',
    avatar: undefined,
    lastSeen: new Date(Date.now() - 3600000) // 1小时前
  }
]

// 模拟消息数据
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: '大家好！',
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 300000), // 5分钟前
    type: MessageType.TEXT,
    status: MessageStatus.SENT
  },
  {
    id: 'msg-2',
    content: '你好，欢迎加入！',
    sender: mockUsers[1],
    timestamp: new Date(Date.now() - 240000), // 4分钟前
    type: MessageType.TEXT,
    status: MessageStatus.SENT
  },
  {
    id: 'msg-3',
    content: '今天天气不错呢',
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 180000), // 3分钟前
    type: MessageType.TEXT,
    status: MessageStatus.SENT
  },
  {
    id: 'sys-1',
    content: '王五 加入了聊天室',
    sender: {
      id: 'system',
      name: 'System',
      isOnline: true
    },
    timestamp: new Date(Date.now() - 120000), // 2分钟前
    type: MessageType.SYSTEM,
    status: MessageStatus.SENT
  }
]

// 模拟Socket响应数据
export const mockSocketResponses = {
  sendMessageSuccess: {
    success: true,
    message: {
      id: 'msg-new',
      content: 'Test message',
      sender: mockUsers[0],
      timestamp: new Date(),
      type: MessageType.TEXT,
      status: MessageStatus.SENT
    }
  },
  sendMessageError: {
    success: false,
    error: 'Message too long'
  },
  userJoinedResponse: {
    user: mockUsers[0],
    onlineUsers: mockUsers.filter(u => u.isOnline),
    serverInfo: {
      version: '1.0.0',
      maxUsers: 100,
      currentUsers: 2
    }
  },
  newMemberJoined: {
    newMember: mockUsers[2],
    onlineUsers: mockUsers
  }
}

// 模拟错误数据
export const mockErrors = {
  connectionError: new Error('Failed to connect to server'),
  authError: new Error('Invalid username'),
  messageError: new Error('Message sending failed'),
  networkError: new Error('Network connection lost')
}

// 测试配置
export const testConfig = {
  serverUrl: 'ws://localhost:3001',
  testTimeout: 5000,
  mockDelay: 100
}