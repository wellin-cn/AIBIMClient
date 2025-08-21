import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Message, FileInfo } from '../../types'
import { formatFileSize, getFileTypeIcon, getFileTypeName } from '../../utils/fileValidation'
import { downloadFile, createDownloadUrl, revokeDownloadUrl } from '../../utils/fileUtils'

interface FileMessageItemProps {
  message: Message
  className?: string
}

export const FileMessageItem: React.FC<FileMessageItemProps> = ({
  message,
  className = ''
}) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showActions, setShowActions] = useState(false)

  const fileInfo = message.fileInfo
  if (!fileInfo) {
    return (
      <div className="text-red-500 text-sm">
        文件信息丢失
      </div>
    )
  }

  // 格式化时间显示
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 下载文件
  const handleDownload = async () => {
    if (!fileInfo.fileUrl || isDownloading) return

    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      console.log('📥 [FileMessage] Starting download:', fileInfo.originalName)

      // 模拟下载进度（实际应该从下载服务获取）
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 10
        })
      }, 200)

      // 创建下载请求
      const response = await fetch(fileInfo.fileUrl)
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`)
      }

      // 获取文件内容
      const blob = await response.blob()
      clearInterval(progressInterval)
      setDownloadProgress(100)

      // 创建下载链接并触发下载
      const downloadUrl = createDownloadUrl(blob)
      downloadFile(downloadUrl, fileInfo.originalName)

      // 清理URL
      setTimeout(() => revokeDownloadUrl(downloadUrl), 1000)

      console.log('✅ [FileMessage] Download completed:', fileInfo.originalName)
    } catch (error) {
      console.error('❌ [FileMessage] Download failed:', error)
      // 这里可以显示错误提示
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  // 复制文件链接
  const handleCopyLink = async () => {
    if (!fileInfo.fileUrl) return

    try {
      await navigator.clipboard.writeText(fileInfo.fileUrl)
      console.log('📋 [FileMessage] Link copied:', fileInfo.originalName)
      // 这里可以显示成功提示
    } catch (error) {
      console.error('❌ [FileMessage] Failed to copy link:', error)
    }
  }

  // 查看文件信息
  const handleShowInfo = () => {
    const info = [
      `文件名: ${fileInfo.originalName}`,
      `大小: ${formatFileSize(fileInfo.fileSize)}`,
      `类型: ${fileInfo.mimeType}`,
      `上传时间: ${fileInfo.uploadedAt.toLocaleString('zh-CN')}`,
      `发送者: ${message.sender.name}`
    ].join('\n')

    alert(info) // 简单实现，实际应该用模态框
  }

  const isOwn = message.sender.name === '我' // 简化判断，实际应该用用户ID

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-md ${isOwn ? 'ml-12' : 'mr-12'}`}>
        {/* 发送者和时间 */}
        <div className={`flex items-center mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {!isOwn && `${message.sender.name} `}
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* 文件消息卡片 */}
        <div
          className={`relative p-4 rounded-lg border ${
            isOwn
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* 文件图标和信息 */}
          <div className="flex items-start space-x-3">
            {/* 文件图标 */}
            <div className="text-2xl flex-shrink-0">
              {getFileTypeIcon(fileInfo.originalName)}
            </div>

            {/* 文件详情 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium truncate ${
                  isOwn ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {fileInfo.originalName}
                </h4>
              </div>
              
              <div className={`text-sm mt-1 ${
                isOwn ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {formatFileSize(fileInfo.fileSize)}
                {fileInfo.mimeType && (
                  <span className="ml-2">
                    • {getFileTypeName({ type: fileInfo.mimeType } as File)}
                  </span>
                )}
              </div>

              {/* 下载进度条 */}
              {isDownloading && (
                <div className="mt-3">
                  <div className={`w-full bg-opacity-30 rounded-full h-2 ${
                    isOwn ? 'bg-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOwn ? 'bg-white' : 'bg-blue-600'
                      }`}
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    正在下载... {downloadProgress.toFixed(0)}%
                  </p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center space-x-2 mt-3">
                <Button
                  variant={isOwn ? "secondary" : "primary"}
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading || !fileInfo.fileUrl}
                  className={`text-xs ${
                    isOwn 
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                      : ''
                  }`}
                >
                  {isDownloading ? '下载中...' : '⬇️ 下载'}
                </Button>

                {showActions && (
                  <>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={handleCopyLink}
                      disabled={!fileInfo.fileUrl}
                      className={`text-xs ${
                        isOwn 
                          ? 'text-white hover:text-blue-100' 
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      🔗 链接
                    </Button>

                    <Button
                      variant="text"
                      size="sm"
                      onClick={handleShowInfo}
                      className={`text-xs ${
                        isOwn 
                          ? 'text-white hover:text-blue-100' 
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      ℹ️ 详情
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 消息状态指示器 */}
          {isOwn && message.status && (
            <div className={`absolute bottom-1 right-1 text-xs ${
              message.status === 'sent' ? 'text-blue-100' :
              message.status === 'delivered' ? 'text-blue-200' :
              message.status === 'failed' ? 'text-red-300' :
              'text-blue-100'
            }`}>
              {message.status === 'sending' && '⏳'}
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'failed' && '❌'}
            </div>
          )}
        </div>

        {/* 文本内容（如果有） */}
        {message.content && message.content.trim() && (
          <div className={`mt-2 p-3 rounded-lg ${
            isOwn
              ? 'bg-blue-400 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}