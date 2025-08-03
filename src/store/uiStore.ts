import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface UIState {
  // 主题设置
  theme: 'light' | 'dark' | 'system'
  
  // 布局状态
  sidebarVisible: boolean
  sidebarWidth: number
  windowSize: { width: number; height: number }
  
  // 聊天界面状态
  messageInputHeight: number
  showUserList: boolean
  showEmojiPicker: boolean
  
  // 模态框状态
  activeModal: string | null
  modalData: Record<string, any>
  
  // 通知设置
  notifications: {
    sound: boolean
    desktop: boolean
    mentions: boolean
  }
  
  // 其他UI状态
  isFullscreen: boolean
  fontSize: 'small' | 'medium' | 'large'
  lastActiveTime: Date
}

export interface UIActions {
  // 主题操作
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  
  // 布局操作
  setSidebarVisible: (visible: boolean) => void
  setSidebarWidth: (width: number) => void
  setWindowSize: (size: { width: number; height: number }) => void
  
  // 聊天界面操作
  setMessageInputHeight: (height: number) => void
  setShowUserList: (show: boolean) => void
  setShowEmojiPicker: (show: boolean) => void
  
  // 模态框操作
  openModal: (modalId: string, data?: any) => void
  closeModal: () => void
  setModalData: (data: any) => void
  
  // 通知设置
  updateNotificationSettings: (settings: Partial<UIState['notifications']>) => void
  
  // 其他操作
  setFullscreen: (fullscreen: boolean) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  updateLastActiveTime: () => void
}

export type UIStore = UIState & UIActions

const initialState: UIState = {
  theme: 'system',
  sidebarVisible: true,
  sidebarWidth: 240,
  windowSize: { width: 1200, height: 800 },
  messageInputHeight: 80,
  showUserList: true,
  showEmojiPicker: false,
  activeModal: null,
  modalData: {},
  notifications: {
    sound: true,
    desktop: true,
    mentions: true,
  },
  isFullscreen: false,
  fontSize: 'medium',
  lastActiveTime: new Date(),
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // 主题操作
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set({ theme }, false, 'setTheme')
        },

        toggleTheme: () => {
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light'
          }), false, 'toggleTheme')
        },

        // 布局操作
        setSidebarVisible: (visible: boolean) => {
          set({ sidebarVisible: visible }, false, 'setSidebarVisible')
        },

        setSidebarWidth: (width: number) => {
          // 限制侧边栏宽度范围
          const clampedWidth = Math.max(200, Math.min(400, width))
          set({ sidebarWidth: clampedWidth }, false, 'setSidebarWidth')
        },

        setWindowSize: (size: { width: number; height: number }) => {
          set({ windowSize: size }, false, 'setWindowSize')
        },

        // 聊天界面操作
        setMessageInputHeight: (height: number) => {
          // 限制输入框高度范围
          const clampedHeight = Math.max(40, Math.min(200, height))
          set({ messageInputHeight: clampedHeight }, false, 'setMessageInputHeight')
        },

        setShowUserList: (show: boolean) => {
          set({ showUserList: show }, false, 'setShowUserList')
        },

        setShowEmojiPicker: (show: boolean) => {
          set({ showEmojiPicker: show }, false, 'setShowEmojiPicker')
        },

        // 模态框操作
        openModal: (modalId: string, data: any = {}) => {
          set({ 
            activeModal: modalId,
            modalData: data,
          }, false, 'openModal')
        },

        closeModal: () => {
          set({ 
            activeModal: null,
            modalData: {},
          }, false, 'closeModal')
        },

        setModalData: (data: any) => {
          set((state) => ({
            modalData: { ...state.modalData, ...data },
          }), false, 'setModalData')
        },

        // 通知设置
        updateNotificationSettings: (settings: Partial<UIState['notifications']>) => {
          set((state) => ({
            notifications: { ...state.notifications, ...settings },
          }), false, 'updateNotificationSettings')
        },

        // 其他操作
        setFullscreen: (fullscreen: boolean) => {
          set({ isFullscreen: fullscreen }, false, 'setFullscreen')
        },

        setFontSize: (size: 'small' | 'medium' | 'large') => {
          set({ fontSize: size }, false, 'setFontSize')
        },

        updateLastActiveTime: () => {
          set({ lastActiveTime: new Date() }, false, 'updateLastActiveTime')
        },
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          // 持久化UI设置
          theme: state.theme,
          sidebarVisible: state.sidebarVisible,
          sidebarWidth: state.sidebarWidth,
          showUserList: state.showUserList,
          notifications: state.notifications,
          fontSize: state.fontSize,
        }),
        onRehydrateStorage: () => (state) => {
          // 重新水合时重置一些临时状态
          if (state) {
            state.activeModal = null
            state.modalData = {}
            state.showEmojiPicker = false
            state.lastActiveTime = new Date()
          }
        },
      }
    ),
    { name: 'UIStore' }
  )
)

// 选择器函数
export const useTheme = () => useUIStore(state => state.theme)
export const useSidebarState = () => useUIStore(state => ({
  visible: state.sidebarVisible,
  width: state.sidebarWidth,
}))
export const useModalState = () => useUIStore(state => ({
  activeModal: state.activeModal,
  modalData: state.modalData,
}))
export const useNotificationSettings = () => useUIStore(state => state.notifications)