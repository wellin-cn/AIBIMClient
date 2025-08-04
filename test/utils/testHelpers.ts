/**
 * 测试辅助工具函数
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { mockUsers, mockMessages } from '../fixtures/mockData'

// 创建模拟的Socket服务
export const createMockSocketService = () => ({
  isConnected: true,
  socketId: 'test-socket-id',
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn(),
  sendMessage: jest.fn().mockResolvedValue(mockMessages[0]),
  sendTypingStatus: jest.fn(),
  getOnlineUsers: jest.fn().mockResolvedValue(mockUsers),
  onConnectionChange: jest.fn(() => jest.fn()),
  onMessage: jest.fn(() => jest.fn()),
  onUsersUpdate: jest.fn(() => jest.fn()),
  onTypingChange: jest.fn(() => jest.fn()),
  onSystemMessage: jest.fn(() => jest.fn()),
  onAuth: jest.fn(() => jest.fn()),
  onNewMemberJoined: jest.fn(() => jest.fn()),
  diagnose: jest.fn()
})

// 创建模拟的Store状态
export const createMockAuthStore = (overrides = {}) => ({
  currentUser: mockUsers[0],
  isLoggingIn: false,
  loginError: null,
  setCurrentUser: jest.fn(),
  setLoggingIn: jest.fn(),
  setLoginError: jest.fn(),
  logout: jest.fn(),
  ...overrides
})

export const createMockChatStore = (overrides = {}) => ({
  messages: mockMessages,
  users: mockUsers,
  connectionStatus: 'connected' as const,
  isTyping: {},
  onlineUsers: new Set(['1', '2']),
  isLoading: false,
  error: null,
  addMessage: jest.fn(),
  updateMessage: jest.fn(),
  setUsers: jest.fn(),
  setConnectionStatus: jest.fn(),
  setUserTyping: jest.fn(),
  clearMessages: jest.fn(),
  clearError: jest.fn(),
  ...overrides
})

// 等待异步操作完成
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms))

// 模拟用户输入
export const mockUserInput = (value: string) => ({
  target: { value }
})

// 模拟文件输入
export const mockFileInput = (files: File[]) => ({
  target: { files }
})

// 创建测试用的文件对象
export const createMockFile = (
  name: string = 'test.txt',
  type: string = 'text/plain',
  size: number = 1024
): File => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// 模拟Socket事件
export const triggerSocketEvent = (
  mockSocket: any,
  eventName: string,
  data?: any
) => {
  const handler = mockSocket.on.mock.calls.find(
    (call: any[]) => call[0] === eventName
  )?.[1]
  
  if (handler) {
    handler(data)
  } else {
    console.warn(`No handler found for socket event: ${eventName}`)
  }
}

// 自定义渲染函数（可以添加Provider等）
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // 这里可以添加全局的Provider包装
  return render(ui, { ...options })
}

// 断言辅助函数
export const expectElementToHaveText = (element: Element, text: string) => {
  expect(element).toHaveTextContent(text)
}

export const expectElementToBeVisible = (element: Element) => {
  expect(element).toBeVisible()
}

export const expectElementToBeDisabled = (element: Element) => {
  expect(element).toBeDisabled()
}

// 模拟时间
export const mockCurrentTime = (date: Date) => {
  const spy = jest.spyOn(global, 'Date').mockImplementation(() => date as any)
  return spy
}

// 清理模拟时间
export const restoreTime = (spy: jest.SpyInstance) => {
  spy.mockRestore()
}

// 控制台日志捕获
export const captureConsoleOutput = () => {
  const originalLog = console.log
  const originalError = console.error
  const logs: string[] = []
  const errors: string[] = []

  console.log = (...args) => {
    logs.push(args.join(' '))
  }

  console.error = (...args) => {
    errors.push(args.join(' '))
  }

  return {
    logs,
    errors,
    restore: () => {
      console.log = originalLog
      console.error = originalError
    }
  }
}