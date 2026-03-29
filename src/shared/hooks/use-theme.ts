import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  return stored ?? getSystemTheme()
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * useTheme — Consume el contexto de tema.
 * Debe usarse dentro de `ThemeProvider`.
 */
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

/**
 * useThemeProvider — Hook interno que gestiona el estado de tema.
 * Se llama UNA sola vez en `ThemeProvider`.
 */
export const useThemeProvider = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleColorSchemeChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange)
    return () => colorSchemeQuery.removeEventListener('change', handleColorSchemeChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const isDark = theme === 'dark'

  return { theme, isDark, toggleTheme }
}

export { ThemeContext }
