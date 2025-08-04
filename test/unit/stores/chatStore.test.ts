import { useChatStore } from '../../../src/store/chatStore'
import { mockMessages, mockUsers } from '../../fixtures/mockData'
import { MessageType, MessageStatus, ConnectionStatus } from '../../../src/types'

describe('ChatStore', () => {
  beforeEach(() => {
    // 重置store状态
    useChatStore.getState().clearMessages()
    useChatStore.getState().setUsers([])
    useChatStore.getState().setConnectionStatus(ConnectionStatus.DISCONNECTED)
  })

  describe('消息管理', () => {
    it('应该能够添加消息', () => {
      const store = useChatStore.getState()
      const testMessage = mockMessages[0]

      store.addMessage(testMessage)

      const messages = useChatStore.getState().messages
      expect(messages).toContain(testMessage)
      expect(useChatStore.getState().lastMessageId).toBe(testMessage.id)
    })

    it('应该能够更新消息', () => {
      const store = useChatStore.getState()
      const testMessage = mockMessages[0]

      // 先添加消息
      store.addMessage(testMessage)

      // 更新消息状态
      store.updateMessage(testMessage.id, {
        status: MessageStatus.FAILED
      })

      const updatedMessage = useChatStore.getState().messages.find(
        msg => msg.id === testMessage.id
      )
      expect(updatedMessage?.status).toBe(MessageStatus.FAILED)
    })

    it('应该能够删除消息', () => {
      const store = useChatStore.getState()
      const testMessage = mockMessages[0]

      store.addMessage(testMessage)
      store.deleteMessage(testMessage.id)

      const messages = useChatStore.getState().messages
      expect(messages).not.toContain(testMessage)
    })

    it('应该能够清空所有消息', () => {
      const store = useChatStore.getState()
      
      // 添加多条消息
      mockMessages.forEach(msg => store.addMessage(msg))

      store.clearMessages()

      expect(useChatStore.getState().messages).toHaveLength(0)
      expect(useChatStore.getState().lastMessageId).toBeNull()
    })

    it('应该限制消息数量为1000条', () => {
      const store = useChatStore.getState()

      // 添加1001条消息
      for (let i = 0; i < 1001; i++) {
        store.addMessage({
          id: `msg-${i}`,
          content: `Message ${i}`,
          sender: mockUsers[0],
          timestamp: new Date(),
          type: MessageType.TEXT,
          status: MessageStatus.SENT
        })
      }

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(1000)
      expect(messages[0].id).toBe('msg-1') // 第一条消息应该被删除
    })

    it('应该能够添加系统消息', () => {
      const store = useChatStore.getState()
      const systemContent = '系统消息测试'

      store.addSystemMessage(systemContent)

      const messages = useChatStore.getState().messages
      const systemMessage = messages.find(msg => msg.type === MessageType.SYSTEM)

      expect(systemMessage).toBeTruthy()
      expect(systemMessage?.content).toBe(systemContent)
      expect(systemMessage?.sender.id).toBe('system')
    })
  })

  describe('用户管理', () => {
    it('应该能够设置用户列表', () => {
      const store = useChatStore.getState()

      store.setUsers(mockUsers)

      const { users, onlineUsers } = useChatStore.getState()
      expect(users).toEqual(mockUsers)
      expect(onlineUsers.size).toBe(mockUsers.filter(u => u.isOnline).length)
    })

    it('应该能够添加单个用户', () => {
      const store = useChatStore.getState()
      const newUser = mockUsers[0]

      store.addUser(newUser)

      const users = useChatStore.getState().users
      expect(users).toContain(newUser)
    })

    it('应该能够移除用户', () => {
      const store = useChatStore.getState()
      const userToRemove = mockUsers[0]

      store.setUsers(mockUsers)
      store.removeUser(userToRemove.id)

      const users = useChatStore.getState().users
      expect(users).not.toContain(userToRemove)
    })

    it('应该能够更新用户在线状态', () => {
      const store = useChatStore.getState()
      const user = mockUsers[0]

      store.setUsers([user])
      store.updateUserStatus(user.id, false)

      const updatedUser = useChatStore.getState().users.find(u => u.id === user.id)
      expect(updatedUser?.isOnline).toBe(false)
      expect(useChatStore.getState().onlineUsers.has(user.id)).toBe(false)
    })

    it('应该能够设置用户输入状态', () => {
      const store = useChatStore.getState()
      const userId = 'user-1'

      store.setUserTyping(userId, true)

      expect(useChatStore.getState().isTyping[userId]).toBe(true)

      store.setUserTyping(userId, false)

      expect(useChatStore.getState().isTyping[userId]).toBeUndefined()
    })
  })

  describe('连接状态管理', () => {
    it('应该能够设置连接状态', () => {
      const store = useChatStore.getState()

      store.setConnectionStatus(ConnectionStatus.CONNECTED)

      const state = useChatStore.getState()
      expect(state.connectionStatus).toBe(ConnectionStatus.CONNECTED)
      expect(state.lastConnected).toBeInstanceOf(Date)
      expect(state.reconnectAttempts).toBe(0)
    })

    it('应该能够增加重连尝试次数', () => {
      const store = useChatStore.getState()

      store.incrementReconnectAttempts()
      store.incrementReconnectAttempts()

      expect(useChatStore.getState().reconnectAttempts).toBe(2)
    })

    it('应该能够重置重连尝试次数', () => {
      const store = useChatStore.getState()

      store.incrementReconnectAttempts()
      store.resetReconnectAttempts()

      expect(useChatStore.getState().reconnectAttempts).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该能够设置和清除错误', () => {
      const store = useChatStore.getState()
      const errorMessage = '测试错误'

      store.setError(errorMessage)
      expect(useChatStore.getState().error).toBe(errorMessage)

      store.clearError()
      expect(useChatStore.getState().error).toBeNull()
    })

    it('应该能够设置加载状态', () => {
      const store = useChatStore.getState()

      store.setLoading(true)
      expect(useChatStore.getState().isLoading).toBe(true)

      store.setLoading(false)
      expect(useChatStore.getState().isLoading).toBe(false)
    })
  })
})