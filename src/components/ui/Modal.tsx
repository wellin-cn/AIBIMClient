import { useEffect, useRef } from 'react'
import { ComponentProps } from '../../types'

interface ModalProps extends ComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  maskClosable?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closable = true,
  maskClosable = true,
  className = '',
  children
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // 处理ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closable) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, closable])

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // 处理点击遮罩关闭
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose()
    }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleMaskClick}
    >
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 模态框容器 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className={`
            relative w-full ${sizeClasses[size]} transform rounded-lg 
            bg-primary shadow-xl transition-all theme-transition
            ${className}
          `}
        >
          {/* 头部 */}
          {(title || closable) && (
            <div className="flex items-center justify-between p-6 border-b border-primary">
              {title && (
                <h3 className="text-lg font-semibold text-primary">
                  {title}
                </h3>
              )}
              
              {closable && (
                <button
                  onClick={onClose}
                  className="text-tertiary hover:text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* 内容区域 */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}