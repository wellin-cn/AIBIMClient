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

      // 验证在线用户列表是否正确更新
      const users = useChatStore.getState().users
      expect(users).toHaveLength(2)
      expect(users[1]).toEqual(expect.objectContaining({
        id: '2',
        name: 'New User',
        username: 'newuser'
      }))
    })

    it('应该正确处理多用户同时在线的情况', async () => {
      // 设置当前用户
      const currentUser = {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        isOnline: true
      }
      useAuthStore.getState().setCurrentUser(currentUser)

      // 模拟第二个用户加入
      const user2 = {
        id: '2',
        name: 'User 2',
        username: 'user2',
        isOnline: true
      }
      const user2JoinData = {
        newMember: user2,
        onlineUsers: [currentUser, user2]
      }

      // 模拟第三个用户加入
      const user3 = {
        id: '3',
        name: 'User 3',
        username: 'user3',
        isOnline: true
      }
      const user3JoinData = {
        newMember: user3,
        onlineUsers: [currentUser, user2, user3]
      }

      // 获取事件处理器
      const newMemberHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'user:new-member-joined'
      )?.[1]

      expect(newMemberHandler).toBeDefined()

      // 触发用户加入事件
      newMemberHandler?.(user2JoinData)
      newMemberHandler?.(user3JoinData)

      // 验证用户列表状态
      const { users } = useChatStore.getState()
      expect(users).toHaveLength(3)

      // 验证每个用户的身份信息是否正确
      expect(users).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          name: 'Test User',
          username: 'testuser'
        }),
        expect.objectContaining({
          id: '2',
          name: 'User 2',
          username: 'user2'
        }),
        expect.objectContaining({
          id: '3',
          name: 'User 3',
          username: 'user3'
        })
      ]))

      // 验证当前用户的身份信息没有被覆盖
      const { currentUser: storedCurrentUser } = useAuthStore.getState()
      expect(storedCurrentUser).toEqual(expect.objectContaining({
        id: '1',
        name: 'Test User',
        username: 'testuser'
      }))
    })

    it('应该正确处理用户离开事件', () => {
      // 设置初始用户列表
      const initialUsers = [
        { id: '1', name: 'Test User', username: 'testuser', isOnline: true },
        { id: '2', name: 'User 2', username: 'user2', isOnline: true },
        { id: '3', name: 'User 3', username: 'user3', isOnline: true }
      ]
      useChatStore.getState().setUsers(initialUsers)

      // 获取用户离开事件处理器
      const userLeftHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'user:left'
      )?.[1]

      expect(userLeftHandler).toBeDefined()

      // 模拟用户离开
      const leftUserData = {
        user: { id: '2', name: 'User 2', username: 'user2' },
        onlineUsers: [
          { id: '1', name: 'Test User', username: 'testuser', isOnline: true },
          { id: '3', name: 'User 3', username: 'user3', isOnline: true }
        ]
      }

      userLeftHandler?.(leftUserData)

      // 验证用户列表更新
      const { users } = useChatStore.getState()
      expect(users).toHaveLength(2)
      expect(users).not.toContainEqual(
        expect.objectContaining({ id: '2' })
      )
    })
  })
})