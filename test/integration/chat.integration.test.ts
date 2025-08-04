/**
 * 聊天功能集成测试
 * 
 * 测试聊天相关的完整流程，包括：
 * - 用户连接
 * - 消息发送和接收
 * - 用户列表更新
 */

import { socketService } from '../../src/services/socketService'
import { useChatStore } from '../../src/store/chatStore'
import { useAuthStore } from '../../src/store/authStore'

// 模拟 Socket.IO
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
  id: 'test-socket-id'
}

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket)
}))

describe('聊天功能集成测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 重置 store 状态
    useChatStore.getState().clearMessages()
    useAuthStore.getState().setCurrentUser(null)
  })

  describe('用户连接流程', () => {
    it('应该成功连接并认证用户', async () => {
      // 模拟连接成功
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'user:join' && callback) {
          setTimeout(() => {
            // 模拟服务器响应
            const connectHandler = mockSocket.on.mock.calls.find(
              call => call[0] === 'connect'
            )?.[1]
            connectHandler?.()

            const authHandler = mockSocket.on.mock.calls.find(
              call => call[0] === 'user:joined'
            )?.[1]
            authHandler?.({
              user: { id: '1', name: 'Test User', username: 'testuser' },
              onlineUsers: [{ id: '1', name: 'Test User', username: 'testuser' }]
            })
          }, 0)
        }
      })

      await socketService.connect('ws://localhost:3001', 'testuser')

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'user:join',
        expect.objectContaining({
          username: 'testuser'
        })
      )
    })
  })

  describe('消息发送流程', () => {
    it('应该成功发送和接收消息', async () => {
      const testMessage = {
        id: 'msg-1',
        content: 'Hello World',
        sender: { id: '1', name: 'Test User', isOnline: true },
        timestamp: new Date(),
        type: 'text' as const,
        status: 'sent' as const
      }

      // 模拟发送消息成功响应
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'send_message' && callback) {
          setTimeout(() => {
            callback({
              success: true,
              message: testMessage
            })
          }, 0)
        }
      })

      const result = await socketService.sendMessage('Hello World')

      expect(result).toEqual(testMessage)
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'send_message',
        expect.objectContaining({
          content: 'Hello World'
        }),
        expect.any(Function)
      )
    })

    it('应该处理消息发送失败', async () => {
      // 模拟发送失败
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'send_message' && callback) {
          setTimeout(() => {
            callback({
              success: false,
              error: 'Message too long'
            })
          }, 0)
        }
      })

      await expect(socketService.sendMessage('Hello')).rejects.toThrow('Message too long')
    })
  })

  describe('实时事件处理', () => {
    it('应该正确处理新用户加入事件', () => {
      // 触发新用户加入事件
      const newMemberHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'user:new-member-joined'
      )?.[1]

      expect(newMemberHandler).toBeDefined()

      const newMemberData = {
        newMember: { id: '2', name: 'New User', username: 'newuser' },
        onlineUsers: [
          { id: '1', name: 'Test User', username: 'testuser' },
          { id: '2', name: 'New User', username: 'newuser' }
        ]
      }

      newMemberHandler?.(newMemberData)

      // 验证事件处理是否正确
      // 这里可以检查 store 状态更新或其他副作用
    })
  })
})