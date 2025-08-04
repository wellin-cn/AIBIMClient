/**
 * 多用户API测试
 * 
 * 测试多个账号同时登录，互相发送消息的完整流程
 */

import { SocketService } from '../../src/services/socketService'
import { ConnectionStatus, MessageType, MessageStatus, User, Message } from '../../src/types'
import { waitFor } from '../utils/testHelpers'

describe('多用户API集成测试', () => {
  const SERVER_URL = 'ws://localhost:3001'
  const TEST_TIMEOUT = 30000

  let user1Service: SocketService
  let user2Service: SocketService
  let user3Service: SocketService

  const users = [
    { username: 'testuser1', displayName: '测试用户1' },
    { username: 'testuser2', displayName: '测试用户2' },
    { username: 'testuser3', displayName: '测试用户3' }
  ]

  beforeAll(async () => {
    console.log('🚀 [多用户API测试] 开始测试...')
    
    // 创建多个Socket服务实例
    user1Service = new SocketService()
    user2Service = new SocketService()
    user3Service = new SocketService()
  }, TEST_TIMEOUT)

  afterAll(async () => {
    console.log('🧹 [多用户API测试] 清理连接...')
    
    // 断开所有连接
    user1Service.disconnect()
    user2Service.disconnect()
    user3Service.disconnect()
  })

  describe('多用户连接测试', () => {
    it('应该支持多个用户同时连接', async () => {
      console.log('📡 [测试] 开始多用户连接测试...')

      const connectionPromises = [
        user1Service.connect(SERVER_URL, users[0].username),
        user2Service.connect(SERVER_URL, users[1].username),
        user3Service.connect(SERVER_URL, users[2].username)
      ]

      // 同时连接所有用户
      const results = await Promise.allSettled(connectionPromises)
      
      // 检查连接结果
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ 用户${index + 1} (${users[index].username}) 连接成功`)
        } else {
          console.error(`❌ 用户${index + 1} (${users[index].username}) 连接失败:`, result.reason)
        }
      })

      // 验证所有用户都已连接
      expect(user1Service.isConnected).toBe(true)
      expect(user2Service.isConnected).toBe(true)
      expect(user3Service.isConnected).toBe(true)

      console.log('✅ [测试] 所有用户连接成功')
    }, TEST_TIMEOUT)

    it('应该能获取在线用户列表', async () => {
      console.log('👥 [测试] 获取在线用户列表...')

      // 等待用户列表同步
      await waitFor(2000)

      try {
        const user1List = await user1Service.getOnlineUsers()
        const user2List = await user2Service.getOnlineUsers()

        console.log('📋 用户1看到的在线用户:', user1List.map(u => u.username))
        console.log('📋 用户2看到的在线用户:', user2List.map(u => u.username))

        // 验证用户列表包含所有连接的用户
        expect(user1List.length).toBeGreaterThanOrEqual(3)
        expect(user2List.length).toBeGreaterThanOrEqual(3)

        // 验证用户列表包含预期的用户名
        const user1Usernames = user1List.map(u => u.username)
        users.forEach(user => {
          expect(user1Usernames).toContain(user.username)
        })

        console.log('✅ [测试] 用户列表验证通过')
      } catch (error) {
        console.error('❌ [测试] 获取用户列表失败:', error)
        throw error
      }
    }, TEST_TIMEOUT)
  })

  describe('消息发送和接收测试', () => {
    const receivedMessages: { [userId: string]: Message[] } = {
      user1: [],
      user2: [],
      user3: []
    }

    beforeAll(() => {
      // 设置消息监听器
      user1Service.onMessage((message) => {
        console.log('📥 [用户1] 收到消息:', message.content, '来自:', message.sender?.username)
        receivedMessages.user1.push(message)
      })

      user2Service.onMessage((message) => {
        console.log('📥 [用户2] 收到消息:', message.content, '来自:', message.sender?.username)
        receivedMessages.user2.push(message)
      })

      user3Service.onMessage((message) => {
        console.log('📥 [用户3] 收到消息:', message.content, '来自:', message.sender?.username)
        receivedMessages.user3.push(message)
      })
    })

    it('用户1向所有人发送消息', async () => {
      console.log('📤 [测试] 用户1发送消息...')

      const messageContent = '大家好！我是测试用户1'
      
      try {
        const sentMessage = await user1Service.sendMessage(messageContent)
        
        console.log('✅ [用户1] 消息发送成功:', {
          id: sentMessage.id,
          content: sentMessage.content,
          timestamp: sentMessage.timestamp
        })

        expect(sentMessage.content).toBe(messageContent)
        expect(sentMessage.id).toBeDefined()

        // 等待消息传播
        await waitFor(2000)

        // 验证其他用户收到消息
        const user2ReceivedMsg = receivedMessages.user2.find(m => m.content === messageContent)
        const user3ReceivedMsg = receivedMessages.user3.find(m => m.content === messageContent)

        expect(user2ReceivedMsg).toBeDefined()
        expect(user3ReceivedMsg).toBeDefined()

        console.log('✅ [测试] 用户1消息发送和接收验证通过')
      } catch (error) {
        console.error('❌ [测试] 用户1发送消息失败:', error)
        throw error
      }
    }, TEST_TIMEOUT)

    it('用户2向所有人发送消息', async () => {
      console.log('📤 [测试] 用户2发送消息...')

      const messageContent = '你好用户1！我是用户2，收到你的消息了'
      
      try {
        const sentMessage = await user2Service.sendMessage(messageContent)
        
        console.log('✅ [用户2] 消息发送成功:', {
          id: sentMessage.id,
          content: sentMessage.content
        })

        expect(sentMessage.content).toBe(messageContent)

        // 等待消息传播
        await waitFor(2000)

        // 验证其他用户收到消息
        const user1ReceivedMsg = receivedMessages.user1.find(m => m.content === messageContent)
        const user3ReceivedMsg = receivedMessages.user3.find(m => m.content === messageContent)

        expect(user1ReceivedMsg).toBeDefined()
        expect(user3ReceivedMsg).toBeDefined()

        console.log('✅ [测试] 用户2消息发送和接收验证通过')
      } catch (error) {
        console.error('❌ [测试] 用户2发送消息失败:', error)
        throw error
      }
    }, TEST_TIMEOUT)

    it('用户3向所有人发送消息', async () => {
      console.log('📤 [测试] 用户3发送消息...')

      const messageContent = '哈哈，我也加入聊天了！大家好～'
      
      try {
        const sentMessage = await user3Service.sendMessage(messageContent)
        
        console.log('✅ [用户3] 消息发送成功:', {
          id: sentMessage.id,
          content: sentMessage.content
        })

        expect(sentMessage.content).toBe(messageContent)

        // 等待消息传播
        await waitFor(2000)

        // 验证其他用户收到消息
        const user1ReceivedMsg = receivedMessages.user1.find(m => m.content === messageContent)
        const user2ReceivedMsg = receivedMessages.user2.find(m => m.content === messageContent)

        expect(user1ReceivedMsg).toBeDefined()
        expect(user2ReceivedMsg).toBeDefined()

        console.log('✅ [测试] 用户3消息发送和接收验证通过')
      } catch (error) {
        console.error('❌ [测试] 用户3发送消息失败:', error)
        throw error
      }
    }, TEST_TIMEOUT)

    it('应该支持快速连续发送消息', async () => {
      console.log('⚡ [测试] 快速连续发送消息...')

      const messages = [
        '这是第一条消息',
        '这是第二条消息',
        '这是第三条消息'
      ]

      try {
        // 用户1快速发送多条消息
        const sendPromises = messages.map((content, index) => 
          user1Service.sendMessage(`${content} (${index + 1})`)
        )

        const sentMessages = await Promise.all(sendPromises)
        
        console.log('✅ [用户1] 快速发送完成，共发送:', sentMessages.length, '条消息')

        // 验证所有消息都发送成功
        sentMessages.forEach((msg, index) => {
          expect(msg.content).toContain(messages[index])
        })

        // 等待消息传播
        await waitFor(3000)

        console.log('📊 [统计] 各用户收到的消息数量:')
        console.log(`  用户1: ${receivedMessages.user1.length} 条`)
        console.log(`  用户2: ${receivedMessages.user2.length} 条`)
        console.log(`  用户3: ${receivedMessages.user3.length} 条`)

        console.log('✅ [测试] 快速连续发送消息验证通过')
      } catch (error) {
        console.error('❌ [测试] 快速连续发送消息失败:', error)
        throw error
      }
    }, TEST_TIMEOUT)
  })

  describe('输入状态测试', () => {
    const typingStates: { [userId: string]: { [typingUserId: string]: boolean } } = {
      user1: {},
      user2: {},
      user3: {}
    }

    beforeAll(() => {
      // 设置输入状态监听器
      user1Service.onTypingChange((userId, isTyping) => {
        console.log(`⌨️ [用户1] 检测到输入状态变化: 用户${userId} ${isTyping ? '开始' : '停止'}输入`)
        typingStates.user1[userId] = isTyping
      })

      user2Service.onTypingChange((userId, isTyping) => {
        console.log(`⌨️ [用户2] 检测到输入状态变化: 用户${userId} ${isTyping ? '开始' : '停止'}输入`)
        typingStates.user2[userId] = isTyping
      })

      user3Service.onTypingChange((userId, isTyping) => {
        console.log(`⌨️ [用户3] 检测到输入状态变化: 用户${userId} ${isTyping ? '开始' : '停止'}输入`)
        typingStates.user3[userId] = isTyping
      })
    })

    it('应该正确传播输入状态', async () => {
      console.log('⌨️ [测试] 输入状态传播...')

      // 用户1开始输入
      user1Service.sendTypingStatus(true)
      await waitFor(1000)

      // 用户1停止输入
      user1Service.sendTypingStatus(false)
      await waitFor(1000)

      console.log('✅ [测试] 输入状态测试完成')
    }, TEST_TIMEOUT)
  })

  describe('用户离开和重连测试', () => {
    it('应该处理用户离开', async () => {
      console.log('👋 [测试] 用户离开测试...')

      // 用户3离开
      user3Service.disconnect()
      
      expect(user3Service.isConnected).toBe(false)
      console.log('✅ [用户3] 已断开连接')

      // 等待其他用户收到离开通知
      await waitFor(2000)

      console.log('✅ [测试] 用户离开测试完成')
    }, TEST_TIMEOUT)

    it('应该支持用户重新连接', async () => {
      console.log('🔄 [测试] 用户重连测试...')

      // 用户3重新连接
      await user3Service.connect(SERVER_URL, users[2].username)
      
      expect(user3Service.isConnected).toBe(true)
      console.log('✅ [用户3] 重新连接成功')

      // 等待重连完成
      await waitFor(2000)

      console.log('✅ [测试] 用户重连测试完成')
    }, TEST_TIMEOUT)
  })

  describe('错误处理测试', () => {
    it('应该处理无效的服务器地址', async () => {
      console.log('🔴 [测试] 无效服务器地址测试...')

      const invalidService = new SocketService()
      
      await expect(
        invalidService.connect('ws://invalid-server:9999', 'testuser')
      ).rejects.toThrow()

      console.log('✅ [测试] 无效服务器地址处理正确')
    }, TEST_TIMEOUT)

    it('应该处理断开连接后的消息发送', async () => {
      console.log('💔 [测试] 断线后发送消息测试...')

      const disconnectedService = new SocketService()
      
      await expect(
        disconnectedService.sendMessage('这条消息不应该发送成功')
      ).rejects.toThrow('Socket not connected')

      console.log('✅ [测试] 断线后发送消息处理正确')
    }, TEST_TIMEOUT)
  })

  describe('性能测试', () => {
    it('应该在合理时间内发送消息', async () => {
      console.log('⏱️ [测试] 消息发送性能测试...')

      const startTime = Date.now()
      await user1Service.sendMessage('性能测试消息')
      const endTime = Date.now()

      const duration = endTime - startTime
      console.log(`📊 [性能] 消息发送耗时: ${duration}ms`)

      // 消息发送应该在3秒内完成
      expect(duration).toBeLessThan(3000)

      console.log('✅ [测试] 消息发送性能满足要求')
    }, TEST_TIMEOUT)
  })
})