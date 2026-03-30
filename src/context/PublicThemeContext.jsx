import React, { createContext, useContext, useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'civilWorks_theme'

const PublicThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
})

export const usePublicTheme = () => {
  const context = useContext(PublicThemeContext)
  if (!context) {
    throw new Error('usePublicTheme must be used within PublicThemeProvider')
  }
  return context
}

const getInitialTheme = () => {
  // Check localStorage first
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    // localStorage might not be available
  }

  // Check OS preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }

  // Default to light
  return 'light'
}

export const PublicThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    setThemeState(initialTheme)
    
    // Apply to DOM
    const htmlElement = document.documentElement
    if (initialTheme === 'dark') {
      htmlElement.classList.add('dark')
      htmlElement.style.colorScheme = 'dark'
    } else {
      htmlElement.classList.remove('dark')
      htmlElement.style.colorScheme = 'light'
    }
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, initialTheme)
    } catch {
      // localStorage might not be available
    }
    
    setMounted(true)
  }, [])

  // Update theme when state changes
  useEffect(() => {
    if (!mounted) return

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
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(current => current === 'dark' ? 'light' : 'dark')
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    mounted,
  }

  return (
    <PublicThemeContext.Provider value={value}>
      {children}
    </PublicThemeContext.Provider>
  )
}
