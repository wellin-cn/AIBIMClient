import { ComponentProps } from '../../types'

interface AvatarProps extends ComponentProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'away' | 'busy' | 'offline'
  showStatus?: boolean
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  status,
  showStatus = false,
  className = ''
}) => {
  // 生成基于用户名的初始字母
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // 生成基于用户名的背景色
  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  }

  const avatarClasses = [
    'relative inline-flex items-center justify-center rounded-full font-medium',
    'text-white flex-shrink-0 theme-transition',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={avatarClasses}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // 如果图片加载失败，显示初始字母
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center rounded-full ${getBackgroundColor(name)}`}>
          {getInitials(name)}
        </div>
      )}
      
      {showStatus && status && (
        <span 
          className={`
            absolute bottom-0 right-0 block rounded-full border-2 border-white
            ${statusSizeClasses[size]} ${statusColors[status]}
            [data-theme="dark"] &:border-slate-900
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}