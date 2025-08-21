import React, { useRef, useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import { validateFile, formatFileSize, getFileTypeIcon } from '../../utils/fileValidation'
import { checkDragDropSupport } from '../../utils/fileUtils'

interface FileSelectorProps {
  onFileSelect: (files: File[]) => void
  onError?: (error: string) => void
  multiple?: boolean
  className?: string
  disabled?: boolean
  accept?: string
}

interface FilePreview {
  file: File
  id: string
  isValid: boolean
  error?: string
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  onFileSelect,
  onError,
  multiple = false,
  className = '',
  disabled = false,
  accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.json,.csv'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const supportsDragDrop = checkDragDropSupport()

  // 处理文件选择
  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled || isProcessing) return

    setIsProcessing(true)
    const fileArray = Array.from(files)
    const newPreviews: FilePreview[] = []
    const validFiles: File[] = []

    for (const file of fileArray) {
      const validation = validateFile(file)
      const preview: FilePreview = {
        file,
        id: `${file.name}_${Date.now()}_${Math.random()}`,
        isValid: validation.isValid,
        error: validation.error
      }

      newPreviews.push(preview)

      if (validation.isValid) {
        validFiles.push(file)
      } else if (onError) {
        onError(`${file.name}: ${validation.error}`)
      }
    }

    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews)

    if (validFiles.length > 0) {
      onFileSelect(validFiles)
    }

    setIsProcessing(false)
  }, [disabled, isProcessing, multiple, previews, onFileSelect, onError])

  // 点击选择文件
  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return
    fileInputRef.current?.click()
  }, [disabled, isProcessing])

  // 文件输入变化
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // 清空 input 值，允许重复选择同一文件
    e.target.value = ''
  }, [handleFiles])

  // 拖拽事件处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isProcessing && supportsDragDrop) {
      setIsDragging(true)
    }
  }, [disabled, isProcessing, supportsDragDrop])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // 只有当鼠标真正离开拖拽区域时才设置为 false
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || isProcessing) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [disabled, isProcessing, handleFiles])

  // 移除预览文件
  const removePreview = useCallback((id: string) => {
    setPreviews(prev => prev.filter(p => p.id !== id))
  }, [])

  // 清空所有预览
  const clearPreviews = useCallback(() => {
    setPreviews([])
  }, [])

  const dropZoneClasses = [
    'relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
    isDragging
      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
    disabled || isProcessing
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
    className
  ].filter(Boolean).join(' ')

  return (
    <div>
      {/* 文件拖拽区域 */}
      <div
        className={dropZoneClasses}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isProcessing}
        />

        <div className="space-y-3">
          {/* 文件图标 */}
          <div className="flex justify-center">
            <div className="text-4xl text-gray-400">
              {isProcessing ? '⏳' : '📁'}
            </div>
          </div>

          {/* 提示文字 */}
          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {isProcessing ? '正在处理文件...' : '选择文件上传'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {supportsDragDrop ? '拖拽文件到此处，或点击选择文件' : '点击选择文件'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              支持 PDF、DOC、图片、压缩包等格式，单文件最大 50MB
            </p>
          </div>

          {/* 选择按钮 */}
          <Button
            variant="primary"
            size="sm"
            disabled={disabled || isProcessing}
            className="mx-auto"
          >
            {isProcessing ? '处理中...' : '选择文件'}
          </Button>
        </div>
      </div>

      {/* 文件预览列表 */}
      {previews.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              已选择的文件 ({previews.length})
            </h4>
            <Button
              variant="text"
              size="sm"
              onClick={clearPreviews}
              className="text-red-600 hover:text-red-700"
            >
              清空
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {previews.map((preview) => (
              <div
                key={preview.id}
                className={`flex items-center p-3 rounded-lg border ${
                  preview.isValid
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                {/* 文件图标 */}
                <div className="text-xl mr-3">
                  {getFileTypeIcon(preview.file.name)}
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(preview.file.size)}
                    {preview.file.type && ` • ${preview.file.type}`}
                  </p>
                  {preview.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {preview.error}
                    </p>
                  )}
                </div>

                {/* 状态图标 */}
                <div className="ml-3">
                  {preview.isValid ? (
                    <div className="text-green-600 dark:text-green-400">✓</div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">✗</div>
                  )}
                </div>

                {/* 删除按钮 */}
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => removePreview(preview.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}