// Store exports
export * from './chatStore'
export * from './authStore'
export * from './uiStore'

// Re-export Zustand utilities
export { create } from 'zustand'
export { devtools, persist } from 'zustand/middleware'

// Store utilities
export const resetAllStores = () => {
  // 重置所有store到初始状态
  localStorage.removeItem('chat-store')
  localStorage.removeItem('auth-store')
  localStorage.removeItem('ui-store')
  window.location.reload()
}

export const clearChatData = () => {
  // 只清除聊天数据
  localStorage.removeItem('chat-store')
}

export const exportStoreData = () => {
  // 导出所有store数据用于备份
  const chatData = localStorage.getItem('chat-store')
  const authData = localStorage.getItem('auth-store')
  const uiData = localStorage.getItem('ui-store')
  
  return {
    chat: chatData ? JSON.parse(chatData) : null,
    auth: authData ? JSON.parse(authData) : null,
    ui: uiData ? JSON.parse(uiData) : null,
    exportTime: new Date().toISOString(),
  }
}

export const importStoreData = (data: ReturnType<typeof exportStoreData>) => {
  // 导入store数据
  try {
    if (data.chat) {
      localStorage.setItem('chat-store', JSON.stringify(data.chat))
    }
    if (data.auth) {
      localStorage.setItem('auth-store', JSON.stringify(data.auth))
    }
    if (data.ui) {
      localStorage.setItem('ui-store', JSON.stringify(data.ui))
    }
    window.location.reload()
    return true
  } catch (error) {
    console.error('Failed to import store data:', error)
    return false
  }
}