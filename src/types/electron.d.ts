// Electron API 类型声明
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