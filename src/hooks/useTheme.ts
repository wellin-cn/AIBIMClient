import { useEffect, useCallback } from 'react'
import { useUIStore } from '../store/uiStore'

type Theme = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
  effectiveTheme: 'light' | 'dark'
}

export const useTheme = (): UseThemeReturn => {
  const { theme, setTheme: setStoreTheme } = useUIStore()

  // 获取实际生效的主题
  const getEffectiveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeValue
  }, [])

  const effectiveTheme = getEffectiveTheme(theme)

  // 应用主题到DOM
  const applyTheme = useCallback((themeValue: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', themeValue)
  }, [])

  // 设置主题
  const setTheme = useCallback((newTheme: Theme) => {
    setStoreTheme(newTheme)
  }, [setStoreTheme])

  // 切换主题（在light和dark之间切换，不包括system）
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // 如果当前是系统主题，切换到相反的固定主题
      const currentEffective = getEffectiveTheme('system')
      setTheme(currentEffective === 'light' ? 'dark' : 'light')
    } else {
      // 在light和dark之间切换
      setTheme(theme === 'light' ? 'dark' : 'light')
    }
  }, [theme, setTheme, getEffectiveTheme])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const newEffectiveTheme = getEffectiveTheme('system')
        applyTheme(newEffectiveTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme, getEffectiveTheme])

  // 应用主题变化
  useEffect(() => {
    applyTheme(effectiveTheme)
  }, [effectiveTheme, applyTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    effectiveTheme,
  }
}