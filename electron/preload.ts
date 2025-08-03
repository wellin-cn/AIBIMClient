import { contextBridge, ipcRenderer } from 'electron'

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppName: () => ipcRenderer.invoke('app-name'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
})

// 类型定义
export interface IElectronAPI {
  getAppVersion: () => Promise<string>
  getAppName: () => Promise<string>
  getUserDataPath: () => Promise<string>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}