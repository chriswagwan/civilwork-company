import { createContext } from 'react'

export const THEME_STORAGE_KEY = 'civilWorks_theme'

export const PublicThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: true,
})