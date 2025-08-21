/**
 * 文件处理工具函数
 * 提供文件读取、编码、处理等功能
 */

/**
 * 将文件转换为 Base64 编码
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // 移除 data:mime;base64, 前缀，只返回 base64 编码部分
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('文件读取失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取出错'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 将文件转换为 ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('文件读取失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取出错'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 将文件分块，用于分块上传
 */
export function splitFileIntoChunks(file: File, chunkSize: number = 1024 * 1024): File[] {
  const chunks: File[] = []
  let start = 0
  
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    chunks.push(chunk as File)
    start = end
  }
  
  return chunks
}

/**
 * 计算文件的 MD5 哈希值（用于文件完整性检查）
 */
export async function calculateFileHash(file: File): Promise<string> {
  try {
    const buffer = await fileToArrayBuffer(file)
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    console.error('计算文件哈希失败:', error)
    throw new Error('文件哈希计算失败')
  }
}

/**
 * 生成唯一的临时文件ID
 */
export function generateTempFileId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 清理文件名，移除不安全的字符
 */
export function sanitizeFileName(fileName: string): string {
  // 移除或替换危险字符
  return fileName
    .replace(/[<>:"|?*]/g, '_')  // 替换 Windows 保留字符
    .replace(/\.\./g, '_')       // 替换路径遍历字符
    .replace(/^\./g, '_')        // 移除开头的点
    .replace(/\s+$/g, '')        // 移除末尾空格
    .substring(0, 100)           // 限制长度
}

/**
 * 检查浏览器是否支持文件API
 */
export function checkFileApiSupport(): boolean {
  return !!(
    window.File &&
    window.FileReader &&
    window.FileList &&
    window.Blob
  )
}

/**
 * 检查是否支持拖拽上传
 */
export function checkDragDropSupport(): boolean {
  const div = document.createElement('div')
  return (
    ('draggable' in div) ||
    ('ondragstart' in div && 'ondrop' in div)
  ) && 'FormData' in window && 'FileReader' in window
}

/**
 * 下载文件到本地
 */
export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 将 Blob 转换为下载链接
 */
export function createDownloadUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * 清理下载链接，释放内存
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 压缩图片文件（如果是图片类型）
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file) // 非图片文件直接返回
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'))
      return
    }
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      // 设置画布尺寸
      canvas.width = width
      canvas.height = height
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('图片压缩失败'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 获取文件的预览URL（用于图片预览）
 */
export function getFilePreviewUrl(file: File): string | null {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file)
  }
  return null
}

/**
 * 验证文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 验证文件是否为文档
 */
export function isDocumentFile(file: File): boolean {
  const documentMimes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  return documentMimes.includes(file.type)
}

/**
 * 批量处理文件列表
 */
export async function processFileList(
  files: FileList,
  processor: (file: File) => Promise<any>
): Promise<any[]> {
  const fileArray = Array.from(files)
  const results = []
  
  for (const file of fileArray) {
    try {
      const result = await processor(file)
      results.push(result)
    } catch (error) {
      console.error(`处理文件 ${file.name} 失败:`, error)
      results.push({ error: error instanceof Error ? error.message : '处理失败' })
    }
  }
  
  return results
}