import { useEffect, useMemo, useState } from 'react'
import { PublicThemeContext, THEME_STORAGE_KEY } from './public-theme-context.js'

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    // localStorage might not be available
  }

  return 'light'
}

const applyTheme = (theme) => {
  const htmlElement = document.documentElement

  if (theme === 'dark') {
    htmlElement.classList.add('dark')
    htmlElement.style.colorScheme = 'dark'
  } else {
    htmlElement.classList.remove('dark')
    htmlElement.style.colorScheme = 'light'
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage might not be available
  }
}

export const PublicThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(current => current === 'dark' ? 'light' : 'dark')
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    mounted: true,
  }), [theme])

  return (
    <PublicThemeContext.Provider value={value}>
      {children}
    </PublicThemeContext.Provider>
  )
}
