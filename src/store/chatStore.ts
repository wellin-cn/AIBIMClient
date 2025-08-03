import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Message, User, ConnectionStatus, MessageType, MessageStatus } from '../types'

export interface ChatState {
  // 消息相关状态
  messages: Message[]
  isTyping: Record<string, boolean> // userId -> isTyping
  lastMessageId: string | null
  
  // 用户相关状态
  users: User[]
  onlineUsers: Set<string> // userIds
  
  // 连接状态
  connectionStatus: ConnectionStatus
  lastConnected: Date | null
  reconnectAttempts: number
  
  // UI状态
  isLoading: boolean
  error: string | null
}

export interface ChatActions {
  // 消息操作
  addMessage: (message: Message) => void
  addSystemMessage: (content: string) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  deleteMessage: (messageId: string) => void
  clearMessages: () => void
  loadHistoryMessages: (messages: Message[]) => void
  
  // 用户操作
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  removeUser: (userId: string) => void
  updateUserStatus: (userId: string, isOnline: boolean) => void
  setUserTyping: (userId: string, isTyping: boolean) => void
  
  // 连接操作
  setConnectionStatus: (status: ConnectionStatus) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  
  // UI操作
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export type ChatStore = ChatState & ChatActions

const initialState: ChatState = {
  messages: [],
  isTyping: {},
  lastMessageId: null,
  users: [],
  onlineUsers: new Set(),
  connectionStatus: ConnectionStatus.DISCONNECTED,
  lastConnected: null,
  reconnectAttempts: 0,
  isLoading: false,
  error: null,
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // 消息操作
        addMessage: (message: Message) => {
          set((state) => {
            const newMessages = [...state.messages, message]
            // 保持最近1000条消息
            if (newMessages.length > 1000) {
              newMessages.splice(0, newMessages.length - 1000)
            }
            return {
              messages: newMessages,
              lastMessageId: message.id,
            }
          }, false, 'addMessage')
        },

        // 添加系统消息
        addSystemMessage: (content: string) => {
          const systemMessage = {
            id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content,
            sender: {
              id: 'system',
              name: 'System',
              isOnline: true,
            },
            timestamp: Date.now(),
            type: MessageType.SYSTEM,
            status: MessageStatus.SENT,
          }
          
          set((state) => {
            const newMessages = [...state.messages, systemMessage]
            if (newMessages.length > 1000) {
              newMessages.splice(0, newMessages.length - 1000)
            }
            return {
              messages: newMessages,
              lastMessageId: systemMessage.id,
            }
          }, false, 'addSystemMessage')
        },

        updateMessage: (messageId: string, updates: Partial<Message>) => {
          set((state) => ({
            messages: state.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          }), false, 'updateMessage')
        },

        deleteMessage: (messageId: string) => {
          set((state) => ({
            messages: state.messages.filter(msg => msg.id !== messageId),
          }), false, 'deleteMessage')
        },

        clearMessages: () => {
          set({ messages: [], lastMessageId: null }, false, 'clearMessages')
        },

        loadHistoryMessages: (messages: Message[]) => {
          set((state) => {
            // 合并历史消息，避免重复
            const existingIds = new Set(state.messages.map(m => m.id))
            const newMessages = messages.filter(m => !existingIds.has(m.id))
            const allMessages = [...newMessages, ...state.messages]
              .sort((a, b) => {
                const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp
                const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp
                return aTime - bTime
              })
            
            return {
              messages: allMessages,
              lastMessageId: allMessages[allMessages.length - 1]?.id || null,
            }
          }, false, 'loadHistoryMessages')
        },

        // 用户操作
        setUsers: (users: User[]) => {
          set(() => {
            const onlineUsers = new Set(users.filter(u => u.isOnline).map(u => u.id))
            return { users, onlineUsers }
          }, false, 'setUsers')
        },

        addUser: (user: User) => {
          set((state) => {
            const existingIndex = state.users.findIndex(u => u.id === user.id)
            let newUsers: User[]
            
            if (existingIndex >= 0) {
              // 更新现有用户
              newUsers = [...state.users]
              newUsers[existingIndex] = user
            } else {
              // 添加新用户
              newUsers = [...state.users, user]
            }
            
            const onlineUsers = new Set(state.onlineUsers)
            if (user.isOnline) {
              onlineUsers.add(user.id)
            } else {
              onlineUsers.delete(user.id)
            }
            
            return { users: newUsers, onlineUsers }
          }, false, 'addUser')
        },

        removeUser: (userId: string) => {
          set((state) => {
            const newOnlineUsers = new Set(state.onlineUsers)
            newOnlineUsers.delete(userId)
            
            return {
              users: state.users.filter(u => u.id !== userId),
              onlineUsers: newOnlineUsers,
            }
          }, false, 'removeUser')
        },

        updateUserStatus: (userId: string, isOnline: boolean) => {
          set((state) => {
            const newUsers = state.users.map(user =>
              user.id === userId 
                ? { ...user, isOnline, lastSeen: isOnline ? undefined : new Date() }
                : user
            )
            
            const newOnlineUsers = new Set(state.onlineUsers)
            if (isOnline) {
              newOnlineUsers.add(userId)
            } else {
              newOnlineUsers.delete(userId)
            }
            
            return { users: newUsers, onlineUsers: newOnlineUsers }
          }, false, 'updateUserStatus')
        },

        setUserTyping: (userId: string, isTyping: boolean) => {
          set((state) => ({
            isTyping: isTyping 
              ? { ...state.isTyping, [userId]: true }
              : Object.fromEntries(Object.entries(state.isTyping).filter(([id]) => id !== userId))
          }), false, 'setUserTyping')
        },

        // 连接操作
        setConnectionStatus: (status: ConnectionStatus) => {
          set((state) => ({
            connectionStatus: status,
            lastConnected: status === ConnectionStatus.CONNECTED ? new Date() : state.lastConnected,
            reconnectAttempts: status === ConnectionStatus.CONNECTED ? 0 : state.reconnectAttempts,
          }), false, 'setConnectionStatus')
        },

        incrementReconnectAttempts: () => {
          set((state) => ({
            reconnectAttempts: state.reconnectAttempts + 1,
          }), false, 'incrementReconnectAttempts')
        },

        resetReconnectAttempts: () => {
          set({ reconnectAttempts: 0 }, false, 'resetReconnectAttempts')
        },

        // UI操作
        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'setLoading')
        },

        setError: (error: string | null) => {
          set({ error }, false, 'setError')
        },

        clearError: () => {
          set({ error: null }, false, 'clearError')
        },
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          // 只持久化部分状态
          messages: state.messages.slice(-100), // 只保存最近100条消息
          users: state.users,
          lastConnected: state.lastConnected,
        }),
        onRehydrateStorage: () => (state) => {
          // 重新水合时重置一些状态
          if (state) {
            state.connectionStatus = ConnectionStatus.DISCONNECTED
            state.isTyping = {}
            state.onlineUsers = new Set()
            state.isLoading = false
            state.error = null
            state.reconnectAttempts = 0
          }
        },
      }
    ),
    { name: 'ChatStore' }
  )
)

// 选择器函数，用于优化性能
export const useChatMessages = () => useChatStore(state => state.messages)
export const useChatUsers = () => useChatStore(state => state.users)
export const useOnlineUsers = () => useChatStore(state => state.onlineUsers)
export const useConnectionStatus = () => useChatStore(state => state.connectionStatus)
export const useTypingUsers = () => useChatStore(state => state.isTyping)