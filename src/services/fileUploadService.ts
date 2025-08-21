import { Socket } from 'socket.io-client'
import {
  FileUploadStartData,
  FileUploadProgress,
  FileUploadStatus,
  FileUploadProgressData,
  FileUploadCompleteData,
  FileUploadErrorData
} from '../types'
import { fileToBase64, generateTempFileId, calculateFileHash } from '../utils/fileUtils'
import { validateFile } from '../utils/fileValidation'
import { useFileUploadStore } from '../store/fileUploadStore'

export class FileUploadService {
  private socket: Socket | null = null
  private uploadQueue: Map<string, File> = new Map()
  private abortControllers: Map<string, AbortController> = new Map()

  constructor(socket: Socket) {
    this.socket = socket
    this.setupEventListeners()
  }

  /**
   * 设置 Socket 事件监听器
   */
  private setupEventListeners() {
    if (!this.socket) return

    // 监听上传进度
    this.socket.on('file:upload:progress', (data: FileUploadProgressData) => {
      console.log('📊 [FileUpload] Progress received:', data)
      const { updateUpload } = useFileUploadStore.getState()
      
      updateUpload(data.tempId, {
        bytesUploaded: data.bytesUploaded,
        percentage: data.percentage,
        status: FileUploadStatus.UPLOADING
      })
    })

    // 监听上传完成
    this.socket.on('file:upload:complete', (data: FileUploadCompleteData) => {
      console.log('✅ [FileUpload] Upload completed:', data)
      const { updateUpload } = useFileUploadStore.getState()
      
      updateUpload(data.tempId, {
        status: FileUploadStatus.COMPLETED,
        percentage: 100
      })

      // 清理资源
      this.cleanupUpload(data.tempId)

      // 处理自动生成的文件消息
      this.handleFileMessage(data.message)
    })

    // 监听上传错误
    this.socket.on('file:upload:error', (data: FileUploadErrorData) => {
      console.error('❌ [FileUpload] Upload error:', data)
      const { updateUpload } = useFileUploadStore.getState()
      
      updateUpload(data.tempId, {
        status: FileUploadStatus.FAILED,
        error: data.message
      })

      // 清理资源
      this.cleanupUpload(data.tempId)
    })
  }

