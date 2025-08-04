import { SocketService } from '../../../src/services/socketService'
import { io } from 'socket.io-client'
import { mockUsers, mockMessages, mockSocketResponses } from '../../fixtures/mockData'

// 模拟 socket.io-client
jest.mock('socket.io-client')
const mockIo = io as jest.MockedFunction<typeof io>

describe('SocketService', () => {
  let socketService: SocketService
  let mockSocket: any

  beforeEach(() => {
    // 创建模拟socket对象
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: 'test-socket-id',
      io: {
        engine: {
          transport: { name: 'websocket' },
          readyState: 'open'
        }
      }
    }

    mockIo.mockReturnValue(mockSocket)
    socketService = new SocketService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('连接管理', () => {
    it('应该成功连接到服务器', async () => {
      // 模拟连接成功
      mockSocket.emit.mockImplementation((event, data) => {
        if (event === 'user:join') {
          // 模拟服务器响应
          setTimeout(() => {
            const connectHandler = mockSocket.on.mock.calls.find(
              (call: any[]) => call[0] === 'connect'
            )?.[1]
            connectHandler?.()
          }, 0)
        }
      })

      const connectPromise = socketService.connect('ws://localhost:3001', 'testuser')

      // 手动触发连接事件
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect'
      )?.[1]
      connectHandler?.()

      await expect(connectPromise).resolves.toBeUndefined()
      expect(mockIo).toHaveBeenCalledWith('ws://localhost:3001', expect.any(Object))
    })

    it('应该处理连接错误', async () => {
      // 模拟连接错误
      const connectPromise = socketService.connect('ws://invalid-url', 'testuser')

      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect_error'
      )?.[1]
      
      const testError = new Error('Connection failed')
      errorHandler?.(testError)

      await expect(connectPromise).rejects.toThrow('Connection failed')
    })

    it('应该正确断开连接', () => {
      socketService.disconnect()
      expect(mockSocket.disconnect).toHaveBeenCalled()
    })
  })

  describe('消息发送', () => {
    beforeEach(() => {
      mockSocket.connected = true
    })

    it('应该成功发送消息', async () => {
      const testMessage = mockMessages[0]
      
      // 模拟服务器响应
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'send_message' && callback) {
          setTimeout(() => {
            callback(mockSocketResponses.sendMessageSuccess)
          }, 0)
        }
      })

      const result = await socketService.sendMessage('Hello World')

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'send_message',
        expect.objectContaining({
          content: 'Hello World'
        }),
        expect.any(Function)
      )
      expect(result).toEqual(mockSocketResponses.sendMessageSuccess.message)
    })

    it('应该处理消息发送失败', async () => {
      // 模拟发送失败
      mockSocket.emit.mockImplementation((event, data, callback) => {
        if (event === 'send_message' && callback) {
          setTimeout(() => {
            callback(mockSocketResponses.sendMessageError)
          }, 0)
        }
      })

      await expect(socketService.sendMessage('Hello')).rejects.toThrow('Message too long')
    })

    it('连接断开时应该拒绝发送消息', async () => {
      mockSocket.connected = false

      await expect(socketService.sendMessage('Hello')).rejects.toThrow('Socket not connected')
    })
  })

  describe('事件监听', () => {
    it('应该正确注册消息监听器', () => {
      const messageHandler = jest.fn()
      const unsubscribe = socketService.onMessage(messageHandler)

      // 模拟接收消息
      const messageListener = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'message'
      )?.[1]
      
      const testMessage = mockMessages[0]
      messageListener?.(testMessage)

      expect(messageHandler).toHaveBeenCalledWith(testMessage)

      // 测试取消订阅
      unsubscribe()
      messageListener?.(testMessage)
      expect(messageHandler).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理用户列表更新', () => {
      const usersHandler = jest.fn()
      socketService.onUsersUpdate(usersHandler)

      const usersListener = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'users_update'
      )?.[1]

      usersListener?.(mockUsers)
      expect(usersHandler).toHaveBeenCalledWith(mockUsers)
    })
  })

  describe('诊断功能', () => {
    it('应该返回正确的诊断信息', () => {
      const diagnostic = socketService.diagnose()

      expect(diagnostic).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          connection: expect.objectContaining({
            isConnected: expect.any(Boolean),
            socketId: expect.any(String)
          }),
          listeners: expect.objectContaining({
            messageListeners: expect.any(Number)
          })
        })
      )
    })
  })
})