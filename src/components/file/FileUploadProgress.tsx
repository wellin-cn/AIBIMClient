import React from 'react'
import { Button } from '../ui/Button'
import { FileUploadProgress as FileUploadProgressType, FileUploadStatus } from '../../types'
import { formatFileSize, getFileTypeIcon } from '../../utils/fileValidation'

interface FileUploadProgressProps {
  uploadProgress: FileUploadProgressType
  onCancel?: (tempId: string) => void
  onRetry?: (tempId: string) => void
  className?: string
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  uploadProgress,
  onCancel,
  onRetry,
  className = ''
}) => {
  const {
    tempId,
    fileName,
    fileSize,
    bytesUploaded,
    percentage,
    status,
    error
  } = uploadProgress

  // 获取状态显示信息
  const getStatusInfo = () => {
    switch (status) {
      case FileUploadStatus.PREPARING:
        return {
          text: '准备上传...',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case FileUploadStatus.UPLOADING:
        return {
          text: `正在上传... (${formatFileSize(bytesUploaded)}/${formatFileSize(fileSize)})`,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case FileUploadStatus.COMPLETING:
        return {
          text: '完成上传...',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case FileUploadStatus.COMPLETED:
        return {
          text: '上传完成',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case FileUploadStatus.FAILED:
        return {
          text: '上传失败',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        }
      case FileUploadStatus.CANCELLED:
        return {
          text: '已取消',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        }
      default:
        return {
          text: '未知状态',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        }
    }
  }

  // 计算上传速度（简化版本，实际应该基于时间计算）
  const getUploadSpeed = () => {
    if (status === FileUploadStatus.UPLOADING && percentage > 0) {
      // 这里是一个简化的速度计算，实际应该基于真实的时间差
      const estimatedTotalTime = 10 // 假设总共需要10秒
      const elapsedTime = (percentage / 100) * estimatedTotalTime
      const speed = bytesUploaded / Math.max(elapsedTime, 1)
      return formatFileSize(speed) + '/s'
    }
    return null
  }

  // 计算剩余时间
  const getRemainingTime = () => {
    if (status === FileUploadStatus.UPLOADING && percentage > 0 && percentage < 100) {
      const remainingBytes = fileSize - bytesUploaded
      const speed = getUploadSpeed()
      if (speed && remainingBytes > 0) {
        // 简化计算，实际应该更精确
        const remainingSeconds = Math.ceil(remainingBytes / (bytesUploaded / 10))
        if (remainingSeconds < 60) {
          return `${remainingSeconds}秒`
        } else {
          const minutes = Math.floor(remainingSeconds / 60)
          return `${minutes}分钟`
        }
      }
    }
    return null
  }

  const statusInfo = getStatusInfo()
  const uploadSpeed = getUploadSpeed()
  const remainingTime = getRemainingTime()

  return (
    <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} ${className}`}>
      <div className="flex items-start space-x-3">
        {/* 文件图标 */}
        <div className="text-xl flex-shrink-0 mt-1">
          {getFileTypeIcon(fileName)}
        </div>

        {/* 文件信息和进度 */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* 文件名和大小 */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {fileName}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatFileSize(fileSize)}
            </span>
          </div>

          {/* 进度条 */}
          {(status === FileUploadStatus.UPLOADING || status === FileUploadStatus.PREPARING) && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={statusInfo.color}>
                  {percentage.toFixed(1)}%
                </span>
                {uploadSpeed && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {uploadSpeed}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 状态信息 */}
          <div className="flex items-center justify-between">
            <span className={`text-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {remainingTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                剩余 {remainingTime}
              </span>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border">
              {error}
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col space-y-1">
          {/* 取消按钮 */}
          {(status === FileUploadStatus.PREPARING || status === FileUploadStatus.UPLOADING) && onCancel && (
            <Button
              variant="text"
              size="sm"
              onClick={() => onCancel(tempId)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1"
              title="取消上传"
            >
              ✕
            </Button>
          )}

          {/* 重试按钮 */}
          {status === FileUploadStatus.FAILED && onRetry && (
            <Button
              variant="text"
              size="sm"
              onClick={() => onRetry(tempId)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1"
              title="重试上传"
            >
              ↻
            </Button>
          )}

          {/* 完成状态的删除按钮 */}
          {(status === FileUploadStatus.COMPLETED || status === FileUploadStatus.CANCELLED) && onCancel && (
            <Button
              variant="text"
              size="sm"
              onClick={() => onCancel(tempId)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1"
              title="移除"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* 详细进度信息（仅在上传中显示） */}
      {status === FileUploadStatus.UPLOADING && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">已上传:</span> {formatFileSize(bytesUploaded)}
            </div>
            <div>
              <span className="font-medium">总大小:</span> {formatFileSize(fileSize)}
            </div>
            {uploadSpeed && (
              <div>
                <span className="font-medium">上传速度:</span> {uploadSpeed}
              </div>
            )}
            {remainingTime && (
              <div>
                <span className="font-medium">剩余时间:</span> {remainingTime}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}