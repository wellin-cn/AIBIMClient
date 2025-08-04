import { renderHook, act } from '@testing-library/react'
import { useSocket } from '../../../src/hooks/useSocket'
import { socketService } from '../../../src/services/socketService'

// 模拟 socketService
jest.mock('../../../src/services/socketService')
const mockSocketService = socketService as jest.Mocked<typeof socketService>

// 模拟 stores
jest.mock('../../../src/store', () => ({
  useAuthStore: () => ({
    currentUser: { id: '1', name: 'Test User', isOnline: true },
    setCurrentUser: jest.fn(),
    setLoggingIn: jest.fn(),
    setLoginError: jest.fn(),
  }),
  useChatStore: () => ({
    setConnectionStatus: jest.fn(),
    addMessage: jest.fn(),
    updateMessage: jest.fn(),
    setUsers: jest.fn(),
    setUserTyping: jest.fn(),
    clearMessages: jest.fn(),
    clearError: jest.fn(),
  }),
}))

// 模拟 useNotifications
jest.mock('../../../src/hooks/useNotifications', () => ({
  useNotifications: () => ({
    addUserJoinedNotification: jest.fn(),
    addError: jest.fn(),
    addSuccess: jest.fn(),
    notifications: [],
    dismissNotification: jest.fn(),
  }),
}))

describe('useSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSocketService.isConnected = true
    mockSocketService.socketId = 'test-socket-id'
  })

  it('应该返回正确的连接状态', () => {
    const { result } = renderHook(() => useSocket())
    
    expect(result.current.isConnected).toBe(true)
    expect(result.current.socketId).toBe('test-socket-id')
  })

  it('应该能够发送消息', async () => {
    mockSocketService.sendMessage.mockResolvedValue({
      id: 'msg-1',
      content: 'Hello',
      sender: { id: '1', name: 'Test User', isOnline: true },
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    })

    const { result } = renderHook(() => useSocket())
    
    await act(async () => {
      await result.current.sendMessage('Hello')
    })
    
    expect(mockSocketService.sendMessage).toHaveBeenCalledWith('Hello')
  })

  it('连接失败时应该处理错误', async () => {
    mockSocketService.connect.mockRejectedValue(new Error('Connection failed'))
    
    const { result } = renderHook(() => useSocket())
    
    await act(async () => {
      try {
        await result.current.connect('ws://localhost:3001', 'testuser')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })
})