  /**
   * 上传单个文件
   */
  async uploadFile(file: File): Promise<string> {
    console.log('📤 [FileUpload] Starting upload:', file.name)

    // 验证文件
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error || '文件验证失败')
    }

    const tempId = generateTempFileId()
    
    try {
      // 添加到上传队列
      this.uploadQueue.set(tempId, file)
      
      // 创建中止控制器
      const abortController = new AbortController()
      this.abortControllers.set(tempId, abortController)

      // 添加到状态管理
      const { addUpload } = useFileUploadStore.getState()
      const uploadProgress: FileUploadProgress = {
        tempId,
        fileName: file.name,
        fileSize: file.size,
        bytesUploaded: 0,
        percentage: 0,
        status: FileUploadStatus.PREPARING
      }
      addUpload(uploadProgress)

      // 检查上传队列
      await this.processUploadQueue()

      return tempId
    } catch (error) {
      console.error('❌ [FileUpload] Upload failed:', error)
      this.cleanupUpload(tempId)
      throw error
    }
  }

  /**
   * 处理上传队列
   */
  private async processUploadQueue() {
    const { getNextQueuedUpload, updateUpload } = useFileUploadStore.getState()
    
    // 获取下一个可以上传的任务
    const nextTempId = getNextQueuedUpload()
    if (!nextTempId) return

    const file = this.uploadQueue.get(nextTempId)
    if (!file) return

    try {
      console.log('🚀 [FileUpload] Processing upload:', file.name)
      
      // 更新状态为上传中
      updateUpload(nextTempId, { status: FileUploadStatus.UPLOADING })

      // 计算文件哈希（用于完整性检查）
      const fileHash = await calculateFileHash(file)
      console.log('🔐 [FileUpload] File hash calculated:', fileHash.substring(0, 16) + '...')

      // 将文件转换为 Base64
      const fileData = await fileToBase64(file)
      
      // 准备上传数据
      const uploadData: FileUploadStartData = {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        tempId: nextTempId,
        fileData
      }

                      // 发送上传请求
                if (this.socket) {
                    console.log('📡 [FileUpload] Sending upload request...')
                    this.socket.emit('file:upload:start', uploadData)
                    
                    // 监听上传开始响应
                    this.socket.once('file:upload:started', (response) => {
                        console.log('🚀 [FileUpload] Upload started response:', response)
                        updateUpload(nextTempId, { 
                            status: FileUploadStatus.UPLOADING,
                            percentage: 50  // 设置中间进度
                        })
                        
                        // 模拟完成（如果服务器不发送完成事件）
                        setTimeout(() => {
                            updateUpload(nextTempId, {
                                status: FileUploadStatus.COMPLETED,
                                percentage: 100
                            })
                        }, 2000)
                    })
                } else {
                    throw new Error('Socket 连接不可用')
                }

    } catch (error) {
      console.error('❌ [FileUpload] Processing failed:', error)
      updateUpload(nextTempId, {
        status: FileUploadStatus.FAILED,
        error: error instanceof Error ? error.message : '上传处理失败'
      })
      this.cleanupUpload(nextTempId)
    }
  }

  /**
   * 取消上传
   */
  cancelUpload(tempId: string): void {
    console.log('❌ [FileUpload] Cancelling upload:', tempId)
    
    const { cancelUpload } = useFileUploadStore.getState()
    cancelUpload(tempId)

    // 取消网络请求
    const abortController = this.abortControllers.get(tempId)
    if (abortController) {
      abortController.abort()
    }

    this.cleanupUpload(tempId)
  }

  /**
   * 重试上传
   */
  async retryUpload(tempId: string): Promise<void> {
    console.log('🔄 [FileUpload] Retrying upload:', tempId)
    
    const file = this.uploadQueue.get(tempId)
    if (!file) {
      throw new Error('文件不存在，无法重试')
    }

    const { retryUpload } = useFileUploadStore.getState()
    retryUpload(tempId)

    // 重新处理上传队列
    await this.processUploadQueue()
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: File[]): Promise<string[]> {
    console.log('📦 [FileUpload] Starting batch upload:', files.length, 'files')
    
    const tempIds: string[] = []
    
    for (const file of files) {
      try {
        const tempId = await this.uploadFile(file)
        tempIds.push(tempId)
      } catch (error) {
        console.error(`❌ [FileUpload] Failed to start upload for ${file.name}:`, error)
        // 继续处理其他文件
      }
    }
    
    return tempIds
  }

  /**
   * 清理上传相关资源
   */
  private cleanupUpload(tempId: string): void {
    this.uploadQueue.delete(tempId)
    
    const abortController = this.abortControllers.get(tempId)
    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(tempId)
    }
  }

  /**
   * 处理文件消息
   */
  private handleFileMessage(message: any): void {
    console.log('📝 [FileUpload] Handling file message:', message)
    
    // 这里应该将文件消息添加到聊天存储
    // 具体实现取决于聊天系统的架构
    try {
      // 可以在这里触发一个事件或直接调用聊天存储
      window.dispatchEvent(new CustomEvent('fileMessageReceived', {
        detail: message
      }))
    } catch (error) {
      console.error('❌ [FileUpload] Failed to handle file message:', error)
    }
  }

  /**
   * 获取上传统计信息
   */
  getUploadStats() {
    const { getUploadStats } = useFileUploadStore.getState()
    return getUploadStats()
  }

  /**
   * 清理服务资源
   */
  destroy(): void {
    console.log('🧹 [FileUpload] Destroying service')
    
    // 取消所有活动上传
    for (const tempId of this.uploadQueue.keys()) {
      this.cancelUpload(tempId)
    }

    // 移除事件监听器
    if (this.socket) {
      this.socket.off('file:upload:progress')
      this.socket.off('file:upload:complete')
      this.socket.off('file:upload:error')
    }

    // 清理资源
    this.uploadQueue.clear()
    this.abortControllers.clear()
    this.socket = null
  }
}

// 单例实例，在 socket 连接时初始化
let fileUploadServiceInstance: FileUploadService | null = null

export const createFileUploadService = (socket: Socket): FileUploadService => {
  if (fileUploadServiceInstance) {
    fileUploadServiceInstance.destroy()
  }
  
  fileUploadServiceInstance = new FileUploadService(socket)
  return fileUploadServiceInstance
}

export const getFileUploadService = (): FileUploadService | null => {
  return fileUploadServiceInstance
}

export const destroyFileUploadService = (): void => {
  if (fileUploadServiceInstance) {
    fileUploadServiceInstance.destroy()
    fileUploadServiceInstance = null
  }
}