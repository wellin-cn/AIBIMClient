import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { FileUploadProgress, FileUploadStatus } from '../types'

export interface FileUploadState {
  // 上传任务列表
  uploads: Record<string, FileUploadProgress>
  
  // 上传队列管理
  maxConcurrentUploads: number
  activeUploadCount: number
  
  // 全局上传状态
  isUploading: boolean
  totalProgress: number
  
  // 历史记录
  completedUploads: string[]
  failedUploads: string[]
}

export interface FileUploadActions {
  // 上传任务管理
  addUpload: (upload: FileUploadProgress) => void
  updateUpload: (tempId: string, updates: Partial<FileUploadProgress>) => void
  removeUpload: (tempId: string) => void
  clearCompleted: () => void
  clearAll: () => void
  
  // 上传控制
  cancelUpload: (tempId: string) => void
  pauseUpload: (tempId: string) => void
  resumeUpload: (tempId: string) => void
  retryUpload: (tempId: string) => void
  
  // 队列管理
  getNextQueuedUpload: () => string | null
  setMaxConcurrentUploads: (max: number) => void
  
  // 统计信息
  getUploadStats: () => {
    total: number
    completed: number
    failed: number
    active: number
    queued: number
  }
}

type FileUploadStore = FileUploadState & FileUploadActions

