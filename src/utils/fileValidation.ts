/**
 * 文件验证工具
 * 基于 shared/docs/file-transfer-spec.md 规范
 */

// 支持的文件类型定义
export const ALLOWED_FILE_TYPES = {
  // 文档类型
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  
  // 图片类型
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  
  // 压缩文件
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  
  // 其他常用类型
  'application/json': '.json',
  'text/csv': '.csv'
} as const

// 文件大小限制（50MB）
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes
export const MAX_FILENAME_LENGTH = 100

// 禁止的文件扩展名
const FORBIDDEN_EXTENSIONS = [
  // 可执行文件
  '.exe', '.bat', '.sh', '.cmd', '.scr', '.com', '.pif',
  // 脚本文件
  '.js', '.vbs', '.ps1', '.py', '.php', '.rb', '.pl',
  // 系统文件
  '.dll', '.sys', '.drv', '.ini'
]

// 危险文件名模式
const DANGEROUS_FILENAME_PATTERNS = [
  /\.\./,           // 路径遍历
  /[<>:"|?*]/,      // Windows 保留字符
  /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows 保留名称
  /^\./,            // 隐藏文件
  /\s+$/,           // 末尾空格
]

/**
 * 文件验证结果
 */
export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileInfo?: {
    name: string
    size: number
    type: string
    extension: string
  }
}

/**
 * 验证文件类型是否被支持
 */
export function validateFileType(file: File): boolean {
  // 检查 MIME 类型
  if (file.type && Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return true
  }
  
  // 检查文件扩展名
  const extension = getFileExtension(file.name).toLowerCase()
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES)
    .join(',')
    .split(',')
    .map(ext => ext.trim())
  
  return allowedExtensions.includes(extension)
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * 验证文件名安全性
 */
export function validateFileName(fileName: string): boolean {
  // 检查文件名长度
  if (fileName.length > MAX_FILENAME_LENGTH) {
    return false
  }
  
  // 检查禁止的扩展名
  const extension = getFileExtension(fileName).toLowerCase()
  if (FORBIDDEN_EXTENSIONS.includes(extension)) {
    return false
  }
  
  // 检查危险文件名模式
  for (const pattern of DANGEROUS_FILENAME_PATTERNS) {
    if (pattern.test(fileName)) {
      return false
    }
  }
  
  return true
}

/**
 * 完整文件验证
 */
export function validateFile(file: File): FileValidationResult {
  try {
    // 验证文件名安全性
    if (!validateFileName(file.name)) {
      return {
        isValid: false,
        error: '文件名包含非法字符或格式不正确'
      }
    }
    
    // 验证文件类型
    if (!validateFileType(file)) {
      return {
        isValid: false,
        error: '不支持的文件类型'
      }
    }
    
    // 验证文件大小
    if (!validateFileSize(file)) {
      return {
        isValid: false,
        error: `文件大小超过限制（最大 ${formatFileSize(MAX_FILE_SIZE)}）`
      }
    }
    
    // 验证通过
    return {
      isValid: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        extension: getFileExtension(file.name)
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: '文件验证失败：' + (error instanceof Error ? error.message : '未知错误')
    }
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > 0 ? fileName.slice(lastDotIndex) : ''
}

/**
 * 根据文件扩展名获取文件类型图标
 */
export function getFileTypeIcon(fileName: string): string {
  const extension = getFileExtension(fileName).toLowerCase()
  
  const iconMap: Record<string, string> = {
    // 文档
    '.pdf': '📄',
    '.doc': '📝',
    '.docx': '📝',
    '.txt': '📃',
    
    // 图片
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.png': '🖼️',
    '.gif': '🎞️',
    '.webp': '🖼️',
    
    // 压缩文件
    '.zip': '🗜️',
    '.rar': '🗜️',
    
    // 其他
    '.json': '🔧',
    '.csv': '📊'
  }
  
  return iconMap[extension] || '📎'
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件类型的友好显示名称
 */
export function getFileTypeName(file: File): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF 文档',
    'text/plain': '文本文件',
    'application/msword': 'Word 文档',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word 文档',
    'image/jpeg': 'JPEG 图片',
    'image/png': 'PNG 图片',
    'image/gif': 'GIF 图片',
    'image/webp': 'WebP 图片',
    'application/zip': 'ZIP 压缩包',
    'application/x-rar-compressed': 'RAR 压缩包',
    'application/json': 'JSON 文件',
    'text/csv': 'CSV 文件'
  }
  
  return typeMap[file.type] || '未知类型'
}