export const useFileUploadStore = create<FileUploadStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      uploads: {},
      maxConcurrentUploads: 3,
      activeUploadCount: 0,
      isUploading: false,
      totalProgress: 0,
      completedUploads: [],
      failedUploads: [],

      // 添加上传任务
      addUpload: (upload) => set((state) => {
        const newUploads = {
          ...state.uploads,
          [upload.tempId]: upload
        }
        
        return {
          uploads: newUploads,
          isUploading: true
        }
      }, false, 'addUpload'),

      // 更新上传任务
      updateUpload: (tempId, updates) => set((state) => {
        const currentUpload = state.uploads[tempId]
        if (!currentUpload) {
          console.warn(`[FileUploadStore] Upload not found: ${tempId}`)
          return state
        }

        const updatedUpload = { ...currentUpload, ...updates }
        const newUploads = {
          ...state.uploads,
          [tempId]: updatedUpload
        }

        // 更新活动上传数量
        let activeCount = 0
        let totalBytes = 0
        let uploadedBytes = 0
        const newCompleted = [...state.completedUploads]
        const newFailed = [...state.failedUploads]

        Object.values(newUploads).forEach(upload => {
          if (upload.status === FileUploadStatus.UPLOADING) {
            activeCount++
          }
          if (upload.status === FileUploadStatus.COMPLETED && !newCompleted.includes(upload.tempId)) {
            newCompleted.push(upload.tempId)
          }
          if (upload.status === FileUploadStatus.FAILED && !newFailed.includes(upload.tempId)) {
            newFailed.push(upload.tempId)
          }
          totalBytes += upload.fileSize
          uploadedBytes += upload.bytesUploaded
        })

        const totalProgress = totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0
        const isUploading = activeCount > 0 || Object.values(newUploads).some(
          upload => upload.status === FileUploadStatus.PREPARING
        )

        return {
          uploads: newUploads,
          activeUploadCount: activeCount,
          isUploading,
          totalProgress,
          completedUploads: newCompleted,
          failedUploads: newFailed
        }
      }, false, 'updateUpload'),

      // 移除上传任务
      removeUpload: (tempId) => set((state) => {
        const { [tempId]: removed, ...remainingUploads } = state.uploads
        
        const activeCount = Object.values(remainingUploads).filter(
          upload => upload.status === FileUploadStatus.UPLOADING
        ).length

        const isUploading = activeCount > 0 || Object.values(remainingUploads).some(
          upload => upload.status === FileUploadStatus.PREPARING
        )

        return {
          uploads: remainingUploads,
          activeUploadCount: activeCount,
          isUploading,
          completedUploads: state.completedUploads.filter(id => id !== tempId),
          failedUploads: state.failedUploads.filter(id => id !== tempId)
        }
      }, false, 'removeUpload'),

      // 清空已完成的上传
      clearCompleted: () => set((state) => {
        const newUploads = { ...state.uploads }
        state.completedUploads.forEach(tempId => {
          delete newUploads[tempId]
        })

        return {
          uploads: newUploads,
          completedUploads: []
        }
      }, false, 'clearCompleted'),

      // 清空所有上传任务
      clearAll: () => set({
        uploads: {},
        activeUploadCount: 0,
        isUploading: false,
        totalProgress: 0,
        completedUploads: [],
        failedUploads: []
      }, false, 'clearAll'),

      // 取消上传
      cancelUpload: (tempId) => set((state) => {
        const upload = state.uploads[tempId]
        if (!upload) return state

        // 只有准备中或上传中的任务可以取消
        if (upload.status === FileUploadStatus.PREPARING || upload.status === FileUploadStatus.UPLOADING) {
          return get().updateUpload(tempId, { status: FileUploadStatus.CANCELLED })
        }

        return state
      }, false, 'cancelUpload'),

      // 暂停上传（简化实现，实际需要更复杂的逻辑）
      pauseUpload: (tempId) => set((state) => {
        console.log(`[FileUploadStore] Pause upload: ${tempId}`)
        // 实际实现需要在服务层面支持暂停
        return state
      }, false, 'pauseUpload'),

      // 恢复上传
      resumeUpload: (tempId) => set((state) => {
        console.log(`[FileUploadStore] Resume upload: ${tempId}`)
        // 实际实现需要在服务层面支持恢复
        return state
      }, false, 'resumeUpload'),

      // 重试上传
      retryUpload: (tempId) => set((state) => {
        const upload = state.uploads[tempId]
        if (!upload || upload.status !== FileUploadStatus.FAILED) {
          return state
        }

        // 重置上传状态
        const retriedUpload = {
          ...upload,
          status: FileUploadStatus.PREPARING,
          bytesUploaded: 0,
          percentage: 0,
          error: undefined
        }

        return {
          ...state,
          uploads: {
            ...state.uploads,
            [tempId]: retriedUpload
          },
          failedUploads: state.failedUploads.filter(id => id !== tempId),
          isUploading: true
        }
      }, false, 'retryUpload'),

      // 获取下一个排队的上传任务
      getNextQueuedUpload: () => {
        const state = get()
        if (state.activeUploadCount >= state.maxConcurrentUploads) {
          return null
        }

        const queuedUpload = Object.values(state.uploads).find(
          upload => upload.status === FileUploadStatus.PREPARING
        )

        return queuedUpload?.tempId || null
      },

      // 设置最大并发上传数
      setMaxConcurrentUploads: (max) => set({
        maxConcurrentUploads: Math.max(1, Math.min(max, 10)) // 限制在1-10之间
      }, false, 'setMaxConcurrentUploads'),

      // 获取上传统计信息
      getUploadStats: () => {
        const state = get()
        const uploads = Object.values(state.uploads)
        
        return {
          total: uploads.length,
          completed: uploads.filter(u => u.status === FileUploadStatus.COMPLETED).length,
          failed: uploads.filter(u => u.status === FileUploadStatus.FAILED).length,
          active: uploads.filter(u => u.status === FileUploadStatus.UPLOADING).length,
          queued: uploads.filter(u => u.status === FileUploadStatus.PREPARING).length
        }
      }
    }),
    {
      name: 'file-upload-store',
      partialize: (state) => ({
        // 只持久化必要的状态，不包括活动上传
        maxConcurrentUploads: state.maxConcurrentUploads,
        completedUploads: state.completedUploads.slice(-50), // 只保留最近50个
        failedUploads: state.failedUploads.slice(-50)
      })
    }
  )